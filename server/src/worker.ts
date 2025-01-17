import { backfill } from "./workers/backfill.js";

export async function worker() {
  console.log("Worker started");

  try {
    await backfill();
    console.log("Backfill worker complete");
    process.exit(0);
  } catch (e) {
    console.error("Backfill worker failed", e);
    process.exit(1);
  }
}

worker().catch((e) => {
  console.error("Backfill worker faild: ", e);
  process.exit(1);
});
