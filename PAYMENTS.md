# PAYMENTS.md

# DAIPay — Non‑Custodial Payment Specification

This document defines the deterministic, canonical, and fully verifiable **non‑custodial payment flow** used in DAIPay.
It includes:

* Canonical JSON rules
* Signature rules
* Error codes
* Developer guidelines
* Working examples

---

# 1. Overview

DAIPay uses a **non‑custodial payment system** where:

* The **client constructs** the full payment object.
* The **client canonicalizes** the object.
* The **client signs it** using Ed25519.
* The server **verifies deterministically**.
* The server stores the payment in the ledger.

This ensures **no tampering**, **no reordering**, and **strong replay protection**.

---

# 2. Canonical JSON Specification

All messages (registration + payments) MUST follow strict canonical rules.
This is required to prevent:

* Signature mismatches
* Non‑deterministic where different JSON forms represent the same message

### Canonical JSON Rules

```
1. Sort all object keys in lexicographic order (ASCII).
2. No whitespace (no tabs, no indentation, no spaces).
3. No trailing commas.
4. Strings must not contain unnecessary escapes.
5. Numbers must be encoded without quotes.
6. Booleans must be lowercase true/false.
7. null is allowed.
8. Arrays must preserve order exactly.
```

### Example — Canonical Form

Input:

```json
{
  "amount": 10,
  "from": "userA",
  "to": "userB"
}
```

Canonical Output:

```
{"amount":10,"from":"userA","to":"userB"}
```

---

# 3. Payment Object Schema

Every payment object MUST follow the schema below:

```
{
  amount: number,            // integer micros
  from: string,              // wallet id
  to: string,                // wallet id
  memo: string | null,       // optional
  nonce: string,             // UUIDv4 recommended
  timestamp: number,         // UNIX ms
}
```

---

# 4. Signature Flow

Payment signatures guarantee:

* Determinism
* Authenticity
* Replay protection

### Steps:

```
1. Client builds the payment object.
2. Client canonicalizes the object.
3. Client signs canonical string using Ed25519.
4. Client sends: { payment, canonical, signature, publicKey }
5. Server verifies correctness.
```

### Signature Input

The **canonical JSON string** is the only allowed value.
SIGN EXACTLY the canonical string.

Example Signing Input:

```
{"amount":10,"from":"A","memo":null,"nonce":"uuid","timestamp":1730000000000,"to":"B"}
```

---

# 5. Server Validation Rules

Upon receiving a payment:

### 1. Re‑canonicalization Check

Server re‑canonicalizes the user payment.
If `canonical !== serverCanonical`: reject.

### 2. Ed25519 Signature Verification

Server checks:

```
verify(signature, serverCanonical, publicKey)
```

Reject if false.

### 3. Nonce Replay Check

Every nonce must be unique.
Stores nonce in ledger.

### 4. Amount & Wallet Rules

* Amount > 0
* From wallet exists
* To wallet exists

### 5. Ledger Write

Append to ledger:

* payment
* canonical string
* signature
* public key
* server timestamp

---

# 6. Error Codes

Error responses always return deterministic JSON.

| Code                 | Message                       | Meaning                             |
| -------------------- | ----------------------------- | ----------------------------------- |
| `invalid_sig`        | Signature verification failed | Canonical mismatch or bad key       |
| `invalid_canonical`  | Canonical JSON mismatch       | Input not deterministically encoded |
| `bad_request`        | Missing fields                | Required object fields absent       |
| `nonce_replay`       | Nonce already used            | Replay attack detected              |
| `wallet_not_found`   | From/To invalid               | Wallet doesn't exist                |
| `insufficient_funds` | Balance error                 | Not enough balance to send          |
| `internal_error`     | Server error                  | Unexpected condition                |

---

# 7. Full Payment Example

### Input Object

```json
{
  "amount": 1500000,
  "from": "wallet_123",
  "to": "wallet_456",
  "memo": "Invoice #44",
  "nonce": "e3f1ae70-c56c-4e21-9d09-e2bdcf1f07a6",
  "timestamp": 1730100000000
}
```

### Canonical Output

```
{"amount":1500000,"from":"wallet_123","memo":"Invoice #44","nonce":"e3f1ae70-c56c-4e21-9d09-e2bdcf1f07a6","timestamp":1730100000000,"to":"wallet_456"}
```

### Signed Payload

```
base64( sign( canonical , secretKey ) )
```

### Client → Server Request Body

```json
{
  "payment": {
    "amount": 1500000,
    "from": "wallet_123",
    "memo": "Invoice #44",
    "nonce": "e3f1ae70-c56c-4e21-9d09-e2bdcf1f07a6",
    "timestamp": 1730100000000,
    "to": "wallet_456"
  },
  "canonical": "{\"amount\":1500000,\"from\":\"wallet_123\",\"memo\":\"Invoice #44\",\"nonce\":\"e3f1ae70-c56c-4e21-9d09-e2bdcf1f07a6\",\"timestamp\":1730100000000,\"to\":\"wallet_456\"}",
  "signature": "BASE64_SIGNATURE",
  "publicKey": "BASE64_PUBLIC_KEY"
}
```

---

# 8. Developer Tips

* Always sign canonical JSON **on client side only**.
* Never construct canonical JSON on server.
* Use TweetNaCl, noble‑ed25519, or @stablelib/ed25519.
* Use stable stringify libraries if needed.
* Use UUID for nonce.
* Write automated canonical tests in CI.

---

# 9. Future Extensions

The format supports future additions such as:

* Multi‑payment batching
* Contract calls
* Escrowed payments
* Zero‑knowledge proofs
* Deterministic ledger state roots

All future additions MUST follow deterministic canonical rules.

---

# End of Document
