import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../db/models/User.js";

const r = Router();
const JWT_SECRET = "secretkey";

// Signup
r.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userObject = user.toObject();
    delete userObject.password;
    res.json({ message: "Login successful", user: userObject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Google Auth
r.post("/google", async (req, res) => {
  const { token } = req.body;
  try {
    const googleUser = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );
    const { email, name, sub } = googleUser.data;

    let user = await User.findOne({ email });
    if (!user)
      user = await User.create({
        name,
        email,
        provider: "google",
        googleId: sub,
      });

    const jwtToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token: jwtToken, user });
  } catch (err) {
    res.status(500).json({ message: "Google auth failed" });
  }
});

// Auto refresh route
r.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default r;
