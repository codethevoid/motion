import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { API_BASE_URL } from "@/utils/api-base-url";

type Timespan = "1h" | "1d" | "1w" | "1m" | "1y" | "all";

export const useAggregates = (currency: string, issuer: string, timespan: Timespan) => {
  const searchParams = new URLSearchParams();
  searchParams.set("currency", currency);
  searchParams.set("issuer", issuer), searchParams.set("time_span", timespan);

  const { data, isLoading, error, mutate } = useSWR(
    `${API_BASE_URL}/aggregates?${searchParams.toString()}`,
    fetcher,
  );
  return { data, isLoading, error, mutate };
};
