import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    tx_id: { type: String, unique: true, required: true },
    type: { type: String, enum: ["credit", "debit", "transfer"], required: true },
    from_wallet: { type: String }, // wallet_id
    to_wallet: { type: String },
    amount_micros: { type: Number, required: true },
    note: { type: String },
    status: { type: String, default: "success" }, // could extend to 'pending'/'failed'
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
