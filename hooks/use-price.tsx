import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export const usePrice = (currency: string, issuer: string) => {
  const searchParams = new URLSearchParams();
  searchParams.set("currency", currency);
  searchParams.set("issuer", issuer);

  const url = `/api/swap/price?${searchParams.toString()}`;
  const { data, isLoading, mutate } = useSWR<{ price: number }>(url, fetcher, {
    refreshInterval: 10000,
  });
  return { price: data, isLoading, mutate };
};
