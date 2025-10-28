import Payment from '../db/models/Payment.js';
import Nonce from '../db/models/Nonce.js';
import { verify } from '../crypto/ed25519.js';
import { canonical } from '../crypto/canonical.js';
import { h512 } from '../crypto/hash.js';
import { credit, debit } from './wallet.service.js';
import { appendReceipt } from './ledger.service.js';

export async function submitPayment(body, from_sig, from_pubkey){
  // canonical string & digest
  const c = canonical(body);
  const digest = h512(c);

  // verify signature
  const ok = verify(from_pubkey, new TextEncoder().encode(c), from_sig);
  if (!ok) throw new Error('invalid_sig');

  // nonce protection (unique per wallet)
  try {
    await Nonce.create({ wallet_id: body.from, nonce: body.nonce, used_at: new Date() });
  } catch(e){
    throw new Error('nonce_used');
  }

  // balances
  await debit(body.from, body.amount_micros);
  await credit(body.to, body.amount_micros);

  // create payment record + receipt
  const pox_id = h512(digest + from_sig);
  await Payment.create({
    pox_id, ...body, from_sig, status: 'accepted', created_at: new Date()
  });

  const receipt_id = await appendReceipt({
    type: 'payment', ref_id: pox_id, timestamp: new Date(body.timestamp || new Date().toISOString())
  });

  return { pox_id, receipt_id };
}
