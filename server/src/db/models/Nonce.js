import mongoose from 'mongoose';
const NonceSchema = new mongoose.Schema({
  wallet_id: { type: String, index: true },
  nonce: { type: String, index: true },
  used_at: { type: Date, default: () => new Date() }
});
NonceSchema.index({ wallet_id: 1, nonce: 1 }, { unique: true });
export default mongoose.model('Nonce', NonceSchema);
