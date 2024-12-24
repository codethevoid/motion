import { NextRequest, NextResponse } from "next/server";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";

export const GET = async (req: NextRequest) => {
  const url = req.nextUrl;
  const currency = url.searchParams.get("currency") || "";
  const issuer = url.searchParams.get("issuer") || "";

  if (!currency || !issuer) {
    return NextResponse.json({ error: "Missing currency or issuer" }, { status: 400 });
  }

  // https://s1.xrplmeta.org/token/{identifier}
  // identifier = currency:issuer
  const identifier = `${currency}:${issuer}`;
  const res = await fetch(`https://s1.xrplmeta.org/token/${identifier}?include_changes=true`);
  if (!res.ok) throw new Error("Error fetching token metrics");
  const data = await res.json();

  const xrpValueInUsd = await getXrpValueInUsd();
  return NextResponse.json({ ...data, xrpValueInUsd });
};
