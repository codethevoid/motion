import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importWallet } from "@/lib/api/xrp/import-wallet";

const schema = z.object({
  password: z.string().min(8).max(100),
  acknowledge: z.literal(true),
  mnemonic: z.string().optional(),
  seed: z.string().optional(),
  method: z.enum(["mnemonic", "seed"]),
});

export const POST = async (req: NextRequest) => {
  const { password, acknowledge, mnemonic, seed, method } = await req.json();

  const isValid = schema.safeParse({ password, acknowledge, mnemonic, seed, method });
  if (!isValid.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (method === "mnemonic" && mnemonic) {
    const result = await importWallet(mnemonic, undefined, password, "mnemonic");
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  }

  if (method === "seed" && seed) {
    const result = await importWallet(undefined, seed, password, "seed");
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  }

  return NextResponse.json({ message: "Wallet imported" }, { status: 200 });
};
