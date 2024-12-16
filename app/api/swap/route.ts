import { NextResponse, unstable_after as after } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { FEE_PERCENTAGE } from "@/lib/xrp/constants";
import { decryptToken } from "@/lib/token";
import { getToken } from "@/lib/middleware/utils/get-token";
import { Transaction, Wallet, OfferCreate } from "xrpl";
import xrplClient from "@/lib/xrp/xrp-client";

export const maxDuration = 30;

type SwapRequest = {
  from: {
    value: string;
    currency: string;
    issuer: string;
    rawCurrency: string;
  };
  to: {
    value: string;
    currency: string;
    issuer: string;
    rawCurrency: string;
  };
  slippage: number;
  password: string;
  isMax: boolean;
  balance: number;
};

export const POST = withWallet(async ({ req }) => {
  try {
    const { from, to, slippage, password, isMax, balance } = (await req.json()) as SwapRequest;
    if (!from || !to || !password) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!from.value || isNaN(Number(from.value)) || Number(from.value) <= 0) {
      return NextResponse.json({ error: "Invalid 'from' value" }, { status: 400 });
    }

    if (!to.value || isNaN(Number(to.value)) || Number(to.value) <= 0) {
      return NextResponse.json({ error: "Invalid 'to' value" }, { status: 400 });
    }

    if (slippage < 1 || slippage > 50) {
      return NextResponse.json({ error: "Invalid slippage" }, { status: 400 });
    }

    // Get token and auth setup
    const token = await getToken();
    const { seed } = await decryptToken(token as string, password);
    if (!seed) {
      return NextResponse.json({ error: "Invalid password or token" }, { status: 401 });
    }

    // Setup wallet and fees
    const wallet = Wallet.fromSeed(seed);

    // our platform fees
    const fee = FEE_PERCENTAGE;
    let ourFeeInDrops = 0;

    // network fees
    const networkRes = await xrplClient.request({ command: "fee", ledger_index: "current" });
    const networkFee = Number(networkRes?.result.drops.median_fee) * 2 || 10_000;

    // check if we are swapping from XRP to another token
    if (from.currency === "XRP" && !from.issuer) {
      // calculate fee based on the amount of XRP we are swapping
      ourFeeInDrops = Number(from.value) * 1_000_000 * fee;
      // calculate available balance
      const balance = await xrplClient.getXrpBalance(wallet.address, {
        ledger_index: "validated",
      });
      const reserves = await calculateReserves(wallet.address);
      const toSwapInDrops = Number(from.value) * 1_000_000;
      const totalNeeded = toSwapInDrops + ourFeeInDrops + networkFee;
      const availableBalance = balance * 1_000_000 - reserves;
      if (availableBalance < totalNeeded) {
        return NextResponse.json({ error: "Insufficient XRP balance" }, { status: 400 });
      }
    } else {
      // calculate fee based on the amount of the token we are swapping
      // and its price in XRP
      const bookOffers = await xrplClient.request({
        command: "book_offers",
        taker: wallet.address,
        taker_gets:
          to.currency === "XRP"
            ? { currency: "XRP" }
            : {
                currency: to.rawCurrency,
                issuer: to.issuer,
              },
        taker_pays:
          to.currency === "XRP"
            ? {
                currency: from.rawCurrency,
                issuer: from.issuer,
              }
            : { currency: "XRP" },
        ledger_index: "validated",
      });

      const offer = bookOffers?.result.offers[0];
      if (!offer) {
        return NextResponse.json({ error: "No liquidity for this pair" }, { status: 400 });
      }

      // Adjust price calculation based on swap direction
      const xrpAmount =
        to.currency === "XRP"
          ? Math.floor(Number(offer.TakerGets) / 1_000_000)
          : Math.floor(Number(offer.TakerPays) / 1_000_000);

      const tokenAmount =
        to.currency === "XRP"
          ? typeof offer.TakerPays === "object"
            ? Number(offer.TakerPays.value)
            : Math.floor(Number(offer.TakerPays) / 1_000_000)
          : typeof offer.TakerGets === "object"
            ? Number(offer.TakerGets.value)
            : Math.floor(Number(offer.TakerGets) / 1_000_000);

      const priceInXrp = xrpAmount / tokenAmount;
      // caluclate xrp needed for the swap
      ourFeeInDrops = Math.floor(priceInXrp * Number(from.value) * 1_000_000 * fee);
      // caluclate xrp needed for the fee
      const balance = await xrplClient.getXrpBalance(wallet.address, {
        ledger_index: "validated",
      });
      const reserves = await calculateReserves(wallet.address);
      const totalNeeded = ourFeeInDrops + networkFee;
      const availableBalance = balance * 1_000_000 - reserves;
      if (availableBalance < totalNeeded) {
        return NextResponse.json({ error: "Insufficient XRP balance" }, { status: 400 });
      }
    }

    // now we need to submit the swap
    const swapDetails: OfferCreate = {
      TransactionType: "OfferCreate",
      Account: wallet.address,
      Flags: isMax ? 0x00080000 | 0x00040000 : 0x00040000,
      TakerPays:
        to.currency === "XRP" && !to.issuer
          ? Math.floor(Number(to.value) * 1_000_000 * (1 - slippage / 100)).toString()
          : {
              currency: to.rawCurrency,
              issuer: to.issuer,
              value: (Number(to.value) * (1 - slippage / 100)).toFixed(6),
            },
      TakerGets:
        from.currency === "XRP" && !from.issuer
          ? Math.floor(Number(from.value) * 1_000_000).toString()
          : {
              currency: from.rawCurrency,
              issuer: from.issuer,
              value: isMax ? balance.toFixed(6) : Number(from.value).toFixed(6),
            },
    };

    const prepared = await xrplClient.autofill(swapDetails);
    const signed = wallet.sign(prepared);
    const tx = await xrplClient.submitAndWait(signed.tx_blob);

    if (typeof tx.result?.meta === "object") {
      const status = tx.result.meta.TransactionResult;
      console.log("status", status);
      if (status === "tecKILLED") {
        return NextResponse.json(
          {
            error: "Transaction failed. Please try again or increase slippage.",
          },
          { status: 400 },
        );
      }
      if (status !== "tesSUCCESS") {
        return NextResponse.json({ error: "Error swapping tokens" }, { status: 500 });
      }
    }

    // now lastsly, we need to send the "ourFeeInDrops" to our fee wallet
    // if the fee is greater than the network fee, we need to send the fee to our fee wallet
    after(async () => {
      if (ourFeeInDrops > networkFee / 2) {
        const feeWallet = process.env.FEE_WALLET_ADDRESS!;
        const feeTxDetails = {
          TransactionType: "Payment" as const,
          Destination: feeWallet,
          Amount: ourFeeInDrops.toString(),
          Account: wallet.address,
        };
        const feePrepared = await xrplClient.autofill(feeTxDetails);
        const feeSigned = wallet.sign(feePrepared);

        try {
          const feeTx = await xrplClient.submitAndWait(feeSigned.tx_blob);
          console.log("feeTx", feeTx);
        } catch (e) {
          console.error(e);
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error swapping tokens" }, { status: 500 });
  }
});

// Helper function to calculate required reserves with new values
async function calculateReserves(address: string) {
  const accountInfo = await xrplClient.request({
    command: "account_info",
    account: address,
    ledger_index: "current",
  });
  // Base reserve (1 XRP)
  const baseReserve = 1_000_000; // in drops
  // Owner reserve (0.2 XRP per owned object)
  const ownerCount = accountInfo.result.account_data.OwnerCount;
  const ownerReserve = ownerCount * 200_000; // 0.2 XRP = 200,000 drops per item
  return baseReserve + ownerReserve;
}
