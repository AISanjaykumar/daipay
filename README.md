# DAIPay — Deterministic, Non‑Custodial Wallet & Payments (Option A)

This repository contains **DAIPay**, a deterministic wallet, payments, and ledger prototype
built on a MERN-style stack:

- **Backend:** Node.js, Express, MongoDB
- **Frontend:** React (Vite)
- **Crypto:** Ed25519 signatures, canonical JSON, deterministic hashing
- **Ledger:** Receipts, blocks, and anchors for verifiable history

This version is configured for **Option A — Non‑Custodial Wallets**:

- Users generate and control their own keys (client-side).
- The server never sees or returns private keys.
- Payments are submitted as **client‑signed canonical payloads** and verified using the registered wallet public key.

---

## 1. Architecture Overview

### 1.1 High-Level Components

- `server/` — API, auth, wallets, payments, ledger, blocks, anchors.
- `web/` — React app (dashboard, blocks, payments UI, etc.).
- `mongo` — Operational database (users, wallets, payments, receipts, blocks, etc.).

### 1.2 Non‑Custodial Wallet Model

- Each user has **zero or one** registered wallet.
- Keys are generated in the **client** (browser, CLI, or mobile).
- The client proves control of the wallet by signing a **canonical registration message**.
- The server stores:
  - `Wallet.wallet_id` — deterministic hash of `pubkey`.
  - `Wallet.pubkey` — public key (base58-encoded).
  - `User.wallet_id` — reference to the wallet document.

No private key is ever returned by any server API.

---

## 2. Backend Layout

```text
server/
  src/
    app.js
    server.js

    middleware/
      verifyAppAccess.js
      requireAuth.js
      validate.js
      idempotency.js      # simple in-memory idempotency (placeholder)

    db/models/
      User.js
      Wallet.js
      Payment.js
      Nonce.js
      Receipt.js
      Block.js
      Anchor.js
      Transaction.js
      ...

    crypto/
      ed25519.js          # genKeypair, sign, verify (server-side usage only)
      hash.js             # h512()
      canonical.js        # canonical(JSON) via json-stable-stringify

    services/
      auth.service.js     # (logic inside auth.routes for now)
      wallet.service.js   # createWallet, credit, debit, transfer, registerWallet
      payment.service.js  # submitPayment (signature verification, nonce, ledger)
      ledger.service.js   # appendReceipt, sealBlock
      anchor.service.js   # anchorBlocks, cron
      transaction.service.js
      ...

    routes/
      auth.routes.js
      wallets.routes.js
      payments.routes.js
      blocks.routes.js
      anchors.routes.js
      transactions.route.js
      mail.routes.js
      ...
```

---

## 3. Environment Variables

At minimum, the backend expects:

- `MONGO_URL` — e.g. `mongodb://localhost:27017/daipay`
- `JWT_SECRET` — secret for signing auth tokens
- `APP_SECRET` — shared secret for `x-app-secret` header
- `MAIL_USER` / `MAIL_PASS` — SMTP credentials (for welcome email, OTP etc.)

The server **will refuse to start** if `JWT_SECRET` or `APP_SECRET` are missing.

---

## 4. Auth & User Flow

### 4.1 Signup

Endpoint:

```http
POST /v1/auth/signup
```

Request body:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "StrongPass123"
}
```

Behavior:

- Hashes password with `bcrypt`.
- Creates a `User` with `provider = "credentials"`.
- Issues a JWT and sets `token` cookie.
- **Does not** create a wallet.
- Response:

```json
{
  "message": "Signup successful",
  "token": "<JWT>",
  "user": {
    "_id": "...",
    "name": "Alice",
    "email": "alice@example.com",
    "provider": "credentials",
    "wallet_id": null
  }
}
```

### 4.2 Google OAuth (Optional)

Endpoint:

```http
POST /v1/auth/google
```

- Accepts a Google ID token.
- Creates or fetches a `User` with `provider = "google"`.
- Issues a JWT.
- **Does not** create a wallet.

---

## 5. Wallet Registration (Non‑Custodial)

Users must register a wallet **after** signup.

### 5.1 Client-Side Steps

1. Generate an Ed25519 keypair in the client (e.g., via TweetNaCl in the browser).
2. Construct the registration message:

   ```json
   {
     "action": "register_wallet",
     "pubkey": "<user_public_key_base58>",
     "user_id": "<user_id_from_auth>"
   }
   ```

3. Canonicalize the JSON (same as `canonical()` in `server/src/crypto/canonical.js`).
4. Sign the canonical string bytes with the private key.
5. Send the result to `/v1/wallets/register`.

### 5.2 API: `POST /v1/wallets/register`

```http
POST /v1/wallets/register
Authorization: Bearer <JWT>
x-app-secret: <APP_SECRET>
Content-Type: application/json

{
  "pubkey": "<public_key_base58>",
  "label": "My DaiPay Wallet",
  "signature": "<signature_base58_over_canonical_message>"
}
```

Behavior:

- Uses `requireAuth` to ensure the user is logged in.
- Reconstructs the canonical registration message.
- Verifies the signature with the provided `pubkey` via `verify()` in `ed25519.js`.
- Ensures the `pubkey` is unique across wallets.
- Calls `createWallet(pubkey, label)` to create the wallet.
- Associates the wallet with `User.wallet_id`.
- Response:

```json
{
  "message": "Wallet registered successfully",
  "wallet": {
    "wallet_id": "<hash_of_pubkey>",
    "pubkey": "<public_key_base58>",
    "balance_micros": 0,
    "label": "My DaiPay Wallet",
    "created_at": "2025-11-13T00:00:00.000Z"
  }
}
```

---

## 6. Payments — Full Non‑Custodial Flow

Payments are **always signed client-side** and then verified by the backend.

### 6.1 Canonical Payment Body

A payment body might look like:

```json
{
  "from_wallet": "<wallet_id>",
  "to_wallet": "<wallet_id>",
  "amount_micros": 1500000,
  "nonce": "unique-nonce-123",
  "timestamp": "2025-11-13T10:00:00.000Z",
  "memo": "Invoice #42"
}
```

The client:

1. Builds this JSON.
2. Canonicalizes it (same as `canonical()` on the server).
3. Computes the bytes of the canonical string.
4. Signs those bytes with the user’s private key.

### 6.2 API: `POST /v1/payments/submit` (Non‑Custodial + Auth‑Bound)

```http
POST /v1/payments/submit
Authorization: Bearer <JWT>
x-app-secret: <APP_SECRET>
Content-Type: application/json

{
  "canonical_body": "<canonical_json_string>",
  "from_sig": "<signature_base58_over_canonical_body>",
  "from_pubkey": "<public_key_base58>"
}
```

Backend behavior:

1. **Auth binding**
   - `requireAuth` ensures request has a valid JWT.
   - Looks up `req.user.wallet_id` and loads the associated wallet.
   - Ensures:
     - `wallet.wallet_id === body.from_wallet` (if `from_wallet` is present).
     - `wallet.pubkey === from_pubkey`.
   - If these checks fail, returns:
     - `403 user_has_no_registered_wallet`
     - `403 from_wallet_does_not_belong_to_authenticated_user`
     - `400 from_pubkey_mismatch_with_registered_wallet`

2. **Signature & payment validation** (`submitPayment()` in `payment.service.js`):
   - Re-canonicalizes `body` server-side.
   - Computes hash `digest = h512(canonical(body))`.
   - Verifies `from_sig` against `from_pubkey` using `verify()` in `ed25519.js`.
   - Checks `Nonce` collection for uniqueness (prevents replay).
   - Checks balances via `debit()`/`credit()` from `wallet.service.js`.
   - Creates a `Payment` record and appends a `Receipt` to the ledger.

3. **Response:**

```json
{
  "status": "accepted",
  "pox_id": "<payment_execution_id>",
  "receipt_id": "<ledger_receipt_id>",
  "payment": { /* Payment document */ }
}
```

Error codes:

- `400 invalid_sig` — signature does not match payload/pubkey.
- `409 nonce_used` — nonce already used (replay attempt).
- `402 insufficient_balance` — not enough balance in `from_wallet`.
- `404 wallet_not_found` — wallet referenced doesn't exist.

This gives you **full non‑custodial payments**:
- Client signs everything.
- Server verifies both signature and wallet ownership via auth.

---

## 7. Ledger & Blocks (High‑Level)

- Each successful payment (or escrow event, etc.) generates a **Receipt** via `appendReceipt()`.
- A background process periodically:
  - Fetches pending receipts.
  - Calculates a deterministic block root hash.
  - Creates a `Block` with:
    - `height`, `root`, `prev_root`, `receipt_ids`.
  - Marks receipts as sealed with `ledger_root = root`.

Optional: blocks can then be **anchored** to external systems (DAIChain, L1 blockchain, timestamp authority) via `anchor.service.js`.

---

## 8. Running Locally

### 8.1 Backend

```bash
cd server
npm install

# Provide .env or environment with:
# MONGO_URL, JWT_SECRET, APP_SECRET, MAIL_USER, MAIL_PASS

npm run dev
```

The backend typically listens on `http://localhost:8080/v1`.

### 8.2 Frontend

```bash
cd web
npm install

# .env.local:
# VITE_API_BASE=http://localhost:8080/v1
# VITE_APP_SECRET=<same value as APP_SECRET>

npm run dev
```

Then open the URL printed by Vite (usually `http://localhost:5173`).

---

## 9. Dev Notes & Next Steps

- **Idempotency:** The current idempotency middleware is in-memory; for production, back it with Redis or Mongo.
- **Job Queue:** Contract deployment and other long-running tasks should use a durable job queue.
- **Observability:** Integrate structured logging and metrics for production use.
- **Tests:** Add unit and integration tests for:
  - Wallet registration.
  - Payment signature verification and nonces.
  - Ledger and block sealing.

This README is intended as a working spec for engineers integrating and extending DAIPay with a fully non‑custodial, deterministic architecture.
