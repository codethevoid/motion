import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import type { Transaction } from "@/utils/process-transaction";

export const useTransactions = (marker: string | undefined) => {
  const searchParams = new URLSearchParams();
  if (marker) searchParams.set("marker", marker);
  const { data, isLoading, error } = useSWR<Transaction[]>(
    `/api/wallet/transactions?${searchParams.toString()}`,
    fetcher,
  );
  return { transactions: data, isLoading, error };
};
