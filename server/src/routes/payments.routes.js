import { Router } from "express";
import { submitPayment } from "../services/payment.service.js";

const r = Router();

// Submit signed canonical payment
r.post("/submit", async (req, res) => {
  try {
    const { canonical_body, from_sig, from_pubkey } = req.body || {};
    const body = JSON.parse(canonical_body);
    const out = await submitPayment(body, from_sig, from_pubkey);
    res.json({ status: "accepted", ...out });
  } catch (e) {
    console.error("[/payments/submit] Error:", e.message);

    let code = 400;
    let error = e.message || "payment_failed";

    if (error.includes("invalid_sig")) code = 400;
    else if (error.includes("nonce_used")) code = 409;
    else if (error.includes("insufficient_balance")) code = 402;
    else if (error.includes("wallet_not_found")) code = 404;

    res.status(code).json({ error });
  }
});

export default r;
