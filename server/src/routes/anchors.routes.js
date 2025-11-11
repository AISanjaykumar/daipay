import { Router } from "express";
import { anchorBlocks, listAnchors } from "../services/anchor.service.js";

const r = Router();

r.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const { items, total } = await listAnchors(page, limit);
  res.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

r.post("/run", async (req, res, next) => {
  try {
    const out = await anchorBlocks(req.body || {});
    res.json(out || { message: "nothing_to_anchor" });
  } catch (e) {
    next(e);
  }
});

export default r;
