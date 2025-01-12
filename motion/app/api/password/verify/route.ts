import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { decryptToken } from "@/lib/token";
import { getToken } from "@/lib/middleware/utils/get-token";

export const POST = withWallet(async ({ req }) => {
  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Password is required" });

  const token = await getToken();
  try {
    await decryptToken(token as string, password);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
});
