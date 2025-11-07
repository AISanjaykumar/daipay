import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import payments from "./routes/payments.routes.js";
import wallets from "./routes/wallets.routes.js";
import transactions from "./routes/transactions.route.js";
import blocks from "./routes/blocks.routes.js";
import escrows from "./routes/escrows.routes.js";
import anchors from "./routes/anchors.routes.js";
import auth from "./routes/auth.routes.js";
import mail from "./routes/mail.routes.js";
import contract from "./routes/contracts.routes.js";
import health from "./routes/health.route.js";

import { errorHandler } from "./middleware/error.js";
import { sealBlock } from "./services/ledger.service.js";
import { verifyAppAccess } from "./middleware/verifyAppAccess.js";
import { initCronJobs } from "./services/cron.service.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(helmet());
app.use(cookieParser());

app.use(verifyAppAccess);

// cron jobs
initCronJobs();

app.use("/v1/mail", mail);
app.use("/v1/auth", auth);
app.use("/v1/blocks", blocks);
app.use("/v1/wallets", wallets);
app.use("/v1/escrows", escrows);
app.use("/v1/anchors", anchors);
app.use("/v1/payments", payments);
app.use("/v1/contracts", contract);
app.use("/v1/transactions", transactions);

app.use("/v1/health", health);

app.use(errorHandler);

// simple sealer loop
setInterval(async () => {
  try {
    await sealBlock();
  } catch (e) {}
}, 3000);

export default app;
