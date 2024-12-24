import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export const useXrpPrice = () => {
  const { data, isLoading } = useSWR("/api/xrp", fetcher);
  return { data, isLoading };
};
