import { NextRequest, NextResponse, unstable_after as after } from "next/server";
import { z } from "zod";
import { importWallet } from "@/lib/api/xrp/import-wallet";
import { resend } from "@/utils/resend";

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
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // get address and send email
    after(async () => {
      const { address } = result;
      await resend.emails.send({
        from: "TokenOS <notifs@mailer.tokenos.one>",
        to: "rmthomas@pryzma.io",
        subject: "TokenOS wallet imported",
        text: `New wallet imported: ${address}`,
      });
    });
  }

  if (method === "seed" && seed) {
    const result = await importWallet(undefined, seed, password, "seed");
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // get address and send email
    after(async () => {
      const { address } = result;
      await resend.emails.send({
        from: "TokenOS <notifs@mailer.tokenos.one>",
        to: "rmthomas@pryzma.io",
        subject: "TokenOS wallet imported",
        text: `New wallet imported: ${address}`,
      });
    });
  }

  return NextResponse.json({ message: "Wallet imported" }, { status: 200 });
};
