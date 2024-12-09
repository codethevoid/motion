import bip39 from "bip39";
import { deriveKeypair, deriveAddress } from "xrpl";
import { encodeSeed, Wallet } from "xrpl";
import xrplClient from "@/lib/xrp/xrp-client";

export const createWallet = () => {
  const mnemonic = bip39.generateMnemonic(); // 12-word mnemonic
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
  const truncatedSeed = seedBuffer.subarray(0, 16); // Use the first 16 bytes
  const seed = encodeSeed(truncatedSeed, "ed25519");
  const keypair = deriveKeypair(seed);
  const address = deriveAddress(keypair.publicKey);

  const wallet = Wallet.fromSeed(seed);
  // fund wallet if env is not production
  if (process.env.NODE_ENV === "development") {
    xrplClient.fundWallet(wallet);
    console.log("Test wallet funded");
  }

  // Return wallet details
  return {
    mnemonic,
    classicAddress: address,
    privateKey: keypair.privateKey,
    publicKey: keypair.publicKey,
    seed,
  };
};
