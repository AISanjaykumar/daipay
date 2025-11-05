/**
 * Simple in-memory idempotency cache (replace with Redis/DB in production)
 * Applies when client supplies `Idempotency-Key` header.
 */
const store = new Map();
const TTL_MS = 15 * 60 * 1000;

export default function idempotency(req, res, next) {
  const key = req.header("Idempotency-Key");
  if (!key) return next();
  const now = Date.now();
  const hit = store.get(key);
  if (hit && now - hit.time < TTL_MS) {
    res.set("Idempotency-Replay", "true");
    return res.status(hit.status).json(hit.body);
  }
  const json = res.json.bind(res);
  res.json = (body) => {
    try {
      store.set(key, { time: Date.now(), status: res.statusCode, body });
    } catch {}
    return json(body);
  };
  next();
}
