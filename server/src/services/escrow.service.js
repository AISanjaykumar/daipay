import Escrow from '../db/models/Escrow.js';
import Receipt from '../db/models/Receipt.js';
import { h512 } from '../crypto/hash.js';
import { debit, credit } from './wallet.service.js';
import { appendReceipt } from './ledger.service.js';

/**
 * Create escrow: debits payer immediately and locks funds.
 */
export async function createEscrow({ payer, payee, amount_micros, conditions, expires_at, payer_sig }) {
  await debit(payer, amount_micros);
  const escrow_id = h512(JSON.stringify({ payer, payee, amount_micros, ts: Date.now() }));

  const escrow = {
    escrow_id,
    payer,
    payee,
    amount_micros,
    balance_micros: amount_micros,
    state: 'active',
    conditions: conditions || { type: 'any_of_proofs', count: 1, ref_prefix: 'por:' },
    expires_at: expires_at ? new Date(expires_at) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
    payer_sig: payer_sig || '',
    created_at: new Date(),
  };

  await Escrow.create(escrow);
  await appendReceipt({ type: 'escrow_lock', ref_id: escrow_id, timestamp: new Date() });

  return { escrow_id };
}

/**
 * List escrows with pagination (filtered by payer)
 */
export async function listUserEscrows(walletId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Escrow.countDocuments({ payer: walletId });
  const items = await Escrow.find({ payer: walletId })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    items,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getEscrow(escrow_id) {
  return Escrow.findOne({ escrow_id }).lean();
}

export async function listEscrows(limit = 50) {
  return Escrow.find().sort({ created_at: -1 }).limit(limit).lean();
}

export async function releaseEscrow({ escrow_id, evidence_ref, amount_micros }) {
  const e = await Escrow.findOne({ escrow_id });
  if (!e) throw new Error('not_found');
  if (e.state !== 'active') throw new Error('escrow_not_active');
  if (e.balance_micros <= 0) throw new Error('escrow_empty');

  if (!evidence_ref) throw new Error('evidence_missing');
  const prefix = (e.conditions?.ref_prefix || 'por:');
  if (!evidence_ref.startsWith(prefix)) throw new Error('evidence_prefix_mismatch');

  const hasReceipt = await Receipt.exists({ ref_id: escrow_id });
  if (!hasReceipt) throw new Error('evidence_not_found');

  const amt = Math.min(amount_micros, e.balance_micros);
  await credit(e.payee, amt);
  e.balance_micros -= amt;
  if (e.balance_micros === 0) e.state = 'exhausted';
  await e.save();

  await appendReceipt({ type: 'escrow_release', ref_id: escrow_id, timestamp: new Date() });
  return { escrow_id, released_micros: amt, state: e.state, balance_micros: e.balance_micros };
}
