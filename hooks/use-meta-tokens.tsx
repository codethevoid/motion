import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import type { MetaToken } from "@/components/landing/coin-spotlight";

export const useMetaTokens = () => {
  const url = "/api/tokens/meta/complete";
  const { data, isLoading, error } = useSWR<MetaToken[]>(url, fetcher);
  return { tokens: data, isLoading, error };
};
