import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { useSession } from "./use-session";
import { API_BASE_URL } from "@/utils/api-base-url";

export type Balance = {
  rawCurrency: string;
  currency: string;
  value: string;
  name: string | undefined;
  icon: string | undefined;
  issuer: string | undefined;
};

export const useBalances = () => {
  const { jwe } = useSession();
  const { data, isLoading, error, mutate } = useSWR<Balance[]>(
    [`${API_BASE_URL}/wallet/balances`, jwe],
    ([url, token]) =>
      fetcher(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  );
  return { data, isLoading, error, mutate };
};
