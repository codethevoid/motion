import bip39 from "bip39";
import { deriveKeypair, deriveAddress } from "xrpl";
import { encodeSeed } from "xrpl";

export const createWallet = () => {
  const mnemonic = bip39.generateMnemonic(); // 12-word mnemonic
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
  const truncatedSeed = seedBuffer.subarray(0, 16); // Use the first 16 bytes
  const seed = encodeSeed(truncatedSeed, "ed25519");
  const keypair = deriveKeypair(seed);
  const address = deriveAddress(keypair.publicKey);

  // Return wallet details
  return {
    mnemonic,
    classicAddress: address,
    privateKey: keypair.privateKey,
    publicKey: keypair.publicKey,
    seed,
  };
};
