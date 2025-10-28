import mongoose from 'mongoose';
const AnchorSchema = new mongoose.Schema({
  anchor_id: { type: String, unique: true, index: true },
  chain: { type: String, default: 'ethereum' },
  block_height_from: Number,
  block_height_to: Number,
  merkle_root: String,
  tx_hash: { type: String, default: '0xstub_tx_hash' },
  created_at: { type: Date, default: () => new Date() }
});
export default mongoose.model('Anchor', AnchorSchema);
