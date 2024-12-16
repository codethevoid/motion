import { issueToken, setCookie } from "@/lib/token";
import bip39 from "bip39";
import { encodeSeed, deriveAddress, deriveKeypair } from "xrpl";

export const importWallet = async (mnemonic: string, password: string) => {
  // verify mnemoin
  const isValidMnemonic = bip39.validateMnemonic(mnemonic);
  if (!isValidMnemonic) return { error: "Invalid mnemonic" };

  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
  const truncatedSeed = seedBuffer.subarray(0, 16);
  const seed = encodeSeed(truncatedSeed, "ed25519");
  const keypair = deriveKeypair(seed);
  const address = deriveAddress(keypair.publicKey);

  // issue token
  const token = await issueToken({ seed }, address, password);
  await setCookie(token);
};
