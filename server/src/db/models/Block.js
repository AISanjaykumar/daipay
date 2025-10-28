import mongoose from 'mongoose';
const BlockSchema = new mongoose.Schema({
  height: { type: Number, unique: true, index: true },
  root: { type: String, index: true },
  prev_root: String,
  created_at: { type: Date, default: () => new Date() },
  receipt_ids: [String]
});
export default mongoose.model('Block', BlockSchema);
