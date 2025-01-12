import { xrpClient } from "@/lib/xrp/http-client";
import { Wallet, AccountSet, AccountSetAsfFlags } from "xrpl";
import prisma from "@/db/prisma";
import { customAlphabet } from "nanoid";

const usedDomainsNotInDb = new Set<string>([]);

const getDomain = async () => {
  const generate = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 4);
  let key = generate();
  while (
    (await prisma.token.findUnique({ where: { domain: `${key}.motion.zip` } })) ||
    usedDomainsNotInDb.has(`${key}.motion.zip`)
  ) {
    key = generate();
  }
  const domain = `${key}.motion.zip`;
  const domainHex = Buffer.from(domain).toString("hex").toUpperCase();
  return { domain, domainHex };
};

export const configureIssuer = async (issuerWallet: Wallet) => {
  const [networkFee, sequence, currentLedger] = await Promise.all([
    xrpClient.getNetworkFee(),
    xrpClient.getSequence(issuerWallet.address),
    xrpClient.getLedgerIndex(),
  ]);

  const { domain, domainHex } = await getDomain();

  const prepared: AccountSet = {
    TransactionType: "AccountSet",
    Account: issuerWallet.address,
    TransferRate: 0,
    TickSize: 15,
    SetFlag: AccountSetAsfFlags.asfDefaultRipple,
    Domain: domainHex,
    Fee: networkFee.toString(),
    Sequence: sequence,
    LastLedgerSequence: currentLedger + 20,
  };

  const signed = issuerWallet.sign(prepared);
  const response = await xrpClient.submitAndWait(signed.tx_blob);
  if (typeof response.result?.meta === "object") {
    if (response.result.meta.TransactionResult === "tesSUCCESS") {
      return { domain };
    }
  }
  return false;
};
