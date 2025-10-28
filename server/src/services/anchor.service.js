import Block from '../db/models/Block.js';
import Anchor from '../db/models/Anchor.js';
import { h512 } from '../crypto/hash.js';

/**
 * Public-chain anchoring stub:
 * - Computes a Merkle-like root across a range of block roots (concatenation hash for MVP).
 * - Stores a stub record with a dummy tx_hash (no real chain tx here).
 */
export async function anchorBlocks({ fromHeight, toHeight, chain='ethereum' } = {}){
  const max = (await Block.findOne().sort({ height: -1 }).lean())?.height || 0;
  const from = fromHeight ?? Math.max(1, max - 99);
  const to = toHeight ?? max;
  const blocks = await Block.find({ height: { $gte: from, $lte: to } }).sort({ height: 1 }).lean();
  if (!blocks.length) return null;
  const concat = blocks.map(b => b.root).join('');
  const merkle_root = h512(concat);
  const anchor_id = h512(JSON.stringify({ chain, from, to, merkle_root }));
  await Anchor.create({ anchor_id, chain, block_height_from: from, block_height_to: to, merkle_root, tx_hash: '0xstub_tx_hash' });
  return { anchor_id, chain, from, to, merkle_root, tx_hash: '0xstub_tx_hash' };
}

export async function listAnchors(limit=20){
  return Anchor.find().sort({ created_at: -1 }).limit(limit).lean();
}
