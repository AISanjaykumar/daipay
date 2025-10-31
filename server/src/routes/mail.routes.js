import { Router } from "express";
import crypto from "crypto";
import User from "../db/models/User.js";
import { transporter } from "../lib/nodemail.config.js";

const router = Router();

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    let user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate random OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send email
    await transporter.sendMail({
      from: `"Verification" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || !user.otpExpiresAt)
      return res.status(400).json({ message: "No OTP found" });

    if (Date.now() > new Date(user.otpExpiresAt).getTime()) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/welcome", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    let user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Send email
    await transporter.sendMail({
      from: `"Welcome to DaiPay" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Welcome to DaiPay!",
      text: `Welcome to DaiPay, ${user.name}! We're glad to have you on board.`,
    });

    return res.json({
      success: true,
      message: "Welcome email sent successfully",
    });
  } catch (err) {
    console.error("Send welcome email error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

export default router;
