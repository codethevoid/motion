import { NextResponse, NextRequest } from "next/server";
import { AccountLinesTrustline } from "xrpl";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const currency = url.searchParams.get("currency");
    const issuer = url.searchParams.get("issuer");

    if (!currency || !issuer) {
      return NextResponse.json({ error: "Missing currency or issuer" }, { status: 400 });
    }

    // get supply so we can calculate percentage
    const identifier = `${currency}:${issuer}`;

    const [xrpPrice, metricRes, res] = await Promise.all([
      getXrpValueInUsd(),
      fetch(`https://s1.xrplmeta.org/token/${identifier}`),
      fetch(`https://api.xrpscan.com/api/v1/account/${issuer}/trustlines2`),
    ]);

    const metricData = await metricRes.json();
    const supply = metricData.metrics.supply;
    const priceInXrp = metricData.metrics.price;
    const usdPrice = priceInXrp * xrpPrice;

    const data = await res.json();
    const lines = data.lines
      .filter((line: AccountLinesTrustline) => {
        if (line.currency === currency && Math.abs(Number(line.balance)) > 0) {
          return true;
        }
        return false;
      })
      .sort((a: AccountLinesTrustline, b: AccountLinesTrustline) => {
        return Number(a.balance) - Number(b.balance);
      })
      .map((line: AccountLinesTrustline) => ({
        wallet: line.account,
        balance: Math.abs(Number(line.balance)),
        percent: (Math.abs(Number(line.balance)) / supply) * 100,
        value: Math.abs(Number(line.balance)) * usdPrice,
      }))
      .slice(0, 200);

    return NextResponse.json(lines);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
