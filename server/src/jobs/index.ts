import { syncTrades } from "./sync-trades.js";
import cron from "node-cron";
import { syncTokenImages } from "./sync-token-images.js";

export const jobs = async () => {
  // cron.schedule("*/10 * * * * *", syncTrades);
  cron.schedule("0 0 * * *", syncTokenImages); // every day at midnight
};
