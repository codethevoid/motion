import express, { Request, Response } from "express";
import { xrplMeta } from "../lib/xrpl-meta.js";
import { getXrpPrice } from "../utils/xrp-price.js";
import { xrplClient } from "../lib/xrpl-client.js";
import { prisma } from "../db/prisma.js";
import { AMMInfoResponse, dropsToXrp } from "xrpl";

const router = express.Router();

/**
 * General token search
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const name = req.query.name || "";
    const page = req.query.page || 0;
    const limit = req.query.limit || 25;
    const offset = Number(page) * Number(limit);

    const response = await xrplMeta.request({
      command: "tokens",
      name_like: name,
      include_changes: true,
      sort_by: "exchanges_7d",
      offset,
      limit: Number(limit),
    });

    res
      .status(200)
      .json({ tokens: response.result?.tokens || [], total: response.result?.count || 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Token metrics (liquidity, price, etc)
 */
router.get("/metrics", async (req: Request, res: Response) => {
  try {
    const currency = req.query.currency || "";
    const issuer = req.query.issuer || "";

    if (!currency || !issuer) {
      res.status(400).json({ error: "Missing currency or issuer" });
      return;
    }

    const response = await xrplMeta.request({
      command: "token",
      token: { currency, issuer },
      include_changes: true,
    });
    const data = response?.result || {};

    const client = await xrplClient.connect();
    const xrpValueInUsd = await getXrpPrice();
    let liquidityRes: AMMInfoResponse = {} as AMMInfoResponse;
    let liquidity: number | "n/a" = 0;

    // fetch liquidity
    try {
      liquidityRes = await client.request({
        command: "amm_info",
        asset: { currency: currency as string, issuer: issuer as string },
        asset2: { currency: "XRP" },
      });
    } catch (e) {
      if (e instanceof Error && e.message === "Account not found.") {
        console.log(e.message);
        liquidity = "n/a";
      }
    }

    // add up total liquidity in usd
    if (typeof liquidityRes.result?.amm.amount === "object") {
      const issuedTokenAmount = liquidityRes.result.amm.amount.value;
      const xrpEquivalent = Number(issuedTokenAmount) * Number(data.metrics?.price);
      const issuedTokenAmountInUsd = xrpEquivalent * xrpValueInUsd;
      if (typeof liquidityRes.result?.amm.amount2 === "string") {
        const xrpAmount = dropsToXrp(liquidityRes.result.amm.amount2);
        const xrpAmountInUsd = Number(xrpAmount) * xrpValueInUsd;
        liquidity = issuedTokenAmountInUsd + xrpAmountInUsd;
      }
    }

    // fetch token data from db (and see if it exists)
    const token = await prisma.token.findFirst({
      where: {
        AND: [{ currencyHex: currency as string }, { issuer: issuer as string }],
      },
    });

    if (token && data.meta?.token) {
      const { name, icon, website, telegram, x, description, banner } = token;

      // Initialize base data
      data.meta.token = {
        ...data.meta.token,
        name,
        icon,
        description,
        banner,
        weblinks: [], // Initialize empty array
        inDb: true,
      };

      // Build weblinks array
      const weblinks = [];
      if (website) weblinks.push({ title: "Official website", url: website });
      if (telegram) weblinks.push({ title: "Telegram", url: telegram });
      if (x) weblinks.push({ title: "X", url: x });

      // Assign weblinks
      data.meta.token.weblinks = weblinks.reverse();
    }

    res.json({ ...data, xrpValueInUsd, liquidity });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error fetching token metrics" });
  }
});

/**
 * Route to get token's current price
 */
router.get("/price", async (req: Request, res: Response) => {
  const currency = req.query.currency || "";
  const issuer = req.query.issuer || "";

  if (!currency || !issuer) {
    res.status(400).json({ error: "Missing currency or issuer" });
    return;
  }

  // get price of token in usd
  const response = await xrplMeta.request({
    command: "token",
    token: { currency, issuer },
  });

  // get price of xrp in usd
  const xrpPrice = await getXrpPrice();
  const price = Number(response.result?.metrics?.price);
  if (!price) {
    res.json({ price: 0 });
    return;
  }
  const priceInUsd = price * xrpPrice;

  res.json({ price: priceInUsd });
});

export default router;
