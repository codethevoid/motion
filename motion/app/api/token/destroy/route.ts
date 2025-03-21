import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";

export const GET = withWallet(async () => {
  const response = NextResponse.json({ message: "Token destroyed" });
  response.cookies.set("wallet", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return response;
});
