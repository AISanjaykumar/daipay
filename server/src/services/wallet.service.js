import Wallet from "../db/models/Wallet.js";
import { h512 } from "../crypto/hash.js";
import { recordTransaction } from "./transaction.service.js";

export async function createWallet(pubkey, label) {
  const wallet_id = h512(pubkey);
  return Wallet.create({
    wallet_id,
    pubkey,
    label,
    balance_micros: 0,
    created_at: new Date(),
  });
}

export async function getBalance(wallet_id) {
  const w = await Wallet.findOne({ wallet_id });
  if (!w) throw new Error("wallet_not_found");
  return w.balance_micros;
}

export async function credit(wallet_id, amount, note = "Credit to wallet") {
  const w = await Wallet.findOne({ wallet_id });
  if (!w) throw new Error("wallet_not_found");

  w.balance_micros += amount;
  await w.save();

  await recordTransaction({
    type: "credit",
    to_wallet: wallet_id,
    amount_micros: amount,
    note,
  });
}

export async function debit(wallet_id, amount, note = "Debit from wallet") {
  const w = await Wallet.findOne({ wallet_id });
  if (!w) throw new Error("wallet_not_found");
  if (w.balance_micros < amount) throw new Error("insufficient_balance");

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
  const receiver = await Wallet.findOne({ wallet_id: to_wallet });

  if (!sender) throw new Error("sender_wallet_not_found");
  if (!receiver) throw new Error("receiver_wallet_not_found");

  if (sender.balance_micros < amount) throw new Error("insufficient_balance");

  sender.balance_micros -= amount;
  receiver.balance_micros += amount;

  await sender.save();
  await receiver.save();

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
