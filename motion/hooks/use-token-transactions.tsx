import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { AccountTxTransaction } from "xrpl";

export const useTokenTransactions = (currency: string, issuer: string) => {
  const searchParams = new URLSearchParams();
  searchParams.set("currency", currency);
  searchParams.set("issuer", issuer);
  const url = `/api/transactions?${searchParams.toString()}`;
  const { data, isLoading, error } = useSWR<AccountTxTransaction[]>(url, fetcher, {
    refreshInterval: 8000, // refresh every 8 seconds
  });
  return { data, isLoading, error };
};
