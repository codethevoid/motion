import { NextResponse, NextRequest } from "next/server";
import { subDays, subMonths, subHours, subYears } from "date-fns";

// map of how many seconds each data point is apart based on the time span
const intervalsMap = {
  "1h": 1, // 1 second intervals
  "1d": 60, // 1 minute intervals
  "1w": 1800, // 30 minute intervals
  "1m": 3600 * 2, // 2 hour intervals
  "1y": 3600 * 24, // 1 day intervals
  all: 3600 * 24 * 30, // 1 month intervals
};

export type Timespan = keyof typeof intervalsMap;

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

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const currency = url.searchParams.get("currency") || "";
    const issuer = url.searchParams.get("issuer") || "";
    const timespan: Timespan = (url.searchParams.get("time_span") as Timespan) || "1h";
    const interval = intervalsMap[timespan] || 1; // default to 1 second intervals

    if (!currency || !issuer) {
      return NextResponse.json({ error: "Missing currency or issuer" }, { status: 400 });
    }

    const timeEnd = Math.floor(Date.now() / 1000); // timestamp in seconds
    const timeStart = Math.floor(getTimeStart(timespan).getTime() / 1000);
    console.log({
      timeStart,
      timeEnd,
      interval,
      startDate: new Date(timeStart * 1000),
      endDate: new Date(timeEnd * 1000),
      timeDiff: (timeEnd - timeStart) / 60,
      // formattedStart: format(new Date(timeStart * 1000), "yyyy-MM-dd HH:mm:ss"),
      // formattedEnd: format(new Date(timeEnd * 1000), "yyyy-MM-dd HH:mm:ss"),
    });

    const identifier = `${currency}:${issuer}`;

    const res = await fetch(
      `https://s1.xrplmeta.org/token/${identifier}/series/price?time_start=${timeStart}&time_end=${timeEnd}&time_interval=${interval}`,
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Error fetching token chart data" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json({ ...data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching token chart data" }, { status: 500 });
  }
};
