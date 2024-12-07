import { createWallet } from "@/lib/xrp";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(8).max(100),
  acknowledge: z.literal(true),
});

export const POST = async (request: NextRequest) => {
  try {
    const { password, acknowledge } = await request.json();

    const isValid = schema.safeParse({ password, acknowledge });
    if (!isValid.success) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const wallet = createWallet();
    return NextResponse.json(wallet);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
