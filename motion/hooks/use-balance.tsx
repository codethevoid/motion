import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export const useBalance = (currency: string, issuer: string | undefined) => {
  const searchParams = new URLSearchParams();
  if (currency) searchParams.set("currency", currency);
  if (issuer) searchParams.set("issuer", issuer);
  const url = `/api/swap/balance?${searchParams.toString()}`;
  const { data, isLoading, error } = useSWR<{ balance: number }>(url, fetcher);
  return { balance: data, isLoading, error };
};
