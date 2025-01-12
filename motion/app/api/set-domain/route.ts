import { withWallet } from "@/lib/auth/with-wallet";
import { NextResponse } from "next/server";
import { xrpClient } from "@/lib/xrp/http-client";
import { Wallet, AccountSet } from "xrpl";
import { getToken } from "@/lib/middleware/utils/get-token";
import { decryptToken } from "@/lib/token";

export const GET = withWallet(async ({ req }) => {
  try {
    const body = (await req.json()) as { password: string };
    const { password = "ryanthomas" } = body;

    const token = await getToken();
    if (!token) return NextResponse.json({ error: "No token found" }, { status: 401 });
    const decryptedToken = await decryptToken(token, password);

    const { privateKey, publicKey } = decryptedToken;
    const devWallet = new Wallet(publicKey, privateKey);

    const domainHex = Buffer.from("motion.zip").toString("hex").toUpperCase();

    const [networkFee, sequence, currentLedger] = await Promise.all([
      xrpClient.getNetworkFee(),
      xrpClient.getSequence(devWallet.address),
      xrpClient.getLedgerIndex(),
    ]);

    const tx: AccountSet = {
      TransactionType: "AccountSet",
      Account: devWallet.address,
      Domain: domainHex,
      Fee: networkFee.toString(),
      Sequence: sequence,
      LastLedgerSequence: currentLedger + 50,
    };

    const signed = devWallet.sign(tx);
    const response = await xrpClient.submitAndWait(signed.tx_blob);

    if (typeof response.result?.meta === "object") {
      if (response.result.meta.TransactionResult !== "tesSUCCESS") {
        return NextResponse.json({ error: "Failed to set domain" }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to set domain" }, { status: 500 });
  }
});
