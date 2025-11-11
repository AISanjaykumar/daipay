import Block from "../db/models/Block.js";
import Anchor from "../db/models/Anchor.js";
import { h512 } from "../crypto/hash.js";

/**
 * Anchors new unsealed blocks sequentially and securely.
 * - Uses full block data for tamper-proof tx_hash
 * - Skips already anchored ranges
 * - Automatically starts after the last anchor
 */
export async function anchorBlocks({ fromHeight, toHeight, chain = "ethereum" } = {}) {
  // Get the latest block height
  const latestBlock = await Block.findOne().sort({ height: -1 }).lean();
  if (!latestBlock) return { message: "no_blocks_in_chain" };

  // Get last sealed anchor
  const latestAnchor = await Anchor.findOne().sort({ block_height_to: -1 }).lean();

  // Determine batch range
  const from = fromHeight ?? ((latestAnchor?.block_height_to || 0) + 1);
  const to = toHeight ?? latestBlock.height;

  if (to < from) {
    return { message: "nothing_new_to_anchor" };
  }

  // Fetch unanchored blocks
  const blocks = await Block.find({ height: { $gte: from, $lte: to } })
    .sort({ height: 1 })
    .lean();

  if (!blocks.length) {
    return { message: "no_blocks_found_in_range" };
  }

  // 🔒 Filter only blocks with valid roots
  const validBlocks = blocks.filter(b => b?.root && typeof b.root === "string");
  if (!validBlocks.length) {
    return { message: "no_valid_block_roots" };
  }

  // 🧮 1️⃣ Compute Merkle root (concatenated roots)
  const concatRoots = validBlocks.map(b => b.root).join("");
  const merkle_root = h512(concatRoots);

  // 🧩 2️⃣ Compute tamper-proof tx_hash (full block data)
  const serializedBlocks = validBlocks
    .map(b => JSON.stringify(b, Object.keys(b).sort()))
    .join("|");
  const tx_hash = h512(serializedBlocks);

  // 🆔 3️⃣ Generate deterministic anchor_id
  const anchor_id = h512(JSON.stringify({ chain, from, to, merkle_root, tx_hash }));

  // 🧾 4️⃣ Prevent duplicates
  const exists = await Anchor.findOne({ anchor_id }).lean();
  if (exists) return { message: "already_anchored", anchor_id };

  // 🔗 5️⃣ Store block references (ObjectIds)
  const blockRefs = validBlocks.map(b => b._id);

  // 💾 6️⃣ Save new anchor
  await Anchor.create({
    anchor_id,
    chain,
    block_height_from: from,
    block_height_to: to,
    merkle_root,
    blocks: blockRefs,
    tx_hash,
  });

  console.log(`✅ Anchor created for blocks ${from} → ${to} (${blockRefs.length} blocks)`);

  return {
    message: "anchor_created",
    anchor_id,
    chain,
    from,
    to,
    merkle_root,
    tx_hash,
    block_count: blockRefs.length,
  };
}

/** List anchors with limit */
export async function listAnchors(limit = 20) {
  return Anchor.find().sort({ created_at: -1 }).limit(limit).lean();
}
