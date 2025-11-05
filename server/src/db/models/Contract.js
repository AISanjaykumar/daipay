import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    template: {
      type: String,
      enum: ["escrow", "scheduled", "reward"],
      required: true,
    },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    amount: { type: Number, required: true },
    trigger: { type: String, required: true },
    cooldown: { type: Boolean, default: false },
    guardian: { type: Boolean, default: false },
    summary: { type: String, required: true },
    contractHash: { type: String, required: true, unique: true },
    signature: { type: String },
    status: { type: String, enum: ["pending", "deployed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Contract", contractSchema);
