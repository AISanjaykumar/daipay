import { Router } from "express";
import { listTransactions } from "../services/transaction.service.js";

const r = Router();

// Get all transactions for a specific wallet
r.get("/:wallet_id", async (req, res) => {
  try {
    const txs = await listTransactions(req.params.wallet_id);
    res.json({ wallet_id: req.params.wallet_id, transactions: txs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default r;
