import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export type Holder = {
  wallet: string;
  balance: number;
  percent: number;
  value: number;
};

export const useHolders = (currency: string, issuer: string) => {
  const searchParams = new URLSearchParams({ currency, issuer });
  const url = `/api/holders?${searchParams.toString()}`;
  const { data, isLoading, error } = useSWR<Holder[]>(url, fetcher);
  return { data, isLoading, error };
};
