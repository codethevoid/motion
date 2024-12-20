import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { AccountLinesTrustline } from "xrpl";

export type TrustlineWithMeta = AccountLinesTrustline & {
  icon: string | undefined;
  name: string | undefined;
  formattedCurrency: string;
};

export const useTrustlines = () => {
  const { data, isLoading, error, mutate } = useSWR<TrustlineWithMeta[]>(
    "/api/trustlines",
    fetcher,
  );
  return { data, isLoading, error, mutate };
};
