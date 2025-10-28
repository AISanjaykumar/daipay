import { Router } from "express";
import { submitPayment } from "../services/payment.service.js";

const r = Router();

// Submit signed canonical payment
r.post("/submit", async (req, res, next) => {
  try {
    const { canonical_body, from_sig, from_pubkey } = req.body || {};
    const body = JSON.parse(canonical_body);
    const out = await submitPayment(body, from_sig, from_pubkey);
    res.json({ status: "accepted", ...out });
  } catch (e) {
    next(e);
  }
});

export default r;
