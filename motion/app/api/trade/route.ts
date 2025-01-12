import { NextResponse, unstable_after as after } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { FEE_PERCENTAGE } from "@/lib/xrp/constants";
import { decryptToken } from "@/lib/token";
import { getToken } from "@/lib/middleware/utils/get-token";
import { Wallet, PaymentFlags, Payment, dropsToXrp, isValidAddress } from "xrpl";
import { xrpClient } from "@/lib/xrp/http-client";
import { resend } from "@/utils/resend";
import { Amount } from "xrpl";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";
import prisma from "@/db/prisma";
import { xrpToDrops } from "xrpl";

export const maxDuration = 60;

type TradeRequest = {
  transaction: {
    type: "sell" | "buy";
    amountToDeliver: Amount; // amount the user will send/sell/deliver
    amountToReceive: Amount; // amount the user will receive
    slippage: number;
  };
  password: string;
};

export const POST = withWallet(async ({ req }) => {
  try {
    const { transaction, password } = (await req.json()) as TradeRequest;
    const { amountToDeliver, amountToReceive, slippage } = transaction;

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
    let ourFeeInDrops = 0; // max fee is $100 (100 / price of xrp) * 1_000_000
    let totalAmountOfTradeInDrops = "0";

    const isXRPDelivery = typeof amountToDeliver === "string";
    if (isXRPDelivery) {
      // Calculate platform fee (1% with $100 USD cap)
      ourFeeInDrops = Math.floor(Number(amountToDeliver) * fee);
      totalAmountOfTradeInDrops = Math.floor(Number(amountToDeliver)).toString();
      const priceOfXrp = await getXrpValueInUsd();
      if (!priceOfXrp) {
        return NextResponse.json({ error: "Error getting price of XRP" }, { status: 400 });
      }
      const totalFeeInUsd = priceOfXrp * dropsToXrp(ourFeeInDrops);
      if (totalFeeInUsd > 100) {
        // calculate how much to charge in drops to make it $100
        const xrpToCharge = 100 / priceOfXrp;
        // now we need to convert the xrp to drops
        ourFeeInDrops = Math.floor(xrpToCharge * 1_000_000);
      }

      const [balance, reserves, networkFee] = await Promise.all([
        xrpClient.getXrpBalance(wallet.address),
        calculateReserves(wallet.address),
        xrpClient.getNetworkFee(),
      ]);

      if (!balance || !reserves || !networkFee) {
        return NextResponse.json(
          { error: "Error getting XRP balance, reserves, or network fee" },
          { status: 400 },
        );
      }

      const totalNeeded = Number(amountToDeliver) + ourFeeInDrops + networkFee * 2; // multiply by 2 to account for the extra tx fee for the fee payment

      // Convert balance to drops for comparison since totalNeeded is in drops
      const availableBalance = balance - reserves;
      if (availableBalance < totalNeeded) {
        return NextResponse.json({ error: "Insufficient XRP balance" }, { status: 400 });
      }
    } else {
      // This is when sending a custom token and receiving XRP
      // So we need to get the price of the token in XRP and then calculate the fee
      const res = await fetch(
        `https://s1.xrplmeta.org/token/${amountToDeliver.currency}:${amountToDeliver.issuer}`,
      );
      if (!res.ok) {
        return NextResponse.json({ error: "Error getting rate of exchange" }, { status: 400 });
      }

      const data = await res.json();
      const price = data.metrics?.price; // price in XRP
      if (!price) {
        return NextResponse.json({ error: "Error getting rate of exchange" }, { status: 400 });
      }
      const xrpEquivalent = price * Number(amountToDeliver.value);
      // we need to get the price of XRP in USD to see if the fee is over $100 USD
      const priceOfXrp = await getXrpValueInUsd();
      if (!priceOfXrp) {
        return NextResponse.json({ error: "Error getting price of XRP" }, { status: 400 });
      }
      const totalFeeInUsd = priceOfXrp * (xrpEquivalent * fee);
      if (totalFeeInUsd > 100) {
        // calculate how much to charge in drops to make it $100
        const xrpToCharge = 100 / priceOfXrp;
        // now we need to convert the xrp to drops
        ourFeeInDrops = Math.floor(xrpToCharge * 1_000_000);
        totalAmountOfTradeInDrops = xrpToDrops(xrpEquivalent.toFixed(6));
      } else {
        ourFeeInDrops = Math.floor(xrpEquivalent * 1_000_000 * fee);
        totalAmountOfTradeInDrops = xrpToDrops(xrpEquivalent.toFixed(6));
      }

      const [balance, reserves, networkFee] = await Promise.all([
        xrpClient.getXrpBalance(wallet.address),
        calculateReserves(wallet.address),
        xrpClient.getNetworkFee(),
      ]);

      if (!balance || !reserves || !networkFee) {
        return NextResponse.json(
          { error: "Error getting XRP balance, reserves, or network fee" },
          { status: 400 },
        );
      }

      // total needed is only the fees we need to collect
      // since they are sending the custom token
      const slippageMultiplier = 1 - slippage / 100;
      let xrpToReceive = 0;
      if (typeof amountToReceive === "string") {
        xrpToReceive = Math.floor(Number(amountToReceive) * slippageMultiplier);
      }
      const totalNeeded = ourFeeInDrops + networkFee * 2;
      const availableBalance = balance + xrpToReceive - reserves;

      console.log({
        currentBalanceXRP: dropsToXrp(balance),
        xrpToReceiveAfterSlippage: dropsToXrp(xrpToReceive),
        platformFeeXRP: dropsToXrp(ourFeeInDrops),
        platformFeeUSD: dropsToXrp(ourFeeInDrops) * priceOfXrp,
        finalBalanceXRP: dropsToXrp(availableBalance),
        requiredXRP: dropsToXrp(totalNeeded),
        slippagePercentage: slippage,
      });

      if (availableBalance < totalNeeded) {
        return NextResponse.json({ error: "Insufficient XRP balance" }, { status: 400 });
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

        const [networkFee, sequence, currentLedger] = await Promise.all([
          xrpClient.getNetworkFee(),
          xrpClient.getSequence(wallet.address),
          xrpClient.getLedgerIndex(),
        ]);
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
    const BUFFER_MULTIPLIER = 1.5; // Add 50% to amount so we don't cap what we can receive in case of better price

    const amount =
      typeof amountToReceive === "string"
        ? Math.floor(Number(amountToReceive) * BUFFER_MULTIPLIER).toString()
        : {
            currency: amountToReceive.currency,
            issuer: amountToReceive.issuer,
            value: (Number(amountToReceive.value) * BUFFER_MULTIPLIER).toFixed(6),
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
    const [networkFee, sequence, currentLedger] = await Promise.all([
      xrpClient.getNetworkFee(),
      xrpClient.getSequence(wallet.address),
      xrpClient.getLedgerIndex(),
    ]);
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

    // send fee payment in background
    after(async () => {
      if (ourFeeInDrops > 0) {
        const feeWallet = process.env.FEE_WALLET_ADDRESS!;
        const feeTxDetails = {
          TransactionType: "Payment" as const,
          Destination: feeWallet,
          Amount: ourFeeInDrops.toString(),
          Account: wallet.address,
        };

        const [networkFee, sequence, currentLedger] = await Promise.all([
          xrpClient.getNetworkFee(),
          xrpClient.getSequence(wallet.address),
          xrpClient.getLedgerIndex(),
        ]);
        const feePrepared: Payment = {
          ...feeTxDetails,
          Fee: networkFee.toString(),
          Sequence: sequence,
          LastLedgerSequence: currentLedger + 20,
        };
        const feeSigned = wallet.sign(feePrepared);

        xrpClient.submitAndWait(feeSigned.tx_blob);

        // check if this wallet has a referral and if so, send the referring wallet the referral fee
        const walletInfo = await prisma.wallet.findUnique({ where: { address: wallet.address } });
        if (walletInfo?.referredBy) {
          const referralWallet = await prisma.wallet.findUnique({
            where: { address: walletInfo.referredBy },
            select: { referralFee: true, address: true },
          });
          if (referralWallet) {
            const referralFeeInDrops = Math.floor(
              ourFeeInDrops * (referralWallet.referralFee / 100),
            );
            const referralFeeTx = {
              TransactionType: "Payment" as const,
              Destination: referralWallet.address,
              Amount: referralFeeInDrops.toString(),
              Account: feeWallet,
            };

            // create new wallet from the fee wallet
            const feeWalletPrivateKey = process.env.FEE_WALLET_PRIVATE_KEY!;
            const feeWalletPublicKey = process.env.FEE_WALLET_PUBLIC_KEY!;
            const completeFeeWallet = new Wallet(feeWalletPublicKey, feeWalletPrivateKey);

            const [networkFee, sequence, currentLedger] = await Promise.all([
              xrpClient.getNetworkFee(),
              xrpClient.getSequence(feeWallet),
              xrpClient.getLedgerIndex(),
            ]);

            const feePrepared: Payment = {
              ...referralFeeTx,
              Fee: networkFee.toString(),
              Sequence: sequence,
              LastLedgerSequence: currentLedger + 20,
            };
            const feeSigned = completeFeeWallet.sign(feePrepared);
            xrpClient.submit(feeSigned.tx_blob);

            // now we need to get the data ready to put in the db
            const priceOfXrp = await getXrpValueInUsd();
            const amountInDrops = totalAmountOfTradeInDrops;
            const amountInUsd = dropsToXrp(totalAmountOfTradeInDrops) * priceOfXrp;
            const totalFeeInDrops = ourFeeInDrops;
            const totalFeeInUsd = dropsToXrp(ourFeeInDrops) * priceOfXrp;
            const feesCollectedByPlatformInDrops =
              ourFeeInDrops * (1 - referralWallet.referralFee / 100);
            const feesCollectedByPlatformInUsd =
              dropsToXrp(feesCollectedByPlatformInDrops) * priceOfXrp;
            const feesCollectedByReferralInDrops = referralFeeInDrops;
            const feesCollectedByReferralInUsd = dropsToXrp(referralFeeInDrops) * priceOfXrp;
            const feesCollectedBy = referralWallet.address;

            await prisma.tx.create({
              data: {
                walletId: walletInfo.id,
                amountInDrops: amountInDrops.toString(),
                amountInUsd,
                totalFeeInDrops: totalFeeInDrops.toString(),
                totalFeeInUsd,
                feesCollectedByPlatformInDrops: feesCollectedByPlatformInDrops.toString(),
                feesCollectedByPlatformInUsd: feesCollectedByPlatformInUsd,
                feesCollectedByReferralInDrops: feesCollectedByReferralInDrops.toString(),
                feesCollectedByReferralInUsd: feesCollectedByReferralInUsd,
                feesCollectedBy,
              },
            });

            await resend.emails.send({
              from: "Motion.zip <notifs@mailer.motion.zip>",
              to: "rmthomas@pryzma.io",
              subject: "Fee transaction received",
              text: `Collected ${dropsToXrp(feesCollectedByPlatformInDrops).toLocaleString("en-us", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} XRP (${(dropsToXrp(feesCollectedByPlatformInDrops) * priceOfXrp).toLocaleString("en-us", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}) from ${wallet.address}. Referral wallet ${referralWallet.address} collected ${dropsToXrp(feesCollectedByReferralInDrops).toLocaleString("en-us", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} XRP (${(dropsToXrp(feesCollectedByReferralInDrops) * priceOfXrp).toLocaleString("en-us", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}). See transaction: https://xrpsan.com/tx/${tx.result.hash}`,
            });
          }
        } else {
          const priceOfXrp = await getXrpValueInUsd();
          const amountInDrops = totalAmountOfTradeInDrops;
          const amountInUsd = dropsToXrp(totalAmountOfTradeInDrops) * priceOfXrp;
          const totalFeeInDrops = ourFeeInDrops;
          const totalFeeInUsd = dropsToXrp(ourFeeInDrops) * priceOfXrp;
          const feesCollectedByPlatformInDrops = ourFeeInDrops; // we collect all the fees in case of no referral
          const feesCollectedByPlatformInUsd = dropsToXrp(ourFeeInDrops) * priceOfXrp;

          await prisma.tx.create({
            data: {
              wallet: { connect: { address: wallet.address } },
              amountInDrops: amountInDrops.toString(),
              amountInUsd,
              totalFeeInDrops: totalFeeInDrops.toString(),
              totalFeeInUsd,
              feesCollectedByPlatformInDrops: feesCollectedByPlatformInDrops.toString(),
              feesCollectedByPlatformInUsd: feesCollectedByPlatformInUsd,
              feesCollectedBy: null,
            },
          });

          await resend.emails.send({
            from: "Motion.zip <notifs@mailer.motion.zip>",
            to: "rmthomas@pryzma.io",
            subject: "Fee transaction received",
            text: `Collected ${dropsToXrp(ourFeeInDrops).toLocaleString("en-us", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} XRP (${(dropsToXrp(ourFeeInDrops) * priceOfXrp).toLocaleString("en-us", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}) from ${wallet.address}. See transaction: https://xrpsan.com/tx/${tx.result.hash}`,
          });
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
