import { prisma } from "../db/prisma.js";
import { processLedgers } from "../lib/helpers/process-ledgers.js";

const EPOCH = 91112241; // October 1, 2024

const getLedgerStart = async () => {
  const syncStatus = await prisma.syncStatus.findUnique({ where: { id: "main" } });
  if (syncStatus && !syncStatus.isInitialBackfillComplete) {
    console.log(`Resuming backfill from ledger ${syncStatus.lastLedgerIndex + 1}`);
    return syncStatus.lastLedgerIndex + 1;
  }

  return EPOCH;
};

export const backfill = async () => {
  try {
    let ledgerIndex = await getLedgerStart();
    await processLedgers({ startLedgerIndex: ledgerIndex, mode: "backfill" });
  } catch (e) {
    throw new Error(`Backfill failed: ${e}`);
  }
};
