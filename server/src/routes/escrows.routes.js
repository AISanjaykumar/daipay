import { Router } from 'express';
import { createEscrow, releaseEscrow, listEscrows, getEscrow } from '../services/escrow.service.js';

const r = Router();

r.get('/', async (_req, res) => {
  const items = await listEscrows(50);
  res.json({ items });
});

r.get('/:id', async (req, res) => {
  const e = await getEscrow(req.params.id);
  if (!e) return res.status(404).json({ error: 'not_found' });
  res.json(e);
});

r.post('/create', async (req, res, next) => {
  try {
    const out = await createEscrow(req.body);
    res.json({ status:'locked', ...out });
  } catch(e){ next(e); }
});

r.post('/release', async (req, res, next) => {
  try {
    const out = await releaseEscrow(req.body);
    res.json({ status:'released', ...out });
  } catch(e){ next(e); }
});

export default r;
