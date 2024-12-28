import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

type Token = {
  currency: string;
  issuer: string;
  meta: {
    token: {
      name: string;
      description: string;
      icon: string;
      trust_level: number;
      asset_class: string;
      weblinks: {
        url: string;
        type: string;
        title: string;
      }[];
    };
    issuer: {
      name: string;
      description: string;
      icon: string;
      kyc: boolean;
      trust_leve: number;
      weblinks: {
        url: string;
        type: string;
        title: string;
      }[];
    };
  };
  metrics: {
    trustlines: number;
    holders: number;
    supply: string;
    marketcap: string;
    price: string;
    volume_24h: string;
    volume_7d: string;
    exchanges_24h: number;
    exchanges_7d: number;
    takers_24h: number;
    takers_7d: number;
    changes: {
      "24h": {
        trustlines: { delta: number; percent: number };
        holders: { delta: number; percent: number };
        supply: { delta: string; percent: number };
        marketcap: { delta: number; percent: number };
        price: { percent: number };
      };
      "7d": {
        trustlines: { delta: number; percent: number };
        holders: { delta: number; percent: number };
        supply: { delta: string; percent: number };
        marketcap: { delta: number; percent: number };
        price: { percent: number };
      };
    };
  };
};

export const useTokens = (name?: string, page?: number) => {
  const searchParams = new URLSearchParams();
  if (page) searchParams.set("page", page.toString());
  if (name) searchParams.set("name", name);
  const url = `/api/tokens?${searchParams.toString()}`;
  const { data, isLoading, error } = useSWR<{ tokens: Token[]; total: number }>(url, fetcher);
  return { data, isLoading, error };
};
