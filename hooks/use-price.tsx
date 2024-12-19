import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import type { Token } from "@/hooks/use-token-options";

type Price = {
  price: number;
};

export const usePrice = (token: Token | null) => {
  const searchParams = new URLSearchParams();
  if (token) {
    searchParams.set("currency", token.currency);
    searchParams.set("issuer", token.issuer);
  }
  const url = `/api/swap/price?${searchParams.toString()}`;
  const { data, isLoading, mutate } = useSWR<Price>(url, fetcher, {
    refreshInterval: 10000,
  });
  return { price: data, isLoading, mutate };
};
