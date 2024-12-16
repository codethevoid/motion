import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

export type Wallet = {
  address: string; // wallet address
  isFunded: boolean; // true if wallet has been funded with XRP
  balance: number; // total balance in XRP
  availableBalance: number; // available balance in XRP
  balanceInUsd: number; // total balance in USD (XRP only)
  balanceInUsdIncludingTokens: number; // total balance in USD including tokens
  ownerReserve: number; // owner reserve in XRP
  baseReserve: number; // base reserve in XRP
  countReserve: number; // count reserve in XRP
  totalReserve: number; // total reserve in XRP
  totalReserveInUsd: number; // total reserve in USD
  tokens: {
    currency: string; // ticker/symbol (e.g. BTC)
    balance: number; // number of tokens
    balanceInUsd: number; // balance in USD
    icon: string | undefined;
    name: string | undefined;
  }[];
  nfts: {
    id: string;
    taxon: number;
    uri: string | null;
    isDirectImage: boolean;
    issuer: string;
    flags: number;
  }[];
  xrpPrice: number; // price of XRP in USD
};

export const useWallet = () => {
  const { data, error, isLoading } = useSWR<Wallet>("/api/wallet", fetcher);
  return { wallet: data, error, isLoading };
};
