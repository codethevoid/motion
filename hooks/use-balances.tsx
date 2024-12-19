import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export type Balance = {
  rawCurrency: string;
  currency: string;
  value: string;
  name: string | undefined;
  icon: string | undefined;
  issuer: string | undefined;
};

export const useBalances = () => {
  const { data, isLoading, error, mutate } = useSWR<Balance[]>("/api/balances", fetcher);
  return { data, isLoading, error, mutate };
};
