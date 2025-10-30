import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../db/models/User.js";
import { createWallet, credit } from "../services/wallet.service.js";
import { genKeypair } from "../crypto/ed25519.js";
import { transporter } from "../lib/nodemail.config.js";

const r = Router();
const JWT_SECRET = "secretkey";

// 🧠 Utility to issue JWT and sanitize user
function issueToken(user) {
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
  const userObject = user.toObject();
  delete userObject.password;
  return { token, user: userObject };
}

r.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const kp = genKeypair();
    const wallet = await createWallet(kp.pubkey, `${name}'s Wallet`, kp.secret);
    await credit(wallet.wallet_id, 1_000_000);

    const user = await User.create({
      name,
      email,
      password: hash,
      wallet_id: wallet._id,
      wallet_pubkey: kp.pubkey,
    });

    const { token, user: safeUser } = issueToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Signup successful",
      user: safeUser,
      wallet: {
        wallet_id: wallet.wallet_id,
        pubkey: wallet.pubkey,
        balance_micros: wallet.balance_micros,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate(
      "wallet_id",
      "wallet_id pubkey balance_micros"
    );
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const { token, user: safeUser } = issueToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    let wallet = safeUser.wallet_id;
    delete safeUser.wallet_id;
    safeUser.wallet = wallet;

    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🪪 GOOGLE AUTH — also create wallet if new user
r.post("/google", async (req, res) => {
  const { token } = req.body;
  try {
    const googleUser = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );
    const { email, name, sub } = googleUser.data;

    let user = await User.findOne({ email }).populate(
      "wallet_id",
      "wallet_id pubkey balance_micros"
    );

    if (!user) {
      const kp = genKeypair();
      const wallet = await createWallet(kp.pubkey, `${name}'s Wallet`);
      await credit(wallet.wallet_id, 1_000_000);

      user = await User.create({
        name,
        email,
        provider: "google",
        googleId: sub,
        wallet_id: wallet._id,
      });
    }

    const jwtToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google auth failed" });
  }
});

// Auto refresh route
r.get("/me", async (req, res) => {
  try {
    console.log("Auth /me called");
    const token = req.cookies.token;
    console.log("token :", token);
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

r.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default r;
