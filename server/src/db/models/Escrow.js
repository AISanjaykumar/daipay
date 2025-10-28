import mongoose from 'mongoose';
const EscrowSchema = new mongoose.Schema({
  escrow_id: { type: String, unique: true, index: true },
  payer: String,
  payee: String,
  amount_micros: Number,
  balance_micros: Number,
  conditions: {
    type: { type: String, default: 'any_of_proofs' }, // minimal MVP
    count: { type: Number, default: 1 },
    ref_prefix: { type: String, default: 'por:' }
  },
  created_at: { type: Date, default: () => new Date() },
  expires_at: { type: Date },
  state: { type: String, enum: ['active','exhausted','expired'], default: 'active' },
  payer_sig: String
});
export default mongoose.model('Escrow', EscrowSchema);
