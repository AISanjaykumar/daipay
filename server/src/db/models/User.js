import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
  provider: { type: String, default: "credentials" },
  isActiveWallet: { type: Boolean, default: false },
  otp: String,
  otpExpiresAt: Date,
  googleId: String,
  wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
  },
});

export default mongoose.model("User", userSchema);
