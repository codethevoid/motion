import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export type TokenMetrics = {
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
  xrpValueInUsd: number;
  liquidity: number | "n/a";
};

export const useTokenMetrics = (currency: string, issuer: string) => {
  const searchParams = new URLSearchParams();
  searchParams.set("currency", currency || "");
  searchParams.set("issuer", issuer || "");

  const { data, error, isLoading, mutate } = useSWR<TokenMetrics>(
    `/api/token-metrics?${searchParams.toString()}`,
    fetcher,
    { refreshInterval: 1000 * 30 }, // 30 seconds
  );
  console.log(data);
  return { data, error, isLoading, mutate };
};
