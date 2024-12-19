import { issueToken, setCookie } from "@/lib/token";
import { validateMnemonic } from "bip39";
import { Wallet } from "xrpl";

export const importWallet = async (
  mnemonic: string | undefined,
  seed: string | undefined,
  password: string,
  method: "mnemonic" | "seed",
) => {
  // verify mnemoin
  if (method === "mnemonic" && mnemonic) {
    const isValidMnemonic = validateMnemonic(mnemonic);
    if (!isValidMnemonic) return { error: "Invalid mnemonic" };

    const wallet = Wallet.fromMnemonic(mnemonic);
    const address = wallet.classicAddress;
    const { privateKey, publicKey } = wallet;

    // issue token
    const token = await issueToken({ privateKey, publicKey }, address, password);
    await setCookie(token);
  } else if (method === "seed" && seed) {
    const wallet = Wallet.fromSeed(seed);
    const address = wallet.classicAddress;
    const { privateKey, publicKey } = wallet;
    // issue token
    const token = await issueToken({ privateKey, publicKey }, address, password);
    await setCookie(token);
  }
};
