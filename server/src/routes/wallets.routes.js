import { Router } from "express";
import {
  createWallet,
  getBalance,
  listWallets,
  credit,
} from "../services/wallet.service.js";
import { genKeypair } from "../crypto/ed25519.js";

const r = Router();

// list wallets (dev/demo)
r.get("/", async (_req, res) => {
  const items = await listWallets();
  res.json({ items });
});

// create wallet (server generates keypair for demo)
r.post("/", async (req, res) => {
  const { label } = req.body || {};
  const kp = genKeypair();
  const w = await createWallet(kp.pubkey, label);
  // faucet for dev
  await credit(w.wallet_id, 1_000_000); // 1 DAI for testing
  res.json({
    wallet_id: w.wallet_id,
    pubkey: w.pubkey,
    secret: kp.secret,
    balance_micros: 1_000_000,
  });
});

// balance
r.get("/:id/balance", async (req, res) => {
  const bal = await getBalance(req.params.id);
  res.json({ wallet_id: req.params.id, balance_micros: bal });
});

// history
r.get("/", async (req, res) => {
  const txs = await Payment.find({
    $or: [{ from: req.query.wallet_id }, { to: req.query.wallet_id }],
  }).sort({ createdAt: -1 });
  res.json(txs);
});

export default r;
