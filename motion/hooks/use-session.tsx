import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

type Session = {
  hasWallet: boolean;
  jwe: string | undefined;
};

export const useSession = () => {
  const { data, error, isLoading, mutate } = useSWR<Session>("/api/session", fetcher);
  return { hasWallet: data?.hasWallet, jwe: data?.jwe, error, isLoading, mutate };
};
