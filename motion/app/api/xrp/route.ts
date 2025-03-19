import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";
import { NextResponse } from "next/server";

// we just return the price of XRP in USD
export const GET = async () => {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    return NextResponse.json({ error: "Maintenance mode is active" }, { status: 503 });
  }

  const xrpPrice = await getXrpValueInUsd();
  return NextResponse.json(xrpPrice);
};
