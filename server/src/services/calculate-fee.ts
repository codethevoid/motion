import { Amount, dropsToXrp, xrpToDrops, Wallet, Client } from "xrpl";
import { calculateReserves } from "../lib/helpers/calc-reserves.js";
import { getXrpPrice } from "../utils/xrp-price.js";

const FEE_PERCENTAGE = 0.01;
const BUFFER_DROPS = 1000;

export const calculateFee = async ({
  amountToDeliver,
  amountToReceive,
  slippage,
  client,
  wallet,
  xrpPrice,
}: {
  amountToDeliver: Amount;
  amountToReceive: Amount;
  slippage: number;
  client: Client;
  wallet: Wallet;
  xrpPrice: number;
}): Promise<{ error: string } | { totalFeeInDrops: string; tradeValueInDrops: string }> => {
  let totalFeeInDrops = "0";
  let tradeValueInDrops = "0";

  if (typeof amountToDeliver === "string") {
    // means they are buying a custom token with XRP
    const fee = Number(amountToDeliver) * FEE_PERCENTAGE;
    tradeValueInDrops = Math.floor(Number(amountToDeliver)).toString();
    totalFeeInDrops = Math.floor(fee).toString();
    if (dropsToXrp(totalFeeInDrops) * xrpPrice > 100) {
      // calculate the amount of XRP needed for $100
      const xrpToCharge = 100 / xrpPrice;
      totalFeeInDrops = xrpToDrops(xrpToCharge.toFixed(6));
    }

    // check if the user has enough XRP to cover the trade and the fee
    const balance = await client.getXrpBalance(wallet.classicAddress);
    const reserves = await calculateReserves(wallet.classicAddress, client);
    const availableBalance = Number(xrpToDrops(balance)) - reserves;
    const totalNeeded = Number(amountToDeliver) + Number(totalFeeInDrops) + BUFFER_DROPS;

    if (availableBalance < totalNeeded) return { error: "Insufficient XRP balance" };
  } else {
    // means they are selling a custom token for XRP
    const tokenRes = await fetch(
      `https://s1.xrplmeta.org/token/${amountToDeliver.currency}:${amountToDeliver.issuer}`,
    );
    if (!tokenRes.ok) return { error: "Error getting price of token" };

    const tokenData = (await tokenRes.json()) as { metrics: { price: number } };
    const tokenPrice = tokenData?.metrics?.price;
    if (!tokenPrice) return { error: "Error getting price of token" };

    const xrpEquivalent = tokenPrice * Number(amountToDeliver.value);
    const fee = Number(xrpToDrops(xrpEquivalent.toFixed(6))) * FEE_PERCENTAGE;
    tradeValueInDrops = xrpToDrops(xrpEquivalent.toFixed(6));
    totalFeeInDrops = Math.floor(fee).toString();
    if (dropsToXrp(totalFeeInDrops) * xrpPrice > 100) {
      const xrpToCharge = 100 / xrpPrice;
      totalFeeInDrops = xrpToDrops(xrpToCharge.toFixed(6));
    }

    // check if the user has enough XRP to cover the trade and the fee
    const balance = await client.getXrpBalance(wallet.classicAddress);
    const reserves = await calculateReserves(wallet.classicAddress, client);
    const totalNeeded = Number(totalFeeInDrops) + BUFFER_DROPS; // 0.001 for an extra buffer

    // with custom tokens, we need to check if the user has enough XRP
    // to cover the trade and the fee AFTER the trade is complete
    const slippageMultiplier = 1 - slippage / 100;
    let minimumXrpToReceiveInDrops = "0";
    if (typeof amountToReceive === "string") {
      minimumXrpToReceiveInDrops = Math.floor(
        Number(amountToReceive) * slippageMultiplier,
      ).toString();
    }

    const availableBalance =
      Number(xrpToDrops(balance)) + Number(minimumXrpToReceiveInDrops) - reserves;

    if (availableBalance < totalNeeded) return { error: "Insufficient XRP balance" };
  }

  return { totalFeeInDrops, tradeValueInDrops };
};
