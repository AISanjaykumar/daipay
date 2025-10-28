# DAIPay MERN Starter (Deterministic Payments MVP)

This is a minimal starter for the DAIPay MVP using MERN (MongoDB, Express, React, Node).
It implements deterministic payments (PoX) with:
- Canonical JSON (sorted keys)
- SHA3-512 hashing
- Ed25519 signatures
- Per-wallet nonces (replay protection)
- Atomic debit/credit
- Receipts + hash-chained blocks
- Simple React UI to submit a payment

## Quick start (with Docker)
```bash
docker compose up -d --build
# API:   http://localhost:8080/v1
# Web:   http://localhost:5173
```
## Dev (without Docker)
```bash
# start Mongo locally, then:
cd server && npm i && npm run dev
cd ../web && npm i && npm run dev
```

## Disclaimer
This is an MVP for demo/testing, not production security-hardened.


## New extras
- Escrow endpoints + React UI
- Seed script (`docker compose exec api npm run seed`)
- Anchoring stub + UI (list + run)
- Makefile targets and GitHub Actions CI
