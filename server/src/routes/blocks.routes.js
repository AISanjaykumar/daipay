import { Router } from "express";
import { listBlocks } from "../services/ledger.service.js";

const r = Router();

r.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allBlocks = await listBlocks();
    const total = allBlocks.length;

    const items = allBlocks.slice(skip, skip + limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: items.length,
      items,
    });
  } catch (err) {
    console.error("Error fetching blocks:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default r;
