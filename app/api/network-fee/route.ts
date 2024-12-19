import { NextResponse } from "next/server";
import { getXrpClient } from "@/lib/xrp/connect";

export const GET = async () => {
  const xrplClient = await getXrpClient();
  const res = await xrplClient.request({ command: "fee", ledger_index: "current" });
  const result = res?.result;
  if (!result) return NextResponse.json({ fee: 10000 });

  const medianFee = Number(result.drops.median_fee) || 5000;
  if (!medianFee) return NextResponse.json({ fee: 10000 });

  const fee = (Number(medianFee) / 1_000_000) * 2;
  await xrplClient.disconnect();
  return NextResponse.json({ fee });
};
