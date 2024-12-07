import { NextResponse, NextRequest } from "next/server";
import { issueToken, setCookie } from "@/lib/token";

export const POST = async (req: NextRequest) => {
  try {
    const { address, seed, password } = await req.json();
    const payload = { seed };
    const token = await issueToken(payload, address, password);
    await setCookie(token);

    return NextResponse.json({ message: "Token set" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error setting token" }, { status: 500 });
  }
};
