import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import type { Timespan } from "@/app/api/aggregates/route";

export const useAggregates = (currency: string, issuer: string, timespan: Timespan) => {
  const searchParams = new URLSearchParams();
  searchParams.set("currency", currency);
  searchParams.set("issuer", issuer), searchParams.set("time_span", timespan);

  const { data, isLoading, error, mutate } = useSWR(
    `/api/aggregates?${searchParams.toString()}`,
    fetcher,
  );
  return { data, isLoading, error, mutate };
};
