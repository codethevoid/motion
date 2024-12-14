import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export type Coin = {
  issuer: string;
  currency: string;
  value?: number;
};

export const useQuote = ({ from, to }: { from: Coin | null; to: Coin | null }) => {
  const searchParams = new URLSearchParams();
  if (from) searchParams.set("from", JSON.stringify(from));
  if (to) searchParams.set("to", JSON.stringify(to));

  const url = `/api/swap?${searchParams.toString()}`;

  const { data, isLoading, error } = useSWR(url, fetcher);
  return { quote: data, isLoading, error };
};
