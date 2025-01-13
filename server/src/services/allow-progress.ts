import { tokenSchema, type TokenSchema } from "@motion/shared/zod";
import {
  ISSUER_CREATION_FEE,
  TRUSTLINE_FEE,
  POOL_CREATION_FEE,
  MOTION_ZIP_FEE,
  LP_WALLET_CREATION_FEE,
  LP_WALLET_TRUSTLINE_FEE,
  LP_DEV_WALLET_TRUSTLINE_FEE,
  BUFFER_FEE,
} from "@motion/shared/constants";
import { xrplClient } from "../lib/xrpl-client.js";
import { Wallet, Client, xrpToDrops } from "xrpl";

const motionZipFee = () => {
  return process.env.NODE_ENV === "development" ? 0 : MOTION_ZIP_FEE;
};

const calculateReserves = async (address: string, client: Client) => {
  const accountInfo = await client.request({
    command: "account_info",
    account: address,
    ledger_index: "validated",
  });
  const baseReserve = 1_000_000;
  const ownerCount = accountInfo.result?.account_data.OwnerCount;
  const ownerReserve = ownerCount * 200_000;
  return baseReserve + ownerReserve;
};

const getTotalXrpNeeded = (poolAmount: number) => {
  return (
    poolAmount +
    ISSUER_CREATION_FEE +
    TRUSTLINE_FEE +
    POOL_CREATION_FEE +
    motionZipFee() +
    LP_WALLET_CREATION_FEE +
    LP_WALLET_TRUSTLINE_FEE +
    LP_DEV_WALLET_TRUSTLINE_FEE +
    BUFFER_FEE
  );
};

export const allowProgress = async (
  data: TokenSchema,
  wallet: Wallet,
): Promise<{ allow: boolean; error?: string }> => {
  try {
    // validate form data
    const parsed = tokenSchema.safeParse({ ...data });
    if (!parsed.success) {
      return { allow: false, error: "Invalid form data" };
    }

    // // check image and banner sizes
    const iconSizeInMb = data.icon.size / (1024 * 1024);
    if (iconSizeInMb > 5) {
      return { allow: false, error: "Icon must be less than 5MB" };
    }

    const bannerSizeInMb = data.banner.size / (1024 * 1024);
    if (bannerSizeInMb > 5) {
      return { allow: false, error: "Banner must be less than 5MB" };
    }

    // check if the wallet has enough XRP
    const client = await xrplClient.connect();
    const totalXrpNeeded = getTotalXrpNeeded(data.poolAmount).toFixed(6);
    const balance = await client.getXrpBalance(wallet.classicAddress); // returns xrp in xrp (10.25)
    const reserves = await calculateReserves(wallet.classicAddress, client);
    const availableBalance = Number(xrpToDrops(balance)) - reserves;

    if (availableBalance < Number(xrpToDrops(totalXrpNeeded))) {
      return { allow: false, error: "Insufficient XRP balance" };
    }

    return { allow: true };
  } catch (e) {
    console.error(e);
    return { allow: false, error: "Something went wrong" };
  }
};
