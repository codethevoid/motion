import { issueToken, setCookie } from "@/lib/token";
import { validateMnemonic } from "bip39";
import { Wallet } from "xrpl";
import prisma from "@/db/prisma";
import { nanoid } from "@/utils/alphabet";
import { cookies } from "next/headers";

export const importWallet = async (
  mnemonic: string | undefined,
  seed: string | undefined,
  password: string,
  method: "mnemonic" | "seed",
): Promise<{ address: string } | { error: string }> => {
  // verify mnemonic
  if (method === "mnemonic" && mnemonic) {
    const isValidMnemonic = validateMnemonic(mnemonic);
    if (!isValidMnemonic) return { error: "Invalid mnemonic" };

    const wallet = Wallet.fromMnemonic(mnemonic);
    console.log(wallet);
    const address = wallet.classicAddress;
    const { privateKey, publicKey } = wallet;

    // issue token
    const token = await issueToken({ privateKey, publicKey }, address, password);
    await setCookie(token);

    // create a wallet in the database if it doesn't exist
    // since we are importing a wallet, we need to check if it exists already in the db
    const isExisting = await prisma.wallet.findUnique({ where: { address } });
    if (!isExisting) {
      // generate referral key
      let referralKey = nanoid();
      while (await prisma.wallet.findUnique({ where: { referralKey } })) {
        referralKey = nanoid();
      }

      // check if there is a referrer cookie
      const cookieStore = await cookies();
      const referrer = cookieStore.get("ref")?.value;

      const referralWallet = referrer
        ? await prisma.wallet.findUnique({ where: { referralKey: referrer } })
        : null;

      // create a wallet in the db
      await prisma.wallet.create({
        data: {
          address,
          referralKey,
          ...(referralWallet && { referredBy: referralWallet.address }),
        },
      });
    }

    return { address };
  } else if (method === "seed" && seed) {
    const wallet = Wallet.fromSeed(seed);
    console.log(wallet);
    const address = wallet.classicAddress;
    const { privateKey, publicKey } = wallet;
    // issue token
    const token = await issueToken({ privateKey, publicKey }, address, password);
    await setCookie(token);

    // create a wallet in the database if it doesn't exist
    // since we are importing a wallet, we need to check if it exists already in the db
    const isExisting = await prisma.wallet.findUnique({ where: { address } });
    if (!isExisting) {
      // generate referral key
      let referralKey = nanoid();
      while (await prisma.wallet.findUnique({ where: { referralKey } })) {
        referralKey = nanoid();
      }

      // check if there is a referrer cookie
      const cookieStore = await cookies();
      const referrer = cookieStore.get("ref")?.value;

      const referralWallet = referrer
        ? await prisma.wallet.findUnique({ where: { referralKey: referrer } })
        : null;

      // create a wallet in the db
      await prisma.wallet.create({
        data: {
          address,
          referralKey,
          ...(referralWallet && { referredBy: referralWallet.address }),
        },
      });
    }

    return { address };
  }

  return { error: "Invalid request" };
};
