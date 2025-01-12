import express, { Request, Response } from "express";
import { auth } from "../middleware/auth";
import { type AuthRequest } from "../types/auth";
import { prisma } from "../db/prisma";
import { allowProgress } from "../services/allow-progress";
import type { TokenSchema, FileInfo } from "shared/zod/token";
import { Wallet, xrpToDrops } from "xrpl";
import { sendXrp } from "../services/send-xrp";
import { configureIssuer } from "../services/configure-issuer";
import { getSafeCurrency } from "../utils/currency";
import { setupTrustline } from "../services/setup-trustline";
import { issueTokens } from "../services/issue-tokens";
import { blackhole } from "../services/blackhole";
import { createAmmPool } from "../services/create-amm-pool";
import { xrplClient } from "../lib/xrpl-client";
import { Payment } from "xrpl";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { MOTION_ZIP_FEE } from "shared/constants/fee-structure";
import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

const progressConnections = new Map<string, { send: (percent: number) => void }>();

/**
 * This route is used to send progress updates to the client
 */
router.get("/create/progress/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  progressConnections.set(id, { send: (percent: number) => res.write(`data: ${percent}\n\n`) });

  req.on("close", () => progressConnections.delete(id));
});

const sendProgress = (id: string, percent: number) => {
  const connection = progressConnections.get(id);
  if (connection) connection.send(percent);
};

/**
 * This route is used to create a token
 */
router.post(
  "/create",
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  auth,
  async (req: Request, res: Response) => {
    const requestId = req.headers["x-request-id"] as string;
    // get info from request
    const { wallet } = req as AuthRequest;
    const files = req.files as { [filedname: string]: Express.Multer.File[] };
    const icon = files.icon?.[0];
    const banner = files.banner?.[0];
    const { name, description, ticker, telegram, x, website } = req.body as Pick<
      TokenSchema,
      "name" | "description" | "ticker" | "telegram" | "x" | "website"
    >;

    const devAllocation = Number(req.body.devAllocation);
    const poolAmount = Number(req.body.poolAmount);
    const poolFee = Number(req.body.poolFee);
    const supply = Number(req.body.supply);

    const iconFile = icon
      ? {
          lastModified: Date.now(),
          name: icon.filename,
          size: icon.size,
          type: icon.mimetype,
        }
      : null;

    const bannerFile = banner
      ? {
          lastModified: Date.now(),
          name: banner.filename,
          size: banner.size,
          type: banner.mimetype,
        }
      : null;

    console.log("allowing progress...");
    const shouldAllowProgress = await allowProgress(
      {
        name,
        description,
        ticker,
        telegram,
        x,
        website,
        icon: iconFile as FileInfo,
        banner: bannerFile as FileInfo,
        supply,
        devAllocation,
        poolAmount,
        poolFee,
      },
      wallet,
    );
    if (!shouldAllowProgress.allow) {
      res.status(400).json({ error: shouldAllowProgress.error });
      return;
    }

    /**
     * STEP 1: Create issuer wallet, fund it, and configure it
     */
    console.log("creating issuer...");
    const issuer = Wallet.generate();
    const isIssuerFunded = await sendXrp({
      from: wallet,
      to: issuer.classicAddress,
      amount: 1.01,
    });
    if (!isIssuerFunded) {
      res.status(400).json({ error: "Failed to activate issuer" });
      return;
    }

    const issuerConfigured = await configureIssuer(issuer);
    if ("error" in issuerConfigured) {
      res.status(400).json({ error: "Failed to configure issuer" });
      return;
    }
    const { domain } = issuerConfigured;

    sendProgress(requestId, 15);

    /**
     * STEP 2: Setup trustline from dev wallet to issuer and currency
     * and issue initial supply to dev wallet
     */
    console.log("setting up trustline...");
    const currency = getSafeCurrency(ticker);

    const devTrustline = await setupTrustline({ wallet, issuer: issuer.classicAddress, currency });
    if (!devTrustline) {
      res.status(400).json({ error: "Failed to setup trustline" });
      return;
    }

    const devAmount = supply * (devAllocation / 100);
    const tokenAmount = supply - devAmount;

    const supplyDelivered = await issueTokens({
      from: issuer,
      to: wallet.classicAddress,
      currency,
      amount: supply,
    });
    if (!supplyDelivered) {
      res.status(400).json({ error: "Failed to issue tokens" });
      return;
    }

    sendProgress(requestId, 30);

    /**
     * STEP 3: Blackhole the issuer so we can't use it anymore
     */
    console.log("blackholing issuer...");
    const issuerBlackholed = await blackhole(issuer);
    if (!issuerBlackholed) {
      res.status(400).json({ error: "Failed to blackhole issuer" });
      return;
    }

    sendProgress(requestId, 45);

    /**
     * STEP 4: Create the liquidity pool
     */
    console.log("creating amm pool...");
    const poolResult = await createAmmPool({
      wallet,
      issuer: issuer.classicAddress,
      tokenAmount,
      xrpAmount: poolAmount,
      currency,
      poolFee: poolFee,
    });

    let ammAccount: string | undefined = undefined;
    if (typeof poolResult.result?.meta === "object") {
      if (poolResult.result.meta.TransactionResult !== "tesSUCCESS") {
        res.status(400).json({ error: "Failed to create amm pool" });
        return;
      }

      for (const node of poolResult.result.meta.AffectedNodes) {
        if (
          "CreatedNode" in node &&
          node.CreatedNode?.LedgerEntryType === "AMM" &&
          node.CreatedNode?.NewFields?.Account
        ) {
          ammAccount = node.CreatedNode.NewFields.Account as string;
        }
      }
    }

    if (!ammAccount) {
      res.status(400).json({ error: "Failed to create amm pool" });
      return;
    }

    sendProgress(requestId, 60);

    /**
     * STEP 5: Setup the LP wallet
     */
    console.log("creating lp wallet...");
    const lpWallet = Wallet.generate();
    const lpWalletFunded = await sendXrp({
      from: wallet,
      to: lpWallet.classicAddress,
      amount: 1.01,
    });
    if (!lpWalletFunded) {
      res.status(400).json({ error: "Failed to fund lp wallet" });
      return;
    }

    // need to get the amm info to get the lp token currency
    const client = await xrplClient.connect();
    let ammInfo = await client.request({ command: "amm_info", amm_account: ammAccount });
    let ammRetries = 0;
    while (!ammInfo.result && ammRetries < 3) {
      ammInfo = await client.request({ command: "amm_info", amm_account: ammAccount });
      ammRetries++;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second
    }

    if (!ammInfo.result) {
      res.status(400).json({ error: "Failed to get amm info" });
      return;
    }

    const lpTokenCurrency = ammInfo.result?.amm.lp_token.currency;
    if (!lpTokenCurrency) {
      res.status(400).json({ error: "Failed to get lp token currency" });
      return;
    }

    const lpTrustline = await setupTrustline({
      wallet: lpWallet,
      currency: lpTokenCurrency,
      issuer: ammAccount,
    });
    if (!lpTrustline) {
      res.status(400).json({ error: "Failed to setup lp trustline" });
      return;
    }

    sendProgress(requestId, 70);

    /**
     * STEP 6: Send the LP tokens to the LP wallet
     */
    console.log("sending lp tokens...");
    let lpLineRetries = 0;
    let balances = await client.getBalances(wallet.classicAddress, { peer: ammAccount });
    let lpLine = balances.find(
      (line: { value: string; currency: string; issuer?: string }) =>
        line.currency === lpTokenCurrency && line.issuer === ammAccount,
    );

    while (!lpLine && lpLineRetries < 3) {
      balances = await client.getBalances(wallet.classicAddress, { peer: ammAccount });
      lpLine = balances.find(
        (line: { value: string; currency: string; issuer?: string }) =>
          line.currency === lpTokenCurrency && line.issuer === ammAccount,
      );
      lpLineRetries++;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second
    }

    if (!lpLine) {
      res.status(400).json({ error: "Failed to get lp line" });
      return;
    }

    const sendLp: Payment = {
      TransactionType: "Payment",
      Account: wallet.classicAddress,
      Destination: lpWallet.classicAddress,
      Amount: {
        currency: lpTokenCurrency,
        issuer: ammAccount,
        value: lpLine.value,
      },
    };

    const prepared = await client.autofill(sendLp);
    const signed = wallet.sign(prepared);
    const sendLpRes = await client.submitAndWait(signed.tx_blob);

    if (typeof sendLpRes.result?.meta === "object") {
      if (sendLpRes.result.meta.TransactionResult !== "tesSUCCESS") {
        res.status(400).json({ error: "Failed to send LP tokens" });
        return;
      }
    }

    sendProgress(requestId, 80);

    /**
     * STEP 7: Blackhole the lp wallet
     */
    console.log("blackholing lp wallet...");
    const lpBlackholed = await blackhole(lpWallet);
    if (!lpBlackholed) {
      res.status(400).json({ error: "Failed to blackhole lp wallet" });
      return;
    }

    sendProgress(requestId, 90);

    /**
     * STEP 8: Add token details to database
     */
    console.log("adding token details to database...");
    // upload icon and banner to s3 and get locations
    const iconBuffer = icon.buffer;
    const iconParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `icons/${currency}/${issuer.classicAddress}`,
      Body: iconBuffer,
      ContentType: icon.mimetype,
    };

    const bannerBuffer = banner.buffer;
    const bannerParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `banners/${currency}/${issuer.classicAddress}`,
      Body: bannerBuffer,
      ContentType: banner.mimetype,
    };

    const iconCommand = new PutObjectCommand(iconParams);
    const bannerCommand = new PutObjectCommand(bannerParams);
    const iconLocation = `https://cdn.motion.zip/${iconParams.Key}`;
    const bannerLocation = `https://cdn.motion.zip/${bannerParams.Key}`;

    const s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    Promise.all([s3.send(iconCommand), s3.send(bannerCommand)]).catch((e) => console.error(e));

    await prisma.token.create({
      data: {
        name: name.trim(),
        currency: ticker.trim(),
        currencyHex: currency,
        issuer: issuer.classicAddress,
        description: description.trim(),
        icon: iconLocation,
        banner: bannerLocation,
        domain: domain,
        website: website?.trim() || null,
        telegram: telegram?.trim() || null,
        x: x?.trim() || null,
        createdBy: { connect: { address: wallet.classicAddress } },
      },
    });

    /**
     * STEP 9: Send the fee to our fee wallet from the dev wallet
     */
    console.log("sending fee...");
    if (process.env.NODE_ENV === "production") {
      const feePayment: Payment = {
        TransactionType: "Payment",
        Account: wallet.classicAddress,
        Destination: process.env.FEE_WALLET_ADDRESS!,
        Amount: xrpToDrops(MOTION_ZIP_FEE),
      };

      const preparedFee = await client.autofill(feePayment);
      const signedFee = wallet.sign(preparedFee);
      await client.submit(signedFee.tx_blob);
    }

    // revalidate tokens since we just created a new one
    const url =
      process.env.NODE_ENV === "production"
        ? "https://motion.zip/api/revalidate-tokens"
        : "http://localhost:3000/api/revalidate-tokens";

    await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.REVALIDATION_KEY}` },
    });

    // return the issuer and currency so we can redirect to the token page
    res.json({ issuer: issuer.classicAddress, currency });
  },
);

export default router;
