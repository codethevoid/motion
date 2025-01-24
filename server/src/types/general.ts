import { AccountLinesTrustline } from "xrpl";

export type TrustlineWithMeta = AccountLinesTrustline & {
  icon: string | undefined;
  name: string | undefined;
  formattedCurrency: string;
};

export type Balance = {
  rawCurrency: string;
  currency: string;
  value: string;
  name: string | undefined;
  icon: string | undefined;
  issuer: string | undefined;
};
