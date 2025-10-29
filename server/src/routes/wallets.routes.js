import { Router } from "express";
import {
  createWallet,
  getBalance,
  listWallets,
  credit,
} from "../services/wallet.service.js";
import { genKeypair } from "../crypto/ed25519.js";
import User from "../db/models/User.js";
import mongoose from "mongoose";

const r = Router();

// list wallets (dev/demo)
r.get("/", async (_req, res) => {
  const items = await listWallets();
  res.json({ items });
});

// create wallet (server generates keypair for demo)
r.post("/", async (req, res) => {
  const { label, type, userId } = req.body || {};

  console.log("type", type);

  if (type === "create") {
    const kp = genKeypair();
    const w = await createWallet(kp.pubkey, label);
    console.log("user id", userId);
    console.log("kp", kp);

    await credit(w.wallet_id, 0);
    await User.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          "wallet.active": true,
          "wallet.wallet_id": w.wallet_id,
          "wallet.wallet_pubkey": w.pubkey,
          "wallet.wallet_secret": kp.secret,
        },
      }
    );
    // TODO: add feature of send secret key to user email
  }

  res.json({
    message: "Wallet created",
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
