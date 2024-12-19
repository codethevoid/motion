import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { destroyToken } from "@/lib/token";

export const GET = withWallet(async () => {
  await destroyToken();
  return NextResponse.json({ message: "Token destroyed" });
});
