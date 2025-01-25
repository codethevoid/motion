import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { API_BASE_URL } from "@/utils/api-base-url";
import { useSession } from "./use-session";

export const useBalance = (currency: string, issuer: string | undefined) => {
  const { jwe } = useSession();
  const searchParams = new URLSearchParams();
  if (currency) searchParams.set("currency", currency);
  if (issuer) searchParams.set("issuer", issuer);
  const url = `${API_BASE_URL}/wallet/balance?${searchParams.toString()}`;
  const { data, isLoading, error } = useSWR<{ balance: number }>([url, jwe], ([url, jwe]) =>
    fetcher(url, {
      headers: {
        Authorization: `Bearer ${jwe}`,
      },
    }),
  );
  return { balance: data, isLoading, error };
};
