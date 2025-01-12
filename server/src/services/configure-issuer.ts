import { xrplClient } from "../lib/xrpl-client";
import { Wallet, AccountSet, AccountSetAsfFlags } from "xrpl";
import { prisma } from "../db/prisma";
import { customAlphabet } from "nanoid";

const baseUrl = () => {
  return process.env.NODE_ENV === "production" ? "motion.zip" : "localhost.test";
};

const generateDomain = async () => {
  const generate = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 4);
  let key = generate();
  while (await prisma.token.findUnique({ where: { domain: `${key}.${baseUrl()}` } })) {
    key = generate();
  }
  const domain = `${key}.${baseUrl()}`;
  const domainHex = Buffer.from(domain).toString("hex").toUpperCase();
  return { domain, domainHex };
};

export const configureIssuer = async (
  issuer: Wallet,
): Promise<{ domain: string } | { error: boolean }> => {
  const { domainHex, domain } = await generateDomain();

  const accountSet: AccountSet = {
    TransactionType: "AccountSet",
    Account: issuer.classicAddress,
    TransferRate: 0,
    TickSize: 15,
    SetFlag: AccountSetAsfFlags.asfDefaultRipple,
    Domain: domainHex,
  };

  const client = await xrplClient.connect();
  const prepared = await client.autofill(accountSet);
  const signed = issuer.sign(prepared);

  const res = await client.submitAndWait(signed.tx_blob);

  if (typeof res.result?.meta === "object") {
    if (res.result.meta.TransactionResult !== "tesSUCCESS") {
      console.error("Failed to configure issuer");
      return { error: true };
    }
  }

  return { domain };
};
