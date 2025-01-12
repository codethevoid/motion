import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export const useXrpPrice = () => {
  const { data, isLoading } = useSWR<number>("/api/xrp", fetcher, {
    refreshInterval: 1000 * 10, // 10 seconds
  });
  return { data, isLoading };
};
