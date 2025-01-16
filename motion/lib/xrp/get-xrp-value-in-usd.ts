const polygonApiKey = process.env.POLYGON_API_KEY;
const url = `https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers/X:XRPUSD?apiKey=${polygonApiKey}`;

export const getXrpValueInUsd = async (): Promise<number> => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const price = data?.ticker?.lastTrade?.p;
    return price || 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
};
