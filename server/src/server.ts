import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tokenRoutes from "./routes/token.routes.js";
import tradeRoutes from "./routes/trade.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: ["http://localhost:3000", "https://motion.zip"], credentials: true }));
app.use(express.json({ limit: "20mb" }));

// routes
app.use("/token", tokenRoutes);
app.use("/trade", tradeRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
