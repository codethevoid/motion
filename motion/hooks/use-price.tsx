import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { API_BASE_URL } from "@/utils/api-base-url";

export const usePrice = (currency: string, issuer: string) => {
  const searchParams = new URLSearchParams();
  searchParams.set("currency", currency);
  searchParams.set("issuer", issuer);

  const url = `${API_BASE_URL}/tokens/price?${searchParams.toString()}`;
  const { data, isLoading, mutate } = useSWR<{ price: number }>(url, fetcher, {
    refreshInterval: 1000 * 10, // 10 seconds
  });
  return { price: data, isLoading, mutate };
};
