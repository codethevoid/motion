import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importWallet } from "@/lib/api/xrp/import-wallet";

const schema = z.object({
  password: z.string().min(8).max(100),
  acknowledge: z.literal(true),
  mnemonic: z.string().min(1),
});

export const POST = async (req: NextRequest) => {
  const { password, acknowledge, mnemonic } = await req.json();

  const isValid = schema.safeParse({ password, acknowledge, mnemonic });
  if (!isValid.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await importWallet(mnemonic, password);
  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ message: "Wallet imported" }, { status: 200 });
};
