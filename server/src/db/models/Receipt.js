import mongoose from "mongoose";
const ReceiptSchema = new mongoose.Schema({
  receipt_id: { type: String, unique: true, index: true },
  type: {
    type: String,
    enum: ["payment", "escrow_lock", "escrow_release", "smartcontract_deploy"],
  },
  ref_id: String,
  ledger_root: { type: String, default: "" },
  timestamp: Date,
});
export default mongoose.model("Receipt", ReceiptSchema);
