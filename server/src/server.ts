import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tokenRoutes from "./routes/token.routes.js";
import tradeRoutes from "./routes/trade.routes.js";
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

// jobs();

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
