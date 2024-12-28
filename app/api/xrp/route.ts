import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";
import { NextResponse } from "next/server";

// we just return the price of XRP in USD
export const GET = async () => {
  const xrpPrice = await getXrpValueInUsd();
  return NextResponse.json(xrpPrice);
};
