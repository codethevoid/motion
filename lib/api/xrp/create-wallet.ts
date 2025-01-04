import { generateMnemonic } from "bip39";
import { Wallet } from "xrpl";
import prisma from "@/db/prisma";
import { nanoid } from "@/utils/alphabet";
import { cookies } from "next/headers";

export const createWallet = async () => {
  const mnemonic = generateMnemonic();
  const wallet = Wallet.fromMnemonic(mnemonic);

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

  // create a wallet in the database
  await prisma.wallet.create({
    data: {
      address: wallet.classicAddress,
      referralKey,
      ...(referralWallet && { referredBy: referralWallet.address }),
    },
  });

  return {
    mnemonic,
    classicAddress: wallet.classicAddress,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
  };
};
