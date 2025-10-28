import Block from '../db/models/Block.js';
import Receipt from '../db/models/Receipt.js';
import { h512 } from '../crypto/hash.js';

export async function appendReceipt(r){
  const payload = JSON.stringify({type:r.type, ref_id:r.ref_id, timestamp:r.timestamp.toISOString()});
  const receipt_id = h512(payload);
  await Receipt.create({ ...r, receipt_id, ledger_root: '' });
  return receipt_id;
}

export async function sealBlock(){
  const pending = await Receipt.find({ ledger_root: '' }).sort({ timestamp: 1 }).lean();
  if (!pending.length) return null;
  const last = await Block.findOne().sort({ height: -1 }).lean();
  const prev_root = last?.root || '0'.repeat(128);
  const idsConcat = pending.map(p => p.receipt_id).join('');
  const root = h512(idsConcat);
  const height = (last?.height || 0) + 1;
  await Block.create({ height, root, prev_root, receipt_ids: pending.map(p => p.receipt_id) });
  await Receipt.updateMany({ ledger_root: '' }, { $set: { ledger_root: root } });
  return { height, root, prev_root };
}

export async function listBlocks(limit=20){
  const items = await Block.find().sort({ height: -1 }).limit(limit).lean();
  return items;
}
