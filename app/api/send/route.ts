import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { getToken } from "@/lib/middleware/utils/get-token";
import { decryptToken } from "@/lib/token";
import { Amount, Payment, Wallet, xrpToDrops, isValidClassicAddress } from "xrpl";
import { z } from "zod";
import { SelectedToken } from "@/components/wallet/send";
import { xrpClient } from "@/lib/xrp/http-client";

export const maxDuration = 30;

const schema = z.object({
  destination: z.string().min(1, "Destination address is required"),
  value: z.string().min(1, "Amount is required"),
  memo: z.string().optional(),
});

type SendRequest = {
  destination: string;
  value: string;
  memo: string;
  destinationTag: string;
  selectedToken: SelectedToken;
  password: string;
};

export const POST = withWallet(async ({ req }) => {
  try {
    const { destination, value, selectedToken, memo, password, destinationTag } =
      (await req.json()) as SendRequest;

    const isValid = schema.safeParse({ destination, value, memo });
    if (!isValid.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!isValidClassicAddress(destination)) {
      return NextResponse.json({ error: "Invalid destination address" }, { status: 400 });
    }

    // check if value exceeds balance
    if (Number(value) > Number(selectedToken.value)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Get token and auth setup
    const token = await getToken();
    const { privateKey, publicKey } = await decryptToken(token as string, password);
    if (!privateKey || !publicKey) {
      return NextResponse.json({ error: "Invalid password or token" }, { status: 401 });
    }

    const amount: Amount =
      selectedToken.currency === "XRP" && !selectedToken.issuer
        ? xrpToDrops(Number(value))
        : {
            currency: selectedToken.rawCurrency,
            issuer: selectedToken.issuer || "",
            value: value,
          };

    // Setup wallet and fees
    const wallet = new Wallet(publicKey, privateKey);
    const memoHex = memo ? Buffer.from(memo).toString("hex") : undefined;

    const payment: Payment = {
      TransactionType: "Payment",
      Account: wallet.address,
      Destination: destination,
      Amount: amount,
      ...(destinationTag && { DestinationTag: parseInt(destinationTag) }),
      ...(memoHex && { Memos: [{ Memo: { MemoData: memoHex } }] }),
    };

    const [networkFee, sequence, currentLedger] = await Promise.all([
      xrpClient.getNetworkFee(),
      xrpClient.getSequence(wallet.address),
      xrpClient.getLedgerIndex(),
    ]);
    const prepared: Payment = {
      ...payment,
      Fee: networkFee.toString(),
      Sequence: sequence,
      LastLedgerSequence: currentLedger + 20,
    };
    const signed = wallet.sign(prepared);
    // const tx = await xrplClient.submitAndWait(signed.tx_blob);

    const tx = await xrpClient.submitAndWait(signed.tx_blob);
    console.log("tx", tx);

    if (typeof tx.result.meta === "object") {
      if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
        return NextResponse.json({ error: "Transaction failed" }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send transaction" }, { status: 500 });
  }
});
