import express, { Request, Response } from "express";
import { xrplClient } from "../lib/xrpl-client.js";
import { withWallet, withWalletAction } from "../middleware/auth.js";
import { AuthRequest, WalletRequest } from "../types/auth.js";
import {
  AccountInfoResponse,
  Amount,
  dropsToXrp,
  xrpToDrops,
  Payment,
  isValidClassicAddress,
} from "xrpl";
import { getXrpPrice } from "../utils/xrp-price.js";
import { formatCurrency } from "../utils/currency.js";
import { xrplMeta } from "../lib/xrpl-meta.js";
import type { TrustlineWithMeta, Balance } from "../types/general.js";
import { prisma } from "../db/prisma.js";
import { calculateReserves } from "../lib/helpers/calc-reserves.js";
import { z } from "zod";

const router = express.Router();

export const xrpMeta = {
  rawCurrency: "XRP",
  currency: "XRP",
  icon: "https://cdn.qryptic.io/crypto/xrp.png",
  issuer: "",
  name: "XRP",
};

router.get("/", withWallet, async (req: Request, res: Response) => {
  const { address } = req as WalletRequest;

  const client = await xrplClient.connect();
  let walletInfo: AccountInfoResponse | null = null;

  try {
    walletInfo = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Account not found.") {
      res.json({
        address,
        isFunded: false,
        balance: 0,
        availableBalance: 0,
        balanceInUsd: 0,
        balanceInUsdIncludingTokens: 0,
        xrpPrice: 0,
        baseReserve: 0,
        countReserve: 0,
        ownerReserve: 0,
        totalReserve: 0,
        totalReserveInUsd: 0,
        nfts: [],
        tokens: [
          {
            ...xrpMeta,
            balance: 0,
            balanceInUsd: 0,
          },
        ],
      });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
    return;
  }

  if (!walletInfo) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const ownerCount = Number(walletInfo.result?.account_data?.OwnerCount) || 0;
  const baseReserve = 1_000_000; // 1 xrp
  const ownerReserve = ownerCount * 200_000; // owner reserve is 0.2 xrp or 200_000 drops
  const totalReserve = baseReserve + ownerReserve;

  const balance = dropsToXrp(walletInfo.result?.account_data?.Balance);
  const availableBalance = balance - dropsToXrp(totalReserve);
  const xrpPrice = (await getXrpPrice()) || 0;

  const tokens: {
    currency: string;
    rawCurrency: string;
    issuer: string;
    icon: string | undefined;
    name: string | undefined;
    balance: number;
    balanceInUsd: number;
  }[] = [];

  const balances = await client.getBalances(address);

  for (const token of balances) {
    if (token.currency === "XRP" && !token.issuer) {
      tokens.push({ ...xrpMeta, balance, balanceInUsd: balance * xrpPrice });
      continue;
    }

    if (token.value === "0") continue;

    const tokenFromDb = await prisma.token.findFirst({
      where: {
        AND: [{ currencyHex: token.currency }, { issuer: token.issuer }],
      },
    });

    // conserve original currency
    let icon = tokenFromDb?.icon;
    let name = tokenFromDb?.name;
    let price = 0;

    try {
      const metaRes = await xrplMeta.request({
        command: "token",
        token: { issuer: token.issuer, currency: token.currency },
      });

      if (metaRes) {
        price = Number(metaRes.result.metrics.price) || 0;
        if (!icon) {
          icon = metaRes.result?.meta?.token?.icon || undefined;
        }
        if (!name) {
          name = metaRes.result?.meta?.token?.name || undefined;
        }
      }
    } catch (e) {
      console.error("Error fetching token metadata", e);
    }

    const tokenBalance = Number(token.value) || 0;
    const priceInUsd = price * xrpPrice;

    tokens.push({
      issuer: token.issuer as string,
      currency: formatCurrency(token.currency as string),
      rawCurrency: token.currency,
      balance: tokenBalance,
      balanceInUsd: priceInUsd * tokenBalance,
      icon,
      name,
    });
  }

  res.json({
    address,
    isFunded: true,
    balance,
    availableBalance,
    balanceInUsd: balance * xrpPrice || 0,
    balanceInUsdIncludingTokens: tokens.reduce((acc, token) => acc + token.balanceInUsd, 0),
    xrpPrice,
    tokens,
    baseReserve: 1_000_000,
    countReserve: 200_000,
    ownerReserve: ownerReserve ? dropsToXrp(ownerReserve) : 0,
    totalReserve: totalReserve ? dropsToXrp(totalReserve) : 0,
    totalReserveInUsd: totalReserve ? dropsToXrp(totalReserve) * xrpPrice : 0,
  });
});

router.get("/trustlines", withWallet, async (req: Request, res: Response) => {
  const { address } = req as WalletRequest;

  const client = await xrplClient.connect();
  const lines = await client.request({
    command: "account_lines",
    ledger_index: "validated",
    account: address,
  });

  const trustlines: TrustlineWithMeta[] = [];

  for (const line of lines.result?.lines || []) {
    // check if token exists in db and overwite if does
    const tokenFromDb = await prisma.token.findFirst({
      where: {
        AND: [{ currencyHex: line.currency }, { issuer: line.account }],
      },
      select: { icon: true, name: true },
    });

    let icon = tokenFromDb?.icon;
    let name = tokenFromDb?.name;

    if (!icon || !name) {
      const metaRes = await xrplMeta.request({
        command: "token",
        token: { issuer: line.account, currency: line.currency },
      });

      if (metaRes) {
        icon = metaRes.result?.meta?.token?.icon || undefined;
        name = metaRes.result?.meta?.token?.name || undefined;
      }
    }

    trustlines.push({
      ...line,
      formattedCurrency: formatCurrency(line.currency),
      icon: tokenFromDb?.icon || icon,
      name: tokenFromDb?.name || name,
    });
  }

  res.json(trustlines);
});

router.get("/balances", withWallet, async (req: Request, res: Response) => {
  const { address } = req as WalletRequest;
  const client = await xrplClient.connect();
  const balancesRes = await client.getBalances(address);

  const balances: Balance[] = [];

  for (const balance of balancesRes) {
    if (balance.currency === "XRP" && !balance.issuer) {
      // calculate reserve
      const networkFee = 12; // 12 drops
      const reserves = await calculateReserves(address, client);
      const balanceInDrops = xrpToDrops(balance.value);
      const availableBalance = Number(balanceInDrops) - reserves - networkFee;
      const { icon, name } = xrpMeta;

      balances.push({
        rawCurrency: "XRP",
        currency: "XRP",
        value: dropsToXrp(availableBalance).toString(),
        icon,
        name,
        issuer: undefined,
      });

      continue;
    }

    if (balance.value === "0") continue;

    const tokenFromDb = await prisma.token.findFirst({
      where: {
        AND: [{ currencyHex: balance.currency }, { issuer: balance.issuer }],
      },
      select: { icon: true, name: true },
    });

    let icon = tokenFromDb?.icon;
    let name = tokenFromDb?.name;

    if (!icon || !name) {
      const metaRes = await xrplMeta.request({
        command: "token",
        token: { issuer: balance.issuer, currency: balance.currency },
      });

      if (metaRes) {
        icon = metaRes.result?.meta?.token?.icon || undefined;
        name = metaRes.result?.meta?.token?.name || undefined;
      }
    }

    const rawCurrency = balance.currency;
    balance.currency = formatCurrency(balance.currency);

    balances.push({
      ...balance,
      rawCurrency,
      icon: tokenFromDb?.icon || icon,
      name: tokenFromDb?.name || name,
      issuer: balance.issuer || undefined,
    });
  }

  res.json(balances);
});

/**
 * Route to get the balance of a token in the wallet
 */
router.get("/balance", withWallet, async (req: Request, res: Response) => {
  const { address } = req as WalletRequest;
  const { currency, issuer } = req.query;

  if (!currency) {
    res.json({ balance: 0 });
    return;
  }

  if (currency !== "XRP" && !issuer) {
    res.json({ balance: 0 });
    return;
  }

  const client = await xrplClient.connect();

  if (currency === "XRP" && !issuer) {
    const balance = await client.getXrpBalance(address);
    const networkFee = 24;
    const reserves = await calculateReserves(address, client);
    const availableBalance = Number(xrpToDrops(balance)) - reserves - networkFee;
    res.json({ balance: dropsToXrp(availableBalance) });
    return;
  }

  // find the balance of the token
  const balances = await client.request({
    command: "account_lines",
    account: address,
    peer: issuer as string,
    ledger_index: "validated",
  });

  const line = balances.result?.lines.find((l) => l.currency === currency && l.account === issuer);

  if (!line) {
    res.json({ balance: 0 });
    return;
  }

  res.json({ balance: Number(line.balance) });
});

const sendSchema = z.object({
  destination: z.string().min(1, "Destination address is required"),
  value: z.string().min(1, "Amount is required"), // this is the amount the user wants to send
  memo: z.string().optional(),
  destinationTag: z.string().optional(),
  selectedToken: z.object({
    rawCurrency: z.string().min(1, "Currency is required"),
    issuer: z.string().optional(),
    value: z.string().min(1, "Amount is required"), // this is the balance the user has in their wallet
  }),
});

router.post("/send", withWalletAction, async (req: Request, res: Response) => {
  const { wallet } = req as AuthRequest;
  const { destination, value, memo, destinationTag, selectedToken } = req.body as z.infer<
    typeof sendSchema
  >;

  const isValid = sendSchema.safeParse({ destination, value, memo, destinationTag, selectedToken });
  if (!isValid.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  if (!isValidClassicAddress(destination)) {
    res.status(400).json({ error: "Invalid destination address" });
    return;
  }

  if (Number(value) > Number(selectedToken.value)) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }

  const amount: Amount =
    selectedToken.rawCurrency === "XRP" && !selectedToken.issuer
      ? xrpToDrops(Number(value).toFixed(6))
      : {
          currency: selectedToken.rawCurrency,
          issuer: selectedToken.issuer as string,
          value,
        };

  const client = await xrplClient.connect();

  const payment: Payment = {
    TransactionType: "Payment",
    Account: wallet.classicAddress,
    Destination: destination,
    Amount: amount,
    ...(destinationTag && { DestinationTag: parseInt(destinationTag) }),
    ...(memo && { Memos: [{ Memo: { MemoData: Buffer.from(memo).toString("hex") } }] }),
  };

  // send the payment
  const prepared = await client.autofill(payment);
  const signed = wallet.sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);

  if (typeof tx.result.meta === "object") {
    if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
      res.status(400).json({ error: `Error sending ${formatCurrency(selectedToken.rawCurrency)}` });
      return;
    }
  }

  res.json({ message: "Transaction successful" });
});

export default router;
