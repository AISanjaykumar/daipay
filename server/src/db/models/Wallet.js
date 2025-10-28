import mongoose from 'mongoose';
const WalletSchema = new mongoose.Schema({
  wallet_id: { type: String, index: true, unique: true },
  pubkey: { type: String, required: true, unique: true },
  label: String,
  created_at: { type: Date, default: () => new Date() },
  balance_micros: { type: Number, default: 0 }
});
export default mongoose.model('Wallet', WalletSchema);
