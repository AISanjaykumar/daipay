import { Router } from "express";
import { listTransactions } from "../services/transaction.service.js";
import Transaction from "../db/models/Transaction.js";

const r = Router();

/**
 * GET /transactions/:wallet_id
 * Fetch paginated transactions for a specific wallet.
 * Query params:
 *   - page (default: 1)
 *   - limit (default: 10)
 */
r.get("/:wallet_id", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🔹 Get total count for pagination
    const total = await Transaction.countDocuments({
      $or: [{ from_wallet: wallet_id }, { to_wallet: wallet_id }],
    });

    // 🔹 Use your existing listTransactions but apply skip + limit manually
    const txs = await Transaction.find({
      $or: [{ from_wallet: wallet_id }, { to_wallet: wallet_id }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      wallet_id,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: txs.length,
      transactions: txs,
    });
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default r;
