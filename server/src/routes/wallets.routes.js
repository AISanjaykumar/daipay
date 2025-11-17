import { Router } from "express";
import { createWallet, credit } from "../services/wallet.service.js";
import User from "../db/models/User.js";

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

r.post("/create", async (req, res) => {
  const { pubkey, name, email } = req.body || {};

  const wallet = await createWallet(pubkey, `${name}'s Wallet`);
  await User.findOneAndUpdate(
    { email: email },
    { $set: { isActiveWallet: true, wallet_id: wallet._id } }
  );
  await credit(wallet.wallet_id, 1_000_000);

  res.json({
    message: `Wallet created.`,
  });
});

export default r;
