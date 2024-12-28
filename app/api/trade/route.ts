import { NextResponse, unstable_after as after } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { FEE_PERCENTAGE } from "@/lib/xrp/constants";
import { decryptToken } from "@/lib/token";
import { getToken } from "@/lib/middleware/utils/get-token";
import { Wallet, PaymentFlags, Payment, dropsToXrp } from "xrpl";
import { xrpClient } from "@/lib/xrp/http-client";
import { resend } from "@/utils/resend";
import { Amount } from "xrpl";

export const maxDuration = 40;

type TradeRequest = {
  transaction: {
    type: "sell" | "buy";
    amountToDeliver: Amount;
    amountToReceive: Amount;
    slippage: number;
  };
  password: string;
};

export const POST = withWallet(async ({ req }) => {
  try {
    const { transaction, password } = (await req.json()) as TradeRequest;
    const { amountToDeliver, amountToReceive, slippage } = transaction;

    // Add validation helpers
    const isValidAddress = (address: string): boolean => {
      return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address);
    };

    const isValidCurrency = (currency: string): boolean => {
      // XRP currency code is special case
      if (currency === "XRP") return true;
      // Standard 3-char currency codes
      if (/^[A-Z0-9]{3}$/.test(currency)) return true;
      // Hex currency codes must be 40 chars
      if (/^[A-F0-9]{40}$/i.test(currency)) return true;
      return false;
    };

    // Validate token inputs
    if (typeof amountToDeliver !== "string") {
      if (!isValidAddress(amountToDeliver.issuer)) {
        return NextResponse.json(
          { error: "Invalid delivery token issuer address" },
          { status: 400 },
        );
      }
      if (!isValidCurrency(amountToDeliver.currency)) {
        return NextResponse.json({ error: "Invalid delivery token currency" }, { status: 400 });
      }
      if (isNaN(Number(amountToDeliver.value)) || Number(amountToDeliver.value) <= 0) {
        return NextResponse.json({ error: "Invalid delivery amount" }, { status: 400 });
      }
    }

    if (typeof amountToReceive !== "string") {
      if (!isValidAddress(amountToReceive.issuer)) {
        return NextResponse.json(
          { error: "Invalid receive token issuer address" },
          { status: 400 },
        );
      }
      if (!isValidCurrency(amountToReceive.currency)) {
        return NextResponse.json({ error: "Invalid receive token currency" }, { status: 400 });
      }
      if (isNaN(Number(amountToReceive.value)) || Number(amountToReceive.value) <= 0) {
        return NextResponse.json({ error: "Invalid receive amount" }, { status: 400 });
      }
    }

    // Validate request
    if (!amountToDeliver || !amountToReceive || !password) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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

    // Prevent self-issuance attacks
    if (typeof amountToDeliver !== "string" && amountToDeliver.issuer === wallet.address) {
      return NextResponse.json({ error: "Cannot trade self-issued tokens" }, { status: 400 });
    }
    if (typeof amountToReceive !== "string" && amountToReceive.issuer === wallet.address) {
      return NextResponse.json({ error: "Cannot trade self-issued tokens" }, { status: 400 });
    }

    // Calculate platform fees
    const fee = FEE_PERCENTAGE;
    let ourFeeInDrops = 0;

    const isXRPDelivery = typeof amountToDeliver === "string";
    if (isXRPDelivery) {
      // Calculate fee for XRP trades (amount is already in drops)
      ourFeeInDrops = Math.floor(Number(amountToDeliver) * fee);

      const balance = await xrpClient.getXrpBalance(wallet.address);
      const networkFee = (await xrpClient.getNetworkFee()) * 2;
      const reserves = await calculateReserves(wallet.address);
      const totalNeeded = Number(amountToDeliver) + ourFeeInDrops + networkFee;

      // Convert balance to drops for comparison since totalNeeded is in drops
      const availableBalance = balance * 1_000_000 - reserves - networkFee;
      if (availableBalance < totalNeeded) {
        return NextResponse.json({ error: "Insufficient XRP balance" }, { status: 400 });
      }
    } else {
      // For token trades, calculate fee based on XRP equivalent
      const res = await fetch(
        `https://s1.xrplmeta.org/token/${amountToDeliver.currency}:${amountToDeliver.issuer}`,
      );
      if (!res.ok) {
        return NextResponse.json({ error: "Error fetching token price" }, { status: 400 });
      }

      const data = await res.json();
      const price = data.metrics?.price;
      // amountToDeliver.value is already a string, so we need to convert to number
      const xrpEquivalent = price * Number(amountToDeliver.value);
      ourFeeInDrops = Math.floor(xrpEquivalent * 1_000_000 * fee);

      // Check XRP balance for fees (convert balance to drops)
      const xrpBalance = await xrpClient.getXrpBalance(wallet.address);
      const reserves = await calculateReserves(wallet.address);
      const totalNeeded = ourFeeInDrops + reserves + 10_000;
      if (xrpBalance * 1_000_000 < totalNeeded) {
        return NextResponse.json({ error: "Insufficient XRP balance for fees" }, { status: 400 });
      }
    }

    // Check and setup trust line if needed for token trades
    const isTokenReceive = typeof amountToReceive !== "string";
    if (isTokenReceive) {
      const accountLines = await xrpClient.getAccountLines(wallet.address);
      const trustLine = accountLines.result.lines.find(
        (line) =>
          line.currency === amountToReceive.currency && line.account === amountToReceive.issuer,
      );

      const balances = await xrpClient.getBalances(wallet.address);
      const tokenBalance = balances.find(
        (balance) => balance.currency === amountToReceive.currency,
      );
      const totalBalanceNeeded = Number(tokenBalance?.value || 0) + Number(amountToReceive.value);

      if (!trustLine || Number(trustLine.limit) < totalBalanceNeeded) {
        const trustSet = {
          TransactionType: "TrustSet" as const,
          Account: wallet.address,
          LimitAmount: {
            currency: amountToReceive.currency,
            issuer: amountToReceive.issuer,
            value: "100000000000",
          },
        };

        const networkFee = await xrpClient.getNetworkFee();
        const sequence = await xrpClient.getSequence(wallet.address);
        const currentLedger = await xrpClient.getLedgerIndex();
        const prepared = {
          ...trustSet,
          Fee: networkFee.toString(),
          Sequence: sequence,
          LastLedgerSequence: currentLedger + 20,
        };

        const signed = wallet.sign(prepared);
        const tx = await xrpClient.submitAndWait(signed.tx_blob);
        console.log("Trust line set:", tx);
      }
    }

    // Prepare Payment transaction
    const slippageMultiplier = 1 - slippage / 100;

    const amount =
      typeof amountToReceive === "string"
        ? Math.floor(Number(amountToReceive)).toString()
        : {
            currency: amountToReceive.currency,
            issuer: amountToReceive.issuer,
            value: Number(amountToReceive.value).toFixed(6),
          };

    const deliverMin =
      typeof amountToReceive === "string"
        ? Math.floor(Number(amountToReceive) * slippageMultiplier).toString()
        : {
            currency: amountToReceive.currency,
            issuer: amountToReceive.issuer,
            value: (Number(amountToReceive.value) * slippageMultiplier).toFixed(6),
          };

    const sendMax =
      typeof amountToDeliver === "string"
        ? Math.floor(Number(amountToDeliver)).toString()
        : {
            currency: amountToDeliver.currency,
            issuer: amountToDeliver.issuer,
            value: Number(amountToDeliver.value).toFixed(6),
          };

    const payment: Payment = {
      TransactionType: "Payment",
      Account: wallet.address,
      Destination: wallet.address,
      Amount: amount,
      DeliverMin: deliverMin,
      SendMax: sendMax,
      Flags: PaymentFlags.tfPartialPayment,
    };

    // Submit transaction
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

    // Handle transaction result
    if (typeof tx.result.meta === "object") {
      const status = tx.result.meta.TransactionResult;
      if (status !== "tesSUCCESS") {
        if (status === "tecPATH_DRY" || status === "tecPATH_PARTIAL") {
          return NextResponse.json(
            { error: "No liquidity available for this trade" },
            { status: 400 },
          );
        }
        return NextResponse.json({ error: "Transaction failed" }, { status: 400 });
      }
    }

    // Process platform fee
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
          await xrpClient.submit(feeSigned.tx_blob);
          await resend.emails.send({
            from: "TokenOS <notifs@mailer.tokenos.one>",
            to: "rmthomas@pryzma.io",
            subject: "Fee transaction received",
            text: `Collected ${dropsToXrp(ourFeeInDrops)} XRP from ${wallet.address} for a trade`,
          });
        } catch (e) {
          console.error("Error sending fee transaction:", e);
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error processing trade" }, { status: 500 });
  }
});

// Helper function to calculate required reserves
async function calculateReserves(address: string) {
  const accountInfo = await xrpClient.getAccountInfo(address);
  const baseReserve = 1_000_000;
  const ownerCount = accountInfo.result.account_data.OwnerCount;
  const ownerReserve = ownerCount * 200_000;
  return baseReserve + ownerReserve;
}
