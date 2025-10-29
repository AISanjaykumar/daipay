import Wallet from "../db/models/Wallet.js";
import { h512 } from "../crypto/hash.js";
import { recordTransaction } from "./transaction.service.js";

export async function createWallet(pubkey, label) {
  const wallet_id = h512(pubkey);
  return Wallet.create({ wallet_id, pubkey, label, balance_micros: 0 });
}

export async function getBalance(wallet_id) {
  const w = await Wallet.findOne({ wallet_id });
  return w?.balance_micros ?? 0;
}

export async function credit(wallet_id, amount, note = "Credit to wallet") {
  await Wallet.updateOne({ wallet_id }, { $inc: { balance_micros: amount } }, { upsert: true });
  await recordTransaction({
    type: "credit",
    to_wallet: wallet_id,
    amount_micros: amount,
    note,
  });
}

export async function debit(wallet_id, amount, note = "Debit from wallet") {
  const w = await Wallet.findOne({ wallet_id });
  if (!w || w.balance_micros < amount) throw new Error("insufficient_balance");

  w.balance_micros -= amount;
  await w.save();

  await recordTransaction({
    type: "debit",
    from_wallet: wallet_id,
    amount_micros: amount,
    note,
  });
}

// 🔄 Transfer between wallets
export async function transfer(from_wallet, to_wallet, amount) {
  const sender = await Wallet.findOne({ wallet_id: from_wallet });
  if (!sender || sender.balance_micros < amount) throw new Error("insufficient_balance");

  sender.balance_micros -= amount;
  await sender.save();

  await Wallet.updateOne(
    { wallet_id: to_wallet },
    { $inc: { balance_micros: amount } },
    { upsert: true }
  );

  await recordTransaction({
    type: "transfer",
    from_wallet,
    to_wallet,
    amount_micros: amount,
    note: "Wallet to wallet transfer",
  });
}

export async function listWallets(limit = 50) {
  return Wallet.find().sort({ created_at: -1 }).limit(limit).lean();
}
