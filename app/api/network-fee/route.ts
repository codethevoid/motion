import { NextResponse } from "next/server";
// import { getXrpClient } from "@/lib/xrp/connect";
import { xrpClient } from "@/lib/xrp/http-client";
import { dropsToXrp } from "xrpl";

// This route is used only for swapping feature
// we multiply the network fee by 2 to give it more room for our fee that we apply
export const GET = async () => {
  const networkFee = await xrpClient.getNetworkFee();
  const finalFee = dropsToXrp(networkFee * 2);
  return NextResponse.json({ fee: finalFee });
};
