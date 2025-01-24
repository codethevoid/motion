import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tokenRoutes from "./routes/token.routes.js";
import tradeRoutes from "./routes/trade.routes.js";
import tokensRoutes from "./routes/tokens.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import aggregatesRoutes from "./routes/aggregates.routes.js";
import { jobs } from "./jobs/index.js";
import { xrplClient } from "./lib/xrpl-client.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: ["http://localhost:3000", "https://motion.zip"], credentials: true }));
app.use(express.json({ limit: "20mb" }));

// routes
app.use("/token", tokenRoutes);
app.use("/trade", tradeRoutes);
app.use("/tokens", tokensRoutes);
app.use("/wallet", walletRoutes);
app.use("/aggregates", aggregatesRoutes);

if (process.env.NODE_ENV === "production") {
  console.log("Starting jobs...");
  jobs();
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/ledger", async (req, res) => {
  const client = await xrplClient.connect();
  const ledger = await client.getLedgerIndex();
  res.status(200).json({ ledger });
});
