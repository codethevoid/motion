import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { AccountTxTransaction } from "xrpl";

export const useTransactions = (marker: string | undefined) => {
  const searchParams = new URLSearchParams();
  if (marker) searchParams.set("marker", marker);
  const { data, isLoading, error } = useSWR<AccountTxTransaction<2>[]>(
    `/api/wallet/transactions?${searchParams.toString()}`,
    fetcher,
  );
  return { transactions: data, isLoading, error };
};
