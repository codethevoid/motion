import { prisma } from "../db/prisma.js";
import { processLedgers } from "../lib/helpers/process-ledgers.js";

export const syncTrades = async () => {
  try {
    const syncStatus = await prisma.syncStatus.findUnique({
      where: { id: "main" },
    });

    if (!syncStatus) {
      console.log("Sync status not found, skipping sync");
      return;
    }

    if (!syncStatus.isInitialBackfillComplete) {
      console.log("Waiting for initial backfill to complete");
      return;
    }

    if (syncStatus.isSyncing) {
      console.log("Already syncing, skipping");
      return;
    }

    await prisma.syncStatus.update({
      where: { id: "main" },
      data: { isSyncing: true },
    });

    console.log("Syncing trades...");

    await processLedgers({ startLedgerIndex: syncStatus.lastLedgerIndex, mode: "sync" });
  } catch (e) {
    console.error(`Error syncing trades: ${e}`);
    await prisma.syncStatus.update({
      where: { id: "main" },
      data: { isSyncing: false },
    });
  }
};
