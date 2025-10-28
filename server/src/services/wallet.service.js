import Wallet from '../db/models/Wallet.js';
import { h512 } from '../crypto/hash.js';

export async function createWallet(pubkey, label){
  const wallet_id = h512(pubkey);
  return Wallet.create({ wallet_id, pubkey, label, balance_micros: 0 });
}

export async function getBalance(wallet_id){
  const w = await Wallet.findOne({ wallet_id });
  return w?.balance_micros ?? 0;
}

export async function credit(wallet_id, amount){
  await Wallet.updateOne({ wallet_id }, { $inc: { balance_micros: amount } }, { upsert: true });
}

export async function debit(wallet_id, amount){
  const w = await Wallet.findOne({ wallet_id });
  if (!w || w.balance_micros < amount) throw new Error('insufficient_balance');
  w.balance_micros -= amount;
  await w.save();
}

export async function listWallets(limit=50){
  return Wallet.find().sort({ created_at: -1 }).limit(limit).lean();
}
