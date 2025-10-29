import express from "express";
import cors from "cors";
import payments from "./routes/payments.routes.js";
import wallets from "./routes/wallets.routes.js";
import transactions from "./routes/transactions.route.js";
import blocks from "./routes/blocks.routes.js";
import escrows from "./routes/escrows.routes.js";
import anchors from "./routes/anchors.routes.js";
import auth from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.js";
import { sealBlock } from "./services/ledger.service.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.use(cookieParser());

app.use("/v1/wallets", wallets);
app.use("/v1/transactions", transactions);
app.use("/v1/payments", payments);
app.use("/v1/blocks", blocks);
app.use("/v1/escrows", escrows);
app.use("/v1/anchors", anchors);
app.use("/v1/auth", auth);

app.use(errorHandler);

// simple sealer loop
setInterval(async () => {
  try {
    await sealBlock();
  } catch (e) {
    /* noop */
  }
}, 3000);

export default app;
