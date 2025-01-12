import { NextResponse } from "next/server";
import { getToken } from "@/lib/middleware/utils/get-token";
import { decryptToken } from "@/lib/token";
import { withWallet } from "@/lib/auth/with-wallet";
import type { TokenPayload } from "@/lib/token";

export const POST = withWallet(async ({ req }) => {
  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const token = await getToken();
    try {
      const payload = (await decryptToken(token as string, password)) as TokenPayload;
      return NextResponse.json({ privateKey: payload.privateKey });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to reveal seed" }, { status: 500 });
  }
});
