import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

type AffiliateResponse = {
  referralKey: string;
  referralTitle: string | null;
  referralImage: string | null;
  referralFee: number;
  totalReferralsInXrp: number;
};

export const useAffiliate = () => {
  const { data, isLoading, error, mutate } = useSWR<AffiliateResponse>("/api/affiliate", fetcher);
  return { data, isLoading, error, mutate };
};
