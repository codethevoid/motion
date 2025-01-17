import { syncTrades } from "./sync-trades.js";
import cron from "node-cron";

export const jobs = async () => {
  cron.schedule("*/10 * * * * *", syncTrades);
};
