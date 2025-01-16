const getUrl = () => {
  const polygonApiKey = process.env.POLYGON_API_KEY;
  if (!polygonApiKey) throw new Error("POLYGON_API_KEY is not set");
  return `https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers/X:XRPUSD?apiKey=${polygonApiKey}`;
};

export const getXrpPrice = async (): Promise<number> => {
  try {
    const res = await fetch(getUrl());
    if (!res.ok) return 0;
    const data = await res.json();
    const price = data?.ticker?.lastTrade?.p;
    return price || 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
};
