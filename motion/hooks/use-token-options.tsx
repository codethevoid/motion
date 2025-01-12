import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export type Token = {
  rawCurrency: string; // the currency before it is converted to utf-8 (used so keys are unique when mapping)
  currency: string;
  issuer: string;
  icon: string | undefined;
  name: string | undefined;
  description: string | undefined;
};

export const useTokenOptions = (tokenName?: string, limit?: number) => {
  const searchParams = new URLSearchParams();
  if (tokenName) searchParams.set("name_like", tokenName);
  if (limit) searchParams.set("limit", limit.toString());
  const url = `/api/tokens/options?${searchParams.toString()}`;

  const { data, isLoading, error } = useSWR<Token[]>(url, fetcher);
  return { tokens: data, isLoading, error };
};
