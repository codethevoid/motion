import { withWallet } from "@/lib/auth/with-wallet";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";
import { NextResponse } from "next/server";

// we just return the price of XRP in USD
// and just make sure someone is logged in with their wallet
// to prevent random people from hitting this endpoint
export const GET = withWallet(async ({}) => {
  const xrpPrice = await getXrpValueInUsd();
  return NextResponse.json({ price: xrpPrice });
});
