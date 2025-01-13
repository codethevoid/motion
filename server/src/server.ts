import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tokenRoutes from "./routes/token.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: ["http://localhost:3000", "https://motion.zip"], credentials: true }));
app.use(express.json({ limit: "20mb" }));

// routes
app.use("/token", tokenRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
