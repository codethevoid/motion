import { NextResponse } from "next/server";
import xrplClient from "@/lib/xrp/xrp-client";

export const GET = async () => {
  const res = await xrplClient.request({ command: "fee" });
  const result = res?.result;
  if (!result) return NextResponse.json({ fee: 5000 });

  const medianFee = result.drops.median_fee;
  if (!medianFee) return NextResponse.json({ fee: 5000 });

  const fee = Number(medianFee) / 1_000_000;
  return NextResponse.json({ fee });
};
