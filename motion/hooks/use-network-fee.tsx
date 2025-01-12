import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

type NetworkFee = {
  fee: number;
};

export const useNetworkFee = () => {
  const { data, isLoading, error } = useSWR<NetworkFee>("/api/network-fee", fetcher);
  return { data, isLoading, error };
};
