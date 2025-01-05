import { NextRequest, NextResponse } from "next/server";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";
import { xrpClient } from "@/lib/xrp/http-client";
import { dropsToXrp } from "xrpl";

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const currency = url.searchParams.get("currency") || "";
    const issuer = url.searchParams.get("issuer") || "";
    console.log("currency", currency);
    console.log("issuer", issuer);

    if (!currency || !issuer) {
      return NextResponse.json({ error: "Missing currency or issuer" }, { status: 400 });
    }

    // https://s1.xrplmeta.org/token/{identifier}
    // identifier = currency:issuer
    const identifier = `${currency}:${issuer}`;
    console.log("identifier", identifier);
    const res = await fetch(`https://s1.xrplmeta.org/token/${identifier}?include_changes=true`);
    console.log("res", res);
    if (!res.ok) {
      return NextResponse.json({ error: "Error fetching token metrics" }, { status: 500 });
    }
    const data = await res.json();

    const liquidityRes = await xrpClient.getLiquidity({ currency, issuer });
    console.log("liquidityRes", liquidityRes);
    const xrpValueInUsd = await getXrpValueInUsd();
    let liquidity = 0;

    // check if liquidiy not found
    if ("error" in liquidityRes.result) {
      if (liquidityRes.result.error === "actNotFound") {
        return NextResponse.json({ ...data, xrpValueInUsd, liquidity: "n/a" });
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

    return NextResponse.json({ ...data, xrpValueInUsd, liquidity });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching token metrics" }, { status: 500 });
  }
};
