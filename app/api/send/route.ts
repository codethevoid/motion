import { NextResponse, unstable_after as after } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { getXrpClient } from "@/lib/xrp/connect";
import { getToken } from "@/lib/middleware/utils/get-token";
import { decryptToken } from "@/lib/token";
import { Amount, Payment, Wallet, xrpToDrops, isValidClassicAddress, TrustSet } from "xrpl";
import { z } from "zod";
import { SelectedToken } from "@/app/wallet.davincii.io/(dashboard)/(wallet)/send/client";

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
  selectedToken: SelectedToken;
  password: string;
};

export const POST = withWallet(async ({ req }) => {
  try {
    const { destination, value, selectedToken, memo, password } = (await req.json()) as SendRequest;
    const xrplClient = await getXrpClient();

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
      ...(memoHex ? { Memos: [{ Memo: { MemoData: memoHex } }] } : {}),
    };

    const prepared = await xrplClient.autofill(payment);
    const signed = wallet.sign(prepared);
    const tx = await xrplClient.submitAndWait(signed.tx_blob);
    console.log(tx);

    if (typeof tx.result.meta === "object") {
      if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
        return NextResponse.json({ error: "Transaction failed" }, { status: 400 });
      }
    }

    after(async () => {
      setTimeout(async () => {
        const accountLines = await xrplClient.request({
          command: "account_lines",
          account: wallet.address,
          ledger: "current",
        });

        console.log(accountLines.result?.lines);

        const trust = accountLines.result?.lines.find(
          (line) =>
            line.currency === selectedToken.rawCurrency && line.account === selectedToken.issuer,
        );

        if (trust && trust.balance === "0") {
          // Remove trust line by setting limit to 0
          const trustSet: TrustSet = {
            Account: wallet.address,
            TransactionType: "TrustSet",
            LimitAmount: {
              currency: selectedToken.rawCurrency,
              issuer: selectedToken.issuer || "",
              value: "0",
            },
            Flags: 0x00020000,
          };
          const prepared = await xrplClient.autofill(trustSet);
          const signed = wallet.sign(prepared);
          const tx = xrplClient.submit(signed.tx_blob);
          console.log("Trust line removed:", tx);
        }
      }, 2000); // Wait for 2 seconds before removing trust line so the transaction can be confirmed
    });

    await xrplClient.disconnect();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send transaction" }, { status: 500 });
  }
});
