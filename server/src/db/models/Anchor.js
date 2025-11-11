import mongoose from "mongoose";
const { Schema } = mongoose;

const AnchorSchema = new Schema({
  anchor_id: { type: String, unique: true, index: true },
  chain: { type: String, default: "ethereum" },
  block_height_from: Number,
  block_height_to: Number,
  merkle_root: String,
  blocks: [{ type: Schema.Types.ObjectId, ref: "Block" }],
  tx_hash: { type: String, required: true },
  created_at: { type: Date, default: () => new Date() },
});

export default mongoose.model("Anchor", AnchorSchema);
