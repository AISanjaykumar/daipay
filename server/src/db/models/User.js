import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
  provider: { type: String, default: "credentials" },
  wallet: {
    active: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    wallet_id: String,
    wallet_pubkey: String,
    wallet_secret: String,
  },
  googleId: String,
});

export default mongoose.model("User", userSchema);
