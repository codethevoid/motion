import { Transaction, TransactionMetadata, rippleTimeToUnixTime } from "xrpl";
import { xrplClient } from "../xrpl-client.js";
import { prisma } from "../../db/prisma.js";
import { processTrades } from "./process-trades.js";

export const processLedgers = async ({
  startLedgerIndex,
  mode,
}: {
  startLedgerIndex: number;
  mode: "sync" | "backfill";
}) => {
  const client = await xrplClient.connect();
  let ledgerIndex = startLedgerIndex;
  // let count = 0;

  while (true) {
    const currentLedgerIndex = await client.getLedgerIndex();

    // if we've reached the current ledger index, we're done
    if (ledgerIndex >= currentLedgerIndex) {
      console.log("Reached current ledger index, stopping");
      await prisma.syncStatus.update({
        where: { id: "main" },
        data: {
          ...(mode === "sync" && { isSyncing: false }),
          ...(mode === "backfill" && { isInitialBackfillComplete: true }),
        },
      });
      break;
    }

    // log where we are at in the sync/backfill
    console.log(
      `Processing ledger ${ledgerIndex} of ${currentLedgerIndex} (${(currentLedgerIndex - ledgerIndex).toLocaleString("en-us")} to go)`,
    );

    // get ledger data and process transactions
    try {
      const ledger = await client.request({
        command: "ledger",
        ledger_index: ledgerIndex,
        transactions: true,
        expand: true,
      });

      if (
        !ledger.result?.ledger?.transactions ||
        ledger.result?.ledger?.transactions?.length === 0
      ) {
        console.log(`No transactions found for ledger ${ledgerIndex}`);
        ledgerIndex++;
        await new Promise((resolve) => setTimeout(resolve, 300)); // wait 300ms before moving on
        continue;
      }

      const formattedTxs = ledger.result.ledger.transactions.map((tx: Record<string, any>) => {
        return {
          tx_json: tx.tx_json as Transaction,
          meta: tx.meta as TransactionMetadata,
          hash: tx.hash as string,
        };
      });

      const processed = processTrades({
        transactions: formattedTxs,
        timestamp: rippleTimeToUnixTime(ledger.result.ledger.close_time),
        ledger: ledgerIndex,
      });

      if (processed.length > 0) {
        await prisma.trade.createMany({ data: processed });
      }

      // update ledger index
      await prisma.syncStatus.update({
        where: { id: "main" },
        data: { lastLedgerIndex: ledgerIndex },
      });

      // if (count >= 20 && process.env.NODE_ENV !== "production") break;

      // count++;
      ledgerIndex++;
      await new Promise((resolve) => setTimeout(resolve, 100)); // wait 100ms before moving on
    } catch (e) {
      console.error(`Error processing ledger ${ledgerIndex}: `, e);
      await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds before retrying same ledger
      continue;
    }
  }
};
