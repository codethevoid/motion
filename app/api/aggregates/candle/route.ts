import { NextResponse, NextRequest } from "next/server";
import { subDays, subMonths, subHours, subYears } from "date-fns";
import type { Timespan } from "../route";

const getTimeStart = (timespan: Timespan) => {
  if (timespan === "1h") return subHours(new Date(), 1);
  if (timespan === "1d") return subDays(new Date(), 1);
  if (timespan === "1w") return subDays(new Date(), 7);
  if (timespan === "1m") return subMonths(new Date(), 1);
  if (timespan === "1y") return subYears(new Date(), 1);
  if (timespan === "all") return subYears(new Date(), 10); // we will go back 10 years to make sure we capture all data

  // default to 1 hour ago
  return subHours(new Date(), 1);
};

const getIntervalSeconds = (timespan: Timespan) => {
  switch (timespan) {
    case "1h":
      return 60; // 1 minute candles
    case "1d":
      return 300; // 5 minute candles
    case "1w":
      return 3600; // 1 hour candles
    case "1m":
      return 14400; // 4 hour candles
    case "1y":
      return 86400; // 1 day candles
    case "all":
      return 604800; // 1 week candles (same as 1y)
    default:
      return 60; // default to 1 minute
  }
};

function groupIntoCandles(data: { time: number; value: string }[], timespan: Timespan) {
  const intervalSeconds = getIntervalSeconds(timespan);

  const candleMap = new Map<
    number,
    {
      time: number;
      open: number;
      high: number;
      low: number;
      close: number;
    }
  >();

  const roundToInterval = (timestamp: number) =>
    Math.floor(timestamp / intervalSeconds) * intervalSeconds;

  data.forEach((tick) => {
    const value = parseFloat(tick.value);

    // Filter invalid values and extreme outliers
    if (isNaN(value) || value <= 0) {
      return;
    }

    const intervalTimestamp = roundToInterval(tick.time);

    if (!candleMap.has(intervalTimestamp)) {
      candleMap.set(intervalTimestamp, {
        time: intervalTimestamp,
        open: value,
        high: value,
        low: value,
        close: value,
      });
    } else {
      const candle = candleMap.get(intervalTimestamp)!;
      candle.high = Math.max(candle.high, value);
      candle.low = Math.min(candle.low, value);
      candle.close = value;
    }
  });

  return Array.from(candleMap.values()).sort((a, b) => a.time - b.time);
}

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const currency = url.searchParams.get("currency") || "";
    const issuer = url.searchParams.get("issuer") || "";
    const timespan: Timespan = (url.searchParams.get("time_span") as Timespan) || "1h";

    if (!currency || !issuer) {
      return NextResponse.json({ error: "Missing currency or issuer" }, { status: 400 });
    }

    const timeEnd = Math.floor(Date.now() / 1000); // timestamp in seconds
    const timeStart = Math.floor(getTimeStart(timespan).getTime() / 1000);

    const identifier = `${currency}:${issuer}`;

    const res = await fetch(
      `https://s1.xrplmeta.org/token/${identifier}/series/price?time_start=${timeStart}&time_end=${timeEnd}&time_interval=1`, // 1 second intervals to get all data
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Error fetching token chart data" }, { status: 500 });
    }
    const data = await res.json();
    const candleData = groupIntoCandles(data, timespan);

    return NextResponse.json({ ...data, candleData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching token chart data" }, { status: 500 });
  }
};
