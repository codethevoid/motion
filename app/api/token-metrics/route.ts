import { NextRequest, NextResponse } from "next/server";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";

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

    const xrpValueInUsd = await getXrpValueInUsd();
    return NextResponse.json({ ...data, xrpValueInUsd });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching token metrics" }, { status: 500 });
  }
};
