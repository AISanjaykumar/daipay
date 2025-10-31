import Payment from "../db/models/Payment.js";
import Nonce from "../db/models/Nonce.js";
import { verify } from "../crypto/ed25519.js";
import { canonical } from "../crypto/canonical.js";
import { h512 } from "../crypto/hash.js";
import { credit, debit } from "./wallet.service.js";
import { appendReceipt } from "./ledger.service.js";

export async function submitPayment(body, from_sig, from_pubkey) {
  try {
    if (!body || !from_sig || !from_pubkey)
      throw new Error("missing_required_fields");

    const c = canonical(body);
    const digest = h512(c);

    const isValid = verify(from_pubkey, new TextEncoder().encode(c), from_sig);
    if (!isValid) throw new Error("invalid_sig");

    try {
      await Nonce.create({
        wallet_id: body.from,
        nonce: body.nonce,
        used_at: new Date(),
      });
    } catch (err) {
      console.error("[submitPayment] Nonce reuse detected:", err.message);
      throw new Error("nonce_used");
    }

    try {
      await debit(body.from, body.amount_micros);
      await credit(body.to, body.amount_micros);
    } catch (err) {
      console.error("[submitPayment] Balance update failed:", err.message);

      if (
        err.message.includes("insufficient_balance") ||
        err.message.includes("wallet_not_found")
      ) {
        throw err;
      }

      throw new Error("balance_error");
    }

    const pox_id = h512(digest + from_sig);
    const paymentRecord = await Payment.create({
      pox_id,
      ...body,
      from_sig,
      status: "accepted",
      created_at: new Date(),
    });

    const receipt_id = await appendReceipt({
      type: "payment",
      ref_id: pox_id,
      timestamp: new Date(body.timestamp || new Date().toISOString()),
    });

    return { pox_id, receipt_id, payment: paymentRecord };
  } catch (err) {
    console.error("[submitPayment] Error:", err.message);
    throw new Error(err.message || "payment_failed");
  }
}
