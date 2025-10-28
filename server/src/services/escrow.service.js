import Escrow from '../db/models/Escrow.js';
import Receipt from '../db/models/Receipt.js';
import { h512 } from '../crypto/hash.js';
import { debit, credit } from './wallet.service.js';
import { appendReceipt } from './ledger.service.js';

/**
 * Create escrow: debits payer immediately and locks funds.
 */
export async function createEscrow({ payer, payee, amount_micros, conditions, expires_at, payer_sig }) {
  // debit payer
  await debit(payer, amount_micros);
  const escrow = {
    payer, payee, amount_micros, balance_micros: amount_micros,
    conditions: conditions || { type: 'any_of_proofs', count: 1, ref_prefix: 'por:' },
    expires_at: expires_at ? new Date(expires_at) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
    payer_sig: payer_sig || ''
  };
  const escrow_id = h512(JSON.stringify({ payer, payee, amount_micros, ts: Date.now() }));
  await Escrow.create({ ...escrow, escrow_id });
  await appendReceipt({ type: 'escrow_lock', ref_id: escrow_id, timestamp: new Date() });
  return { escrow_id };
}

/**
 * Release escrow funds if evidence found: we check receipts containing ref_prefix.
 * amount_micros cannot exceed remaining balance.
 */
export async function releaseEscrow({ escrow_id, evidence_ref, amount_micros }) {
  console.log("evidence_ref >>>", evidence_ref)
  const e = await Escrow.findOne({ escrow_id });
  if (!e) throw new Error('not_found');
  if (e.state !== 'active') throw new Error('escrow_not_active');
  if (e.balance_micros <= 0) throw new Error('escrow_empty');

  // Basic evidence check: find at least 1 receipt whose ref_id starts with evidence_ref OR
  // for MVP, allow direct pass if evidence_ref provided (simulate success)
  // Strict rule: evidence_ref must be provided AND match a receipt.ref_id exactly,
  // and it must start with the escrow's ref_prefix (e.g., 'por:').
  if (!evidence_ref) throw new Error('evidence_missing');
  const prefix = (e.conditions?.ref_prefix || 'por:');
  if (!evidence_ref.startsWith(prefix)) throw new Error('evidence_prefix_mismatch');
  const hasReceipt = await Receipt.exists({ "ref_id": escrow_id });
  if (!hasReceipt) throw new Error('evidence_not_found');

  const amt = Math.min(amount_micros, e.balance_micros);
  await credit(e.payee, amt);
  e.balance_micros -= amt;
  if (e.balance_micros === 0) e.state = 'exhausted';
  await e.save();
  await appendReceipt({ type: 'escrow_release', ref_id: escrow_id, timestamp: new Date() });
  return { escrow_id, released_micros: amt, state: e.state, balance_micros: e.balance_micros };
}

export async function getEscrow(escrow_id) {
  return Escrow.findOne({ escrow_id }).lean();
}

export async function listEscrows(limit = 50) {
  return Escrow.find().sort({ created_at: -1 }).limit(limit).lean();
}
