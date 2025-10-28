import { Router } from 'express';
import { anchorBlocks, listAnchors } from '../services/anchor.service.js';

const r = Router();

r.get('/', async (_req, res) => {
  const items = await listAnchors(50);
  res.json({ items });
});

r.post('/run', async (req, res, next) => {
  try {
    const out = await anchorBlocks(req.body || {});
    res.json(out || { message: 'nothing_to_anchor' });
  } catch(e){ next(e); }
});

export default r;
