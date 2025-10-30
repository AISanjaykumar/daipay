import { Router } from 'express'; 
import {
  createEscrow,
  releaseEscrow,
  listEscrows,
  getEscrow,
  listUserEscrows,
} from '../services/escrow.service.js';

const r = Router();

// Get all escrows (admin/dev)
r.get('/', async (_req, res) => {
  const items = await listEscrows(50);
  res.json({ items });
});

// Post escrows for authenticated user (payer)
r.post('/my', async (req, res) => {
  const body = req.body;
  let { wallet_id, page = 1, limit = 10 } = body;

  if (!wallet_id) return res.status(401).json({ error: 'unauthorized' });

  const { items, total, totalPages } = await listUserEscrows(wallet_id, Number(page), Number(limit));

  res.json({ success: true, page: Number(page), total, totalPages, items });
});

r.get('/:id', async (req, res) => {
  const e = await getEscrow(req.params.id);
  if (!e) return res.status(404).json({ error: 'not_found' });
  res.json(e);
});

// Create escrow (payer auto-set)
r.post('/create', async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.payer) return res.status(400).json({ error: 'missing_wallet' });

    const out = await createEscrow(body);
    res.json({ status: 'locked', ...out });
  } catch (e) {
    next(e);
  }
});

r.post('/release', async (req, res, next) => {
  try {
    const out = await releaseEscrow(req.body);
    res.json({ status: 'released', ...out });
  } catch (e) {
    next(e);
  }
});

export default r;
