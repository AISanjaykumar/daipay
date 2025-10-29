import Transaction from "../db/models/Transaction.js";
import { h512 } from "../crypto/hash.js";

// 🔹 create new transaction log
export async function recordTransaction({ type, from_wallet, to_wallet, amount_micros, note }) {
  const tx_id = h512(`${Date.now()}-${from_wallet || ""}-${to_wallet || ""}-${amount_micros}`);
  return Transaction.create({
    tx_id,
    type,
    from_wallet,
    to_wallet,
    amount_micros,
    note,
    status: "success",
  });
}

// 🔹 list transactions for a specific wallet
export async function listTransactions(wallet_id, limit = 50) {
  return Transaction.find({
    $or: [{ from_wallet: wallet_id }, { to_wallet: wallet_id }],
  })
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();
}
