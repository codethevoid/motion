import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { xrpClient } from "@/lib/xrp/http-client";
import { TrustSet, Wallet } from "xrpl";
import { TrustlineWithMeta } from "@/hooks/use-trustlines";
import { getToken } from "@/lib/middleware/utils/get-token";
import { decryptToken } from "@/lib/token";

type UpdateTrustlineRequest = {
  trustline: TrustlineWithMeta;
  limit: string;
  password: string;
};

export const POST = withWallet(async ({ req, wallet }) => {
  try {
    const { trustline, limit, password }: UpdateTrustlineRequest = await req.json();

    if (!trustline || !password) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (typeof limit !== "string") {
      return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
    }

    if (typeof trustline !== "object") {
      return NextResponse.json({ error: "Invalid trustline" }, { status: 400 });
    }

    const token = await getToken();
    const { privateKey, publicKey } = await decryptToken(token as string, password);
    if (!privateKey || !publicKey) {
      return NextResponse.json({ error: "Invalid password or token" }, { status: 401 });
    }

    const response = await xrpClient.getAccountLines(wallet.address);
    const accountLines = response.result?.lines || [];
    const existingTrustline = accountLines.find(
      (t) => t.currency === trustline.currency && t.account === trustline.account,
    );

    if (!existingTrustline) {
      return NextResponse.json({ error: "Trustline not found" }, { status: 400 });
    }

    // check balance
    const balance = existingTrustline.balance;
    if (Number(balance) > 0) {
      return NextResponse.json(
        { error: "You must sell off this currency in order to remove the trustline." },
        { status: 400 },
      );
    }

    // issued currencies in the XRP ledger can have no more than 15 significant digits
    const significantDigits = countSignificantDigits(limit);
    if (significantDigits > 15) {
      return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
    }

    const trustSet: TrustSet = {
      TransactionType: "TrustSet",
      Account: wallet.address,
      LimitAmount: {
        currency: trustline.currency,
        value: limit === "" ? "0" : limit,
        issuer: trustline.account,
      },
      Flags: 0x00020000,
    };

    const networkFee = await xrpClient.getNetworkFee();
    const sequence = await xrpClient.getSequence(wallet.address);
    const currentLedger = await xrpClient.getLedgerIndex();
    const prepared: TrustSet = {
      ...trustSet,
      Fee: networkFee.toString(),
      Sequence: sequence,
      LastLedgerSequence: currentLedger + 20,
    };

    const completeWallet = new Wallet(publicKey, privateKey);
    const signed = completeWallet.sign(prepared);
    const tx = await xrpClient.submitAndWait(signed.tx_blob);

    if (typeof tx.result?.meta === "object") {
      if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
        return NextResponse.json({ error: "Error updating trustline" }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "Trustline updated" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error updating trustline" }, { status: 400 });
  }
});

function countSignificantDigits(value: string) {
  const num = parseFloat(value).toExponential(); // Convert to scientific notation
  const significantPart = num.split("e")[0]; // Get the part before 'e'
  return significantPart.replace(".", "").length; // Count digits excluding the decimal point
}
