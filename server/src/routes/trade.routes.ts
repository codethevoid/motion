import express, { Request, Response } from "express";
import { withWalletAction } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { Amount, dropsToXrp, Payment, PaymentFlags, Wallet } from "xrpl";
import { xrplClient } from "../lib/xrpl-client.js";
import { getXrpPrice } from "../utils/xrp-price.js";
import { tradeSchema } from "../lib/zod/trade.js";
import { calculateFee } from "../services/calculate-fee.js";
import { setupTrustline } from "../services/setup-trustline.js";
import { sendXrp } from "../services/send-xrp.js";
import { prisma } from "../db/prisma.js";
import { resend } from "../utils/resend.js";

const router = express.Router();

type TradeRequest = {
  transaction: {
    type: "sell" | "buy";
    amountToDeliver: Amount;
    amountToReceive: Amount;
    slippage: number;
  };
};

router.post("/", withWalletAction, async (req: Request, res: Response) => {
  const { wallet } = req as AuthRequest;
  const { transaction } = req.body as TradeRequest;
  const { amountToDeliver, amountToReceive, slippage } = transaction;
  if ("fee" in transaction) delete transaction.fee;

  // validate the request
  const parsed = tradeSchema.safeParse({ transaction });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid trade reqeust" });
    return;
  }

  const client = await xrplClient.connect();

  // get the price of XRP in USD
  const xrpPrice = await getXrpPrice();
  if (!xrpPrice) {
    res.status(400).json({ error: "Error getting price of XRP" });
    return;
  }

  // calculate the fees
  const fees = await calculateFee({
    amountToDeliver,
    amountToReceive,
    slippage,
    client,
    wallet,
    xrpPrice,
  });

  if ("error" in fees) {
    res.status(400).json({ error: fees.error });
    return;
  }

  const { totalFeeInDrops, tradeValueInDrops } = fees;

  // check if user has trust line set up
  if (typeof amountToReceive !== "string") {
    const accountLines = await client.request({
      command: "account_lines",
      account: wallet.classicAddress,
      peer: amountToReceive.issuer,
      ledger_index: "validated",
    });

    const hasTrustline = accountLines?.result?.lines.find(
      (line) =>
        line.currency === amountToReceive.currency && line.account === amountToReceive.issuer,
    );

    if (!hasTrustline || Number(hasTrustline.limit) < Number(amountToReceive.value)) {
      // set up trust line
      const trustline = await setupTrustline({
        wallet,
        issuer: amountToReceive.issuer,
        currency: amountToReceive.currency,
      });

      if (!trustline) {
        res.status(400).json({ error: "Error setting up trust line" });
        return;
      }
    }
  }

  // set up the transaction
  const slippageMultiplier = 1 - slippage / 100;
  const bufferMultiplier = 1.5;

  const amount: Amount =
    typeof amountToReceive === "string"
      ? Math.floor(Number(amountToReceive) * bufferMultiplier).toString()
      : {
          currency: amountToReceive.currency,
          issuer: amountToReceive.issuer,
          value: (Number(amountToReceive.value) * bufferMultiplier).toFixed(5),
        };

  const deliverMin: Amount =
    typeof amountToReceive === "string"
      ? Math.floor(Number(amountToReceive) * slippageMultiplier).toString()
      : {
          currency: amountToReceive.currency,
          issuer: amountToReceive.issuer,
          value: (Number(amountToReceive.value) * slippageMultiplier).toFixed(5),
        };

  const sendMax: Amount =
    typeof amountToDeliver === "string"
      ? Math.floor(Number(amountToDeliver)).toString()
      : {
          currency: amountToDeliver.currency,
          issuer: amountToDeliver.issuer,
          value: Number(amountToDeliver.value).toFixed(5),
        };

  const payment: Payment = {
    TransactionType: "Payment",
    Account: wallet.classicAddress,
    Destination: wallet.classicAddress,
    Amount: amount,
    DeliverMin: deliverMin,
    SendMax: sendMax,
    Flags: PaymentFlags.tfPartialPayment,
  };

  const prepared = await client.autofill(payment);
  const signed = wallet.sign(prepared);
  const paymentTx = await client.submitAndWait(signed.tx_blob);

  if (typeof paymentTx.result?.meta === "object") {
    const status = paymentTx.result.meta.TransactionResult;
    if (status !== "tesSUCCESS") {
      if (status === "tecPATH_DRY" || status === "tecPATH_PARTIAL") {
        res.status(400).json({ error: "Not enough liquidity." });
        return;
      }
      res.status(400).json({ error: "Transaction failed" });
      return;
    }
  }

  // send response
  res.status(200).json({ message: "Transaction successful" });

  // send fee payment in background
  const feeSent = await sendXrp({
    from: wallet,
    to: process.env.FEE_WALLET_ADDRESS!,
    amount: dropsToXrp(totalFeeInDrops),
  });

  if (!feeSent) {
    console.error("Error sending fee");
    // insert the transaction into the db
    await prisma.tx.create({
      data: {
        wallet: { connect: { address: wallet.classicAddress } },
        amountInDrops: tradeValueInDrops,
        amountInUsd: dropsToXrp(tradeValueInDrops) * xrpPrice,
        totalFeeInDrops,
        totalFeeInUsd: dropsToXrp(totalFeeInDrops) * xrpPrice,
        feesCollectedByPlatformInDrops: "0",
        feesCollectedByPlatformInUsd: 0,
        feesCollectedByReferralInDrops: "0",
        feesCollectedByReferralInUsd: 0,
      },
    });
    return;
  }

  // check if this wallet has a referral and if so
  // send the referral fee to the referring wallet
  const userWallet = await prisma.wallet.findUnique({ where: { address: wallet.classicAddress } });

  let referralWallet: string | null = null;
  let referralFeePercentage = 0;
  let referralFeeInDrops = 0;

  if (userWallet?.referredBy) {
    const referralWalletInfo = await prisma.wallet.findUnique({
      where: { address: userWallet.referredBy },
      select: { referralFee: true, address: true },
    });

    if (referralWalletInfo) {
      referralWallet = referralWalletInfo.address;
      referralFeePercentage = referralWalletInfo.referralFee / 100;
    }
  }

  if (referralWallet && referralFeePercentage) {
    referralFeeInDrops = Math.floor(Number(totalFeeInDrops) * referralFeePercentage);
    const referralFeeInXrp = dropsToXrp(referralFeeInDrops);

    // send payment from our fee wallet
    const feeWallet = new Wallet(
      process.env.FEE_WALLET_PUBLIC_KEY!,
      process.env.FEE_WALLET_PRIVATE_KEY!,
    );

    const isReferralFeeSent = await sendXrp({
      from: feeWallet,
      to: referralWallet,
      amount: referralFeeInXrp,
    });

    if (!isReferralFeeSent) console.error("Error sending referral fee");
  }

  // insert the transaction into the db
  await prisma.tx.create({
    data: {
      wallet: { connect: { address: wallet.classicAddress } },
      amountInDrops: tradeValueInDrops,
      amountInUsd: dropsToXrp(tradeValueInDrops) * xrpPrice,
      totalFeeInDrops: totalFeeInDrops,
      totalFeeInUsd: dropsToXrp(totalFeeInDrops) * xrpPrice,
      feesCollectedByPlatformInDrops: (Number(totalFeeInDrops) - referralFeeInDrops).toString(),
      feesCollectedByPlatformInUsd:
        (dropsToXrp(totalFeeInDrops) - dropsToXrp(referralFeeInDrops)) * xrpPrice,
      feesCollectedByReferralInDrops: referralFeeInDrops.toString(),
      feesCollectedByReferralInUsd: dropsToXrp(referralFeeInDrops) * xrpPrice,
    },
  });

  console.log({
    totalFeeInDrops,
    totalFeeInXrp: dropsToXrp(totalFeeInDrops),
    totalFeeInUsd: dropsToXrp(totalFeeInDrops) * xrpPrice,
    feesCollectedByPlatformInDrops: (Number(totalFeeInDrops) - referralFeeInDrops).toString(),
    feesCollectedByPlatformInUsd:
      (dropsToXrp(totalFeeInDrops) - dropsToXrp(referralFeeInDrops)) * xrpPrice,
    feesCollectedByReferralInDrops: referralFeeInDrops.toString(),
    feesCollectedByReferralInUsd: dropsToXrp(referralFeeInDrops) * xrpPrice,
  });

  // send email notification
  await resend().emails.send({
    from: "Motion.zip <notifs@mailer.motion.zip>",
    to: "ryan@motion.zip",
    subject: "Fee transaction received",
    text: `Collected ${dropsToXrp(totalFeeInDrops).toLocaleString("en-us", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} XRP (${(dropsToXrp(totalFeeInDrops) * xrpPrice).toLocaleString("en-us", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}) from ${wallet.classicAddress}. See transaction: https://xrpscan.com/tx/${paymentTx.result.hash}`,
  });
});

export default router;
