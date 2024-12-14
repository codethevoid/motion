export type CoinData = {
  key: string;
  currency: string;
  icon: string;
  decimals: number;
  issuer: string;
  name: string;
};

export const coinData: Record<string, CoinData> = {
  "XRP-": {
    key: "XRP-",
    currency: "XRP",
    name: "XRP",
    icon: "https://cdn.qryptic.io/crypto/xrp.png",
    decimals: 6,
    issuer: "",
  },
};
