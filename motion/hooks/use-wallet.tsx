import useSWR, { mutate } from "swr";
import { fetcher } from "@/utils/fetcher";
import { useSession } from "./use-session";
import { API_BASE_URL } from "@/utils/api-base-url";

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
    rawCurrency: string;
    balance: number; // number of tokens
    balanceInUsd: number; // balance in USD
    icon: string | undefined;
    name: string | undefined;
    issuer: string | undefined;
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
  const { jwe } = useSession();
  const { data, error, isLoading } = useSWR<Wallet>(
    [`${API_BASE_URL}/wallet`, jwe],
    ([url, token]) =>
      fetcher(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  );
  return { wallet: data, error, isLoading };
};
