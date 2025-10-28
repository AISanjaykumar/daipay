import { Router } from 'express';
import { listBlocks } from '../services/ledger.service.js';

const r = Router();

r.get('/', async (_req, res) => {
  const items = await listBlocks(50);
  res.json({ items });
});

export default r;
