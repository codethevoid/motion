import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const res = await fetch(
      "https://api.onthedex.live/public/v1/ohlc?base=5249505441524400000000000000000000000000.r37NJszgETCmYqUkPH7PmtkpVdsYBfMYSc&bars=500&quote=XRP&interval=D&cf=yes",
    );
    const data = await res.json();

    const rawCandles = data?.data?.ohlc || [];

    // Process candles to ensure each opens at previous close
    const processedCandles: Record<string, number>[] = rawCandles.map(
      (candle: Record<string, string>) => {
        // For first candle, use its original open price
        // const open = index === 0 ? parseFloat(candle.o) : parseFloat(rawCandles[index - 1].c); // Use previous candle's close as open

        return {
          time: candle.t,
          open: parseFloat(candle.o),
          high: parseFloat(candle.h),
          low: parseFloat(candle.l),
          close: parseFloat(candle.c),
        };
      },
    );

    // get current price of token
    const tokenRes = await fetch(
      `https://s1.xrplmeta.org/token/5249505441524400000000000000000000000000:r37NJszgETCmYqUkPH7PmtkpVdsYBfMYSc`,
    );

    const tokenData = (await tokenRes.json()) as { metrics: { price: number } };
    const tokenPrice = tokenData?.metrics?.price;
    if (!tokenPrice)
      return NextResponse.json({ error: "Error getting price of token" }, { status: 500 });

    // add close price to last candle
    processedCandles[processedCandles.length - 1].close = Number(tokenPrice);

    return NextResponse.json({ candles: processedCandles });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching token chart data" }, { status: 500 });
  }
};
