import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import type { Token } from "./use-token-options";

type Balance = {
  balance: number;
};

export const useBalance = (token: Token | null) => {
  const url = `/api/swap/balance?currency=${token?.rawCurrency}&issuer=${token?.issuer}`;
  const { data, isLoading, error } = useSWR<Balance>(url, fetcher);
  return { balance: data, isLoading, error };
};
