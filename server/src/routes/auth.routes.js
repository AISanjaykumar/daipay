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

// 📝 SIGNUP — create wallet automatically
r.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    // 1️⃣ generate wallet keypair and create wallet
    const kp = genKeypair();
    const wallet = await createWallet(kp.pubkey, `${name}'s Wallet`, kp.secret);

    // 2️⃣ give initial faucet credit (for testing/demo)
    await credit(wallet.wallet_id, 1_000_000);

    // 3️⃣ create user and link wallet
    const user = await User.create({
      name,
      email,
      password: hash,
      wallet_id: wallet._id,
      wallet_pubkey: kp.pubkey,
    });

    transporter.sendMail({
      from: `"Welcome to DaiPay" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Welcome to DaiPay!",
      html: `
     <!-- Replace placeholders like {{name}}, {{walletId}}, {{pubkey}}, {{secretKey}}, {{supportUrl}} -->
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Wallet Keys</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:700px;margin:28px auto;background:transparent;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(16,24,40,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding:20px 24px;background:linear-gradient(90deg,#06b6d4,#7c3aed);color:#fff;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:48px;height:48px;border-radius:10px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-weight:700;">
                  ⚡
                </div>
                <div>
                  <div style="font-size:18px;font-weight:700;line-height:1;">DAIPay™ Wallet Keys</div>
                  <div style="font-size:12px;opacity:0.95;margin-top:2px;">Secure delivery — save your keys safely</div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 12px 0;color:#0f172a;font-size:15px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="margin:0 0 18px 0;color:#475569;font-size:14px;line-height:1.5;">
                Your wallet has been created successfully. Below are the details — <strong>store them securely</strong>. This message contains sensitive information.
              </p>

              <!-- Card with keys -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #eef2ff;border-radius:10px;background:#fbfdff;padding:14px;">
                <tr>
                  <td style="padding:6px 10px;">
                    <div style="font-size:13px;color:#64748b;margin-bottom:6px;">Wallet ID</div>
                    <div style="word-break:break-all;font-family:monospace;font-size:13px;color:#0f172a;">${
                      wallet.wallet_id
                    }</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 10px;">
                    <div style="font-size:13px;color:#64748b;margin-bottom:6px;">Public Key</div>
                    <div style="word-break:break-all;font-family:monospace;font-size:13px;color:#0f172a;">${
                      kp.pubkey
                    }</div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:6px 10px;border-top:1px dashed #e6eefc;margin-top:12px;">
                    <div style="font-size:13px;color:#64748b;margin-bottom:6px;">Secret Key (KEEP PRIVATE)</div>
                    <div style="word-break:break-all;font-family:monospace;background:#0f172a;color:#e6f7ff;padding:12px;border-radius:8px;font-size:13px;">
                      ${kp.secret}
                    </div>
                    <div style="margin-top:8px;font-size:12px;color:#7c8796;">
                      This secret key grants full control of your wallet. Do not share it with anyone.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security tips -->
              <div style="margin-top:18px;padding:14px;border-radius:8px;background:#f8fafc;border:1px solid #eef2ff;">
                <div style="font-weight:700;color:#0f172a;margin-bottom:6px;">Security Tips</div>
                <ul style="margin:0;padding-left:18px;color:#475569;font-size:13px;line-height:1.5;">
                  <li>Do <strong>not</strong> store your secret key in plain email or cloud storage.</li>
                  <li>Copy the key to a secure password manager (1Password, Bitwarden, KeePass).</li>
                  <li>If you suspect compromise, contact <a href="{{supportUrl}}" style="color:#0ea5a4;text-decoration:none;">support</a> and create a new wallet.</li>
                </ul>
              </div>

              <!-- Footer notes -->
              <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">
                If you didn't request this or need help, contact <a href="{{supportUrl}}" style="color:#0ea5a4;text-decoration:none;">support</a>.
              </p>
              <p style="margin:6px 0 0 0;font-size:12px;color:#94a3b8;">This email was sent to <strong>${email}</strong>. Expires in 24 hours.</p>
            </td>
          </tr>

          <!-- Bottom -->
          <tr>
            <td style="padding:14px 24px;background:#f8fafc;border-top:1px solid #eef2ff;text-align:center;color:#94a3b8;font-size:12px;">
              © ${new Date().getFullYear()} DAIPay™
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

     `,
    });

    const { token, user: safeUser } = issueToken(user);
    res.json({
      message: "Signup successful",
      token,
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

// 🔑 LOGIN (no wallet creation, just auth)
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
    res.json({ token, user: safeUser });
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

r.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default r;
