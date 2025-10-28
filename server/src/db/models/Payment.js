import mongoose from 'mongoose';
const PaymentSchema = new mongoose.Schema({
  pox_id: { type: String, unique: true, index: true },
  from: String,
  to: String,
  amount_micros: Number,
  nonce: String,
  timestamp: Date,
  ref: String,
  from_sig: String,
  status: { type: String, enum: ['accepted','rejected'], default: 'accepted' },
  created_at: { type: Date, default: () => new Date() }
});
export default mongoose.model('Payment', PaymentSchema);
