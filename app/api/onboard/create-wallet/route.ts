import { createWallet } from "@/lib/api/xrp/create-wallet";
import { NextResponse, NextRequest, unstable_after as after } from "next/server";
import { z } from "zod";
import { resend } from "@/utils/resend";

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

    after(async () => {
      await resend.emails.send({
        from: "TokenOS <notifs@mailer.tokenos.one>",
        to: "rmthomas@pryzma.io",
        subject: "TokenOS wallet created",
        text: `New wallet created: ${wallet.classicAddress}`,
      });
    });

    return NextResponse.json(wallet);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
