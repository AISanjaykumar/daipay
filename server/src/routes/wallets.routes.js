import { Router } from "express";
import {
  credit,
} from "../services/wallet.service.js";

const r = Router();

// update wallet balance (demo)
r.post("/", async (req, res) => {
  const { wallet_id, amount } = req.body || {};
  // amount in micros
  await credit(wallet_id, amount);
  res.json({
    message: `Credited ${amount} micros to wallet.`,
  });
});

export default r;
