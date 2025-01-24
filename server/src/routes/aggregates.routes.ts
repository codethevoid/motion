import express, { Request, Response } from "express";
import { xrplMeta } from "../lib/xrpl-meta.js";
import { subDays, subMonths, subHours, subYears } from "date-fns";

const router = express.Router();

const intervalsMap = {
  "1h": 1, // 1 second intervals
  "1d": 60, // 1 minute intervals
  "1w": 1800, // 30 minute intervals
  "1m": 3600 * 2, // 2 hour intervals
  "1y": 3600 * 24, // 1 day intervals
  all: 3600 * 24 * 30, // 1 month intervals
};

type Timespan = keyof typeof intervalsMap;

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

router.get("/", async (req: Request, res: Response) => {
  try {
    const currency = (req.query.currency as string) || "";
    const issuer = (req.query.issuer as string) || "";
    const timespan: Timespan = (req.query.time_span as Timespan) || "1h";
    const interval = intervalsMap[timespan] || 1;

    if (!currency || !issuer) {
      res.status(400).json({ error: "Missing currency or issuer" });
      return;
    }

    const timeEnd = Math.floor(Date.now() / 1000); // timestamp in seconds
    const timeStart = Math.floor(getTimeStart(timespan).getTime() / 1000);

    const response = await xrplMeta.request({
      command: "token_series",
      token: { currency, issuer },
      metric: "price",
      time: {
        start: timeStart,
        end: timeEnd,
        interval,
      },
    });

    res.json(response.result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
