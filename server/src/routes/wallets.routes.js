import { Router } from "express";
import { createWallet, credit } from "../services/wallet.service.js";
import User from "../db/models/User.js";
import Wallet from "../db/models/Wallet.js";

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
  try {
    const { pubkey, name, email } = req.body || {};

    if (!email || !pubkey || !name) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isActiveWallet) {
      return res.json({
        message: "User already has an active wallet.",
        wallet_id: user.wallet_id,
      });
    }

    const existingWallet = await Wallet.findOne({ pubkey });
    if (existingWallet) {
      return res.json({
        message: "This public key is already registered with a wallet.",
        wallet_id: existingWallet._id,
      });
    }

    const wallet = await createWallet(pubkey, `${name}'s Wallet`);

    await User.updateOne(
      { email },
      {
        $set: {
          isActiveWallet: true,
          wallet_id: wallet._id,
        },
      }
    );

    await credit(wallet.wallet_id, 1_000_000);

    return res.json({
      message: "Wallet created successfully.",
      wallet_id: wallet._id,
    });
  } catch (err) {
    console.error("Wallet Create Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default r;
