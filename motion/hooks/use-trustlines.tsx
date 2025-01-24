import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { AccountLinesTrustline } from "xrpl";
import { useSession } from "./use-session";
import { API_BASE_URL } from "@/utils/api-base-url";

export type TrustlineWithMeta = AccountLinesTrustline & {
  icon: string | undefined;
  name: string | undefined;
  formattedCurrency: string;
};

export const useTrustlines = () => {
  const { jwe } = useSession();
  const { data, isLoading, error, mutate } = useSWR<TrustlineWithMeta[]>(
    `${API_BASE_URL}/wallet/trustlines`,
    () =>
      fetcher(`${API_BASE_URL}/wallet/trustlines`, {
        headers: {
          Authorization: `Bearer ${jwe}`,
        },
      }),
  );
  return { data, isLoading, error, mutate };
};
