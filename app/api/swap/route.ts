import { NextResponse, unstable_after as after } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { FEE_PERCENTAGE } from "@/lib/xrp/constants";
import { decryptToken } from "@/lib/token";
import { getToken } from "@/lib/middleware/utils/get-token";
import { Wallet, xrpToDrops, PaymentFlags, TrustSet, Payment } from "xrpl";
import { xrpClient } from "@/lib/xrp/http-client";

export const maxDuration = 40;

type SwapRequest = {
  from: {
    value: string;
    currency: string;
    issuer: string;
    rawCurrency: string;
  };
  to: {
    value: string;
    currency: string;
    issuer: string;
    rawCurrency: string;
  };
  slippage: number;
  password: string;
  // isMax: boolean;
  // balance: number;
};

export const POST = withWallet(async ({ req }) => {
  try {
    const { from, to, slippage, password } = (await req.json()) as SwapRequest;

    // Validate request
    if (!from || !to || !password) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (!from.value || isNaN(Number(from.value)) || Number(from.value) <= 0) {
      return NextResponse.json({ error: "Invalid 'from' value" }, { status: 400 });
    }
    if (slippage < 1 || slippage > 50) {
      return NextResponse.json({ error: "Invalid slippage" }, { status: 400 });
    }

    // Get token and decrypt credentials
    const token = await getToken();
    const { privateKey, publicKey } = await decryptToken(token as string, password);
    if (!privateKey || !publicKey) {
      return NextResponse.json({ error: "Invalid password or token" }, { status: 401 });
    }

    // Setup wallet
    const wallet = new Wallet(publicKey, privateKey);

    // Calculate platform fees
    const fee = FEE_PERCENTAGE;
    let ourFeeInDrops = 0;

    if (from.currency === "XRP" && !from.issuer) {
      // Calculate fee for XRP swaps
      ourFeeInDrops = Math.floor(Number(from.value) * 1_000_000 * fee);

      const balance = await xrpClient.getXrpBalance(wallet.address);
      const networkFee = (await xrpClient.getNetworkFee()) * 2;
      const reserves = await calculateReserves(wallet.address);
      const toSwapInDrops = Math.floor(Number(from.value) * 1_000_000);
      const totalNeeded = toSwapInDrops + ourFeeInDrops + networkFee; // Include network fee

      const availableBalance = balance - reserves - networkFee;
      if (availableBalance < totalNeeded) {
        return NextResponse.json({ error: "Insufficient XRP balance" }, { status: 400 });
      }
    } else {
      // For custom token swaps, check liquidity via order book
      // fetch price from xrplmetadata api
      const res = await fetch(`https://s1.xrplmeta.org/token/${from.rawCurrency}:${from.issuer}`);

      if (!res.ok) {
        return NextResponse.json({ error: "Error swapping tokens" }, { status: 400 });
      }

      const data = await res.json();
      const price = data.metrics?.price; // price in terms of XRP
      const xrpEquivalent = price * Number(from.value);
      ourFeeInDrops = Math.floor(xrpEquivalent * 1_000_000 * fee);

      // check if user has enough balance in xrp
      const xrpBalance = await xrpClient.getXrpBalance(wallet.address);
      const reserves = await calculateReserves(wallet.address);
      const totalNeeded = ourFeeInDrops + reserves + 10_000; // include network fee
      if (xrpBalance * 1_000_000 < totalNeeded) {
        return NextResponse.json({ error: "Insufficient XRP balance" }, { status: 400 });
      }
    }

    // check if to is a custom token
    // and setup trust line if needed
    if (to.currency !== "XRP") {
      const accountLines = await xrpClient.getAccountLines(wallet.address);
      const trustLine = accountLines.result.lines.find(
        (line) => line.currency === to.rawCurrency && line.account === to.issuer,
      );
      // get balance of the token swaping to
      const balances = await xrpClient.getBalances(wallet.address);
      const tokenBalance = balances.find((balance) => balance.currency === to.rawCurrency);
      const totalBalanceNeeded = Number(tokenBalance?.value) || 0 + Number(to.value);
      if (!trustLine || Number(trustLine.limit) < totalBalanceNeeded) {
        const trustSet: TrustSet = {
          TransactionType: "TrustSet" as const,
          Account: wallet.address,
          LimitAmount: {
            currency: to.rawCurrency,
            issuer: to.issuer,
            value: "1000000000",
          },
          // Flags: 0x00020000,
        };
        const networkFee = await xrpClient.getNetworkFee();
        const sequence = await xrpClient.getSequence(wallet.address);
        const currentLedger = await xrpClient.getLedgerIndex();
        const prepared: TrustSet = {
          ...trustSet,
          Fee: networkFee.toString(),
          Sequence: sequence,
          LastLedgerSequence: currentLedger + 20, // give it some time to confirm
        };
        const signed = wallet.sign(prepared);
        const tx = await xrpClient.submitAndWait(signed.tx_blob);
        console.log("Trust line set:", tx);
      }
    }

    // Prepare Payment transaction
    const slippageMultiplier = 1 - slippage / 100;

    const sendMax =
      from.currency === "XRP" && !from.issuer
        ? xrpToDrops(Number(from.value).toFixed(6))
        : {
            currency: from.rawCurrency,
            issuer: from.issuer,
            value: from.value,
          };

    const amount =
      to.currency === "XRP" && !to.issuer
        ? xrpToDrops(Number(to.value).toFixed(6))
        : {
            currency: to.rawCurrency,
            issuer: to.issuer,
            value: Number(to.value).toFixed(6),
          };

    const deliverMin =
      to.currency === "XRP" && !to.issuer
        ? xrpToDrops((Number(to.value) * slippageMultiplier).toFixed(6))
        : {
            currency: to.rawCurrency,
            issuer: to.issuer,
            value: (Number(to.value) * slippageMultiplier).toFixed(6),
          };

    const payment: Payment = {
      TransactionType: "Payment" as const,
      Account: wallet.address,
      Destination: wallet.address,
      Amount: amount,
      DeliverMin: deliverMin,
      SendMax: sendMax,
      Flags: PaymentFlags.tfPartialPayment,
    };

    console.log("Payment:", payment);

    // Autofill, sign, and submit transaction
    const networkFee = await xrpClient.getNetworkFee();
    const sequence = await xrpClient.getSequence(wallet.address);
    const currentLedger = await xrpClient.getLedgerIndex();
    const prepared: Payment = {
      ...payment,
      Fee: networkFee.toString(),
      Sequence: sequence,
      LastLedgerSequence: currentLedger + 20,
    };
    const signed = wallet.sign(prepared);
    const tx = await xrpClient.submitAndWait(signed.tx_blob);
    console.log(tx);

    if (typeof tx.result.meta === "object") {
      const status = tx.result.meta.TransactionResult;
      console.log("Transaction result:", status);

      if (status !== "tesSUCCESS") {
        // if status is not tesSUCCESS, remove trust line (if exists and balance is 0)
        // we need to check for this because the transaction might fail
        // and we set the trust line before the transaction is submitted
        // and we don't want to leave a trust line if the transaction fails
        after(async () => {
          setTimeout(async () => {
            const accountLines = await xrpClient.getAccountLines(wallet.address);

            const trust = accountLines.result?.lines.find(
              (line) => line.currency === to.rawCurrency && line.account === to.issuer,
            );
            console.log("Trust line:", trust);
            if (trust && trust.balance === "0") {
              // Remove trust line by setting limit to 0
              const trustSet: TrustSet = {
                Account: wallet.address,
                TransactionType: "TrustSet",
                LimitAmount: {
                  currency: to.rawCurrency,
                  issuer: to.issuer,
                  value: "0",
                },
                Flags: 0x00020000,
              };
              const networkFee = await xrpClient.getNetworkFee();
              const sequence = await xrpClient.getSequence(wallet.address);
              const currentLedger = await xrpClient.getLedgerIndex();
              const prepared: TrustSet = {
                ...trustSet,
                Fee: networkFee.toString(),
                Sequence: sequence,
                LastLedgerSequence: currentLedger + 20,
              };
              const signed = wallet.sign(prepared);
              const tx = await xrpClient.submit(signed.tx_blob);
              console.log("Trust line removed:", tx);
            }
          }, 4000);
        });

        // check for tecPATH_DRY or tecPATH_PARTIAL
        if (status === "tecPATH_DRY" || status === "tecPATH_PARTIAL") {
          // if status is tecPATH_DRY, means there is no liquidity for the swap
          return NextResponse.json(
            { error: "No liquidity available for this swap" },
            { status: 400 },
          );
        }
        return NextResponse.json({ error: "Transaction failed" }, { status: 400 });
      }
    }

    // Send platform fee to fee wallet
    after(async () => {
      if (ourFeeInDrops > 0) {
        const feeWallet = process.env.FEE_WALLET_ADDRESS!;
        const feeTxDetails = {
          TransactionType: "Payment" as const,
          Destination: feeWallet,
          Amount: ourFeeInDrops.toString(),
          Account: wallet.address,
        };

        const networkFee = await xrpClient.getNetworkFee();
        const sequence = await xrpClient.getSequence(wallet.address);
        const currentLedger = await xrpClient.getLedgerIndex();
        const feePrepared: Payment = {
          ...feeTxDetails,
          Fee: networkFee.toString(),
          Sequence: sequence,
          LastLedgerSequence: currentLedger + 20,
        };
        const feeSigned = wallet.sign(feePrepared);

        try {
          const feeTx = await xrpClient.submitAndWait(feeSigned.tx_blob);
          console.log("Fee Transaction result:", feeTx);
        } catch (e) {
          console.error("Error sending fee transaction:", e);
        }
      }

      // remove trust line if sending from a custom token
      // and balance is 0
      setTimeout(async () => {
        const accountLines = await xrpClient.getAccountLines(wallet.address);
        console.log("Account lines:", accountLines);

        const trust = accountLines.result?.lines.find(
          (line) => line.currency === from.rawCurrency && line.account === from.issuer,
        );

        if (trust && trust.balance === "0") {
          // Remove trust line by setting limit to 0
          const trustSet: TrustSet = {
            Account: wallet.address,
            TransactionType: "TrustSet",
            LimitAmount: {
              currency: from.rawCurrency,
              issuer: from.issuer,
              value: "0",
            },
            Flags: 0x00020000,
          };
          const networkFee = await xrpClient.getNetworkFee();
          const sequence = await xrpClient.getSequence(wallet.address);
          const currentLedger = await xrpClient.getLedgerIndex();
          const prepared: TrustSet = {
            ...trustSet,
            Fee: networkFee.toString(),
            Sequence: sequence,
            LastLedgerSequence: currentLedger + 20,
          };
          const signed = wallet.sign(prepared);
          const tx = await xrpClient.submit(signed.tx_blob);
          console.log("Trust line removed:", tx);
        }
      }, 4000); // Wait for 4 seconds before removing trust line so the transaction can be confirmed
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error processing swap" }, { status: 500 });
  }
});

// Helper function to calculate required reserves with new values
async function calculateReserves(address: string) {
  const accountInfo = await xrpClient.getAccountInfo(address);
  // Base reserve (1 XRP)
  const baseReserve = 1_000_000; // in drops
  // Owner reserve (0.2 XRP per owned object)
  const ownerCount = accountInfo.result.account_data.OwnerCount;
  const ownerReserve = ownerCount * 200_000; // 0.2 XRP = 200,000 drops per item
  return baseReserve + ownerReserve;
}
