import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export type Balance = {
  currency: string;
  value: string;
  name: string | undefined;
  icon: string | undefined;
  issuer: string | undefined;
};

export const useBalances = () => {
  const { data, isLoading, error } = useSWR<Balance[]>("/api/balances", fetcher);
  return { data, isLoading, error };
};
