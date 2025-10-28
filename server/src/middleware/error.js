export function errorHandler(err, _req, res, _next){
  const known = ['invalid_sig','nonce_used','insufficient_balance'];
  const code = known.includes(err.message) ? 400 : 500;
  res.status(code).json({ error: err.message || 'internal_error' });
}
