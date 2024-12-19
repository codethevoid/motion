import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export type Token = {
  rawCurrency: string; // the currency before it is converted to utf-8 (used so keys are unique when mapping)
  currency: string;
  issuer: string;
  icon: string | undefined;
  name: string | undefined;
};

export const useTokenOptions = (tokenName?: string) => {
  const searchParams = new URLSearchParams();
  if (tokenName) searchParams.set("name_like", tokenName);
  const url = `/api/tokens?${searchParams.toString()}`;

  const { data, isLoading, error } = useSWR<Token[]>(url, fetcher);

  return { tokens: data, isLoading, error };
};
