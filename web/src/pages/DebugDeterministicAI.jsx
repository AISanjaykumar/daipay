"use client";

import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { genKeypair } from "../utils/genKeypair";

/* simple canonicalizer matching your Payments.jsx implementation */
function canonicalize(obj) {
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = obj[k];
        return acc;
      }, {})
  );
}

function pretty(json) {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}

function generateNonce() {
  return "n-" + Math.random().toString(36).slice(2);
}

export default function DeterministicDebugPage() {
  const [mode, setMode] = useState("payment"); // 'payment' | 'registration'
  const [rawInput, setRawInput] = useState(() =>
    pretty(
      JSON.stringify({
        from: "wallet_12345",
        to: "wallet_98765",
        amount_micros: 1500000,
        nonce: generateNonce(),
        timestamp: new Date().toISOString(),
        ref: "por:demo",
      })
    )
  );

  const [canonical, setCanonical] = useState("");
  const [determinism, setDeterminism] = useState("");
  const [pubkey, setPubkey] = useState(""); // used for payment verification too
  const [fromSecret, setFromSecret] = useState("");
  const [signature, setSignature] = useState("");
  const [serverResponse, setServerResponse] = useState(null);
  const [busy, setBusy] = useState(false);
  const [secretKey, setSecretKey] = useState(""); // shown in UI after keygen

  // Stepwise statuses
  const [steps, setSteps] = useState({
    json: null, // true/false
    canonical: null,
    signature: null, // null when N/A
    api: null,
  });

  // update canonical whenever rawInput changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(rawInput);
      const c = canonicalize(parsed);
      setCanonical(c);
      setDeterminism("");
      setSteps((s) => ({
        ...s,
        json: true,
        canonical: true,
        signature: null,
        api: null,
      }));
    } catch (e) {
      setCanonical("/* invalid JSON — cannot canonicalize */");
      setSteps((s) => ({
        ...s,
        json: false,
        canonical: false,
        signature: null,
        api: null,
      }));
    }
    setServerResponse(null);
    setSignature("");
  }, [rawInput, mode]);

  // Sign canonical (only used for payment tests)
  const handleSign = () => {
    setSteps((s) => ({ ...s, signature: null, api: null }));
    try {
      if (!fromSecret || fromSecret.trim().length === 0) {
        setSteps((s) => ({ ...s, signature: false }));
        return;
      }
      const parsed = JSON.parse(rawInput);
      const c = canonicalize(parsed);
      const sig = bs58.encode(
        nacl.sign.detached(
          new TextEncoder().encode(c),
          bs58.decode(fromSecret.trim())
        )
      );
      setSignature(sig);

      // Verify locally
      if (pubkey && pubkey.trim().length > 0) {
        const ok = nacl.sign.detached.verify(
          new TextEncoder().encode(c),
          bs58.decode(sig),
          bs58.decode(pubkey.trim())
        );
        setSteps((s) => ({ ...s, signature: !!ok }));
      } else {
        // if pubkey not provided, we still mark signature as produced (pass)
        setSteps((s) => ({ ...s, signature: !!sig }));
      }
    } catch (err) {
      setSignature("");
      setSteps((s) => ({ ...s, signature: false }));
    }
  };

  // Generate a keypair locally and update UI + JSON (registration flow)
  const generateKeypair = () => {
    try {
      const kp = genKeypair();
      // kp = { pubkey: "...", secret: "..." }
      setPubkey(kp.pubkey);
      setSecretKey(kp.secret);

      // update rawInput JSON: ensure it contains name/email (if present) and add pubkey
      try {
        const parsed = JSON.parse(rawInput);
        parsed.pubkey = kp.pubkey;
        // remove nonce/timestamp if present (registration shouldn't have them)
        delete parsed.nonce;
        delete parsed.timestamp;
        setRawInput(pretty(JSON.stringify(parsed)));
      } catch {
        // if rawInput invalid, create a minimal registration JSON
        const example = { name: "", email: "", pubkey: kp.pubkey };
        setRawInput(pretty(JSON.stringify(example)));
      }

      setSteps((s) => ({ ...s, api: null }));
      setServerResponse(null);
    } catch (err) {
      alert("Failed to generate keypair: " + String(err));
    }
  };

  const validateSignature = () => {
  console.log("Validating signature...");

  try {
    if (!pubkey || !secretKey) {
      setSteps((s) => ({ ...s, signature: false }));
      return;
    }

    // Parse JSON input safely
    let parsed;
    try {
      parsed = JSON.parse(rawInput);
    } catch (e) {
      console.error("Invalid JSON:", e);
      setSteps((s) => ({ ...s, signature: false }));
      return;
    }

    const c = canonicalize(parsed);
    const msgUint8 = new TextEncoder().encode(c);

    // Decode keys
    const secretKeyDecoded = bs58.decode(secretKey.trim());
    const publicKey = bs58.decode(pubkey.trim());

    // Generate signature
    const signature = nacl.sign.detached(msgUint8, secretKeyDecoded);
    // Verify signature
    const isValid = nacl.sign.detached.verify(msgUint8, signature, publicKey);
    console.log("Signature valid:", isValid);

    // Save the signature
    setSignature(bs58.encode(signature));

    // Update steps
    setSteps((s) => ({ ...s, signature: isValid }));

    console.log("Updated signature step");
  } catch (err) {
    console.error("Validation error:", err);
    setSteps((s) => ({ ...s, signature: false }));
  }
};


  // Call wallet create API (will generate keys client-side if not generated yet)
  const callWalletCreate = async () => {
    setBusy(true);
    setServerResponse(null);
    setSteps((s) => ({ ...s, api: null }));

    try {
      const parsed = JSON.parse(rawInput);

      // If pubkey not present in JSON / state, generate one so server gets a pubkey
      let usedPubkey = pubkey;
      if (!usedPubkey) {
        const kp = genKeypair();
        usedPubkey = kp.pubkey;
        setSecretKey(kp.secret);
        setPubkey(kp.pubkey);
        // update displayed JSON as well
        parsed.pubkey = usedPubkey;
        delete parsed.nonce;
        delete parsed.timestamp;
        setRawInput(pretty(JSON.stringify(parsed)));
      }

      const body = {
        pubkey: usedPubkey,
        name: parsed.name,
        email: parsed.email,
      };

      const res = await api("/wallets/create", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setServerResponse(res);
      setSteps((s) => ({ ...s, api: true }));
    } catch (err) {
      setServerResponse({ error: err?.message || String(err) });
      setSteps((s) => ({ ...s, api: false }));
    } finally {
      setBusy(false);
    }
  };

  // Call payments submit API
  const callPaymentsSubmit = async () => {
    setBusy(true);
    setServerResponse(null);
    setSteps((s) => ({ ...s, api: null }));
    try {
      const payment = JSON.parse(rawInput);
      const c = canonicalize(payment);

      // create signature using provided fromSecret (if any)
      let sig = signature;
      if (!sig && fromSecret && fromSecret.trim().length > 0) {
        sig = bs58.encode(
          nacl.sign.detached(
            new TextEncoder().encode(c),
            bs58.decode(fromSecret.trim())
          )
        );
        setSignature(sig);
        // local signature verification (if pubkey provided)
        if (pubkey && pubkey.trim().length > 0) {
          const ok = nacl.sign.detached.verify(
            new TextEncoder().encode(c),
            bs58.decode(sig),
            bs58.decode(pubkey.trim())
          );
          setSteps((s) => ({ ...s, signature: !!ok }));
        } else {
          setSteps((s) => ({ ...s, signature: !!sig }));
        }
      }

      const body = {
        canonical_body: c,
        from_sig: sig || undefined,
        from_pubkey: pubkey || undefined,
      };

      const res = await api("/payments/submit", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setServerResponse(res);
      setSteps((s) => ({ ...s, api: true }));
    } catch (err) {
      setServerResponse({ error: err?.message || String(err) });
      setSteps((s) => ({ ...s, api: false }));
    } finally {
      setBusy(false);
    }
  };

  // Generate example JSON for the selected mode
  const loadExample = (which) => {
    if (which === "registration") {
      const example = {
        name: "John Doe",
        email: "john@doe.com",
        pubkey: "<BASE58_PUBKEY>",
      };
      setRawInput(pretty(JSON.stringify(example)));
      setMode("registration");
      setSignature("");
      setServerResponse(null);
      setSteps({ json: null, canonical: null, signature: null, api: null });
      setPubkey("");
      setSecretKey("");
    } else {
      const example = {
        from: "wallet_12345",
        to: "wallet_98765",
        amount_micros: 1500000,
        nonce: generateNonce(),
        timestamp: new Date().toISOString(),
        ref: "por:demo",
      };
      setRawInput(pretty(JSON.stringify(example)));
      setMode("payment");
      setSignature("");
      setServerResponse(null);
      setSteps({ json: null, canonical: null, signature: null, api: null });
    }
  };

  // Replace nonce in JSON with new generated nonce
  const generateNewNonce = () => {
    try {
      const parsed = JSON.parse(rawInput);
      parsed.nonce = generateNonce();
      setRawInput(pretty(JSON.stringify(parsed)));
    } catch {
      alert("Invalid JSON — cannot update nonce");
    }
  };

  // helper to render PASS/FAIL
  const renderStatus = (val) => {
    if (val === null) return <span className="text-gray-500">—</span>;
    return val ? (
      <span className="text-green-600 font-medium">PASS</span>
    ) : (
      <span className="text-red-600 font-medium">FAIL</span>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Deterministic Debug View</h1>

      <div className="flex items-center gap-3">
        <button
          onClick={() => loadExample("payment")}
          className={`px-3 py-1 rounded border ${
            mode === "payment" ? "bg-gray-100" : ""
          }`}
        >
          Payment Example
        </button>
        <button
          onClick={() => loadExample("registration")}
          className={`px-3 py-1 rounded border ${
            mode === "registration" ? "bg-gray-100" : ""
          }`}
        >
          Wallet Registration Example
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center gap-5 mb-2">
            <label className="block text-sm font-medium mb-1">
              Raw JSON input
            </label>

            <div className="flex items-center gap-2">
              {mode === "payment" ? (
                <button
                  onClick={generateNewNonce}
                  className="px-3 py-1 rounded border bg-white"
                >
                  Generate New Nonce
                </button>
              ) : (
                // registration mode -> show generate keypair
                <button
                  onClick={generateKeypair}
                  className="px-3 py-1 rounded border bg-white"
                >
                  Generate Keypair
                </button>
              )}
            </div>
          </div>

          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={14}
            className="w-full border rounded p-2 font-mono text-sm"
          />

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mode === "payment" && (
              <>
                <div>
                  <label className="block text-xs">
                    From Pubkey (for payment signature)
                  </label>
                  <input
                    value={pubkey}
                    onChange={(e) => setPubkey(e.target.value)}
                    className="w-full p-2 border rounded font-mono text-xs"
                    placeholder="<BASE58_PUBKEY>"
                  />
                </div>
                <div>
                  <label className="block text-xs">
                    From Secret (for payment signature)
                  </label>
                  <input
                    value={fromSecret}
                    onChange={(e) => setFromSecret(e.target.value)}
                    className="w-full p-2 border rounded font-mono text-xs"
                    placeholder="<BASE58_SECRET>"
                  />
                </div>
              </>
            )}
          </div>
          {mode === "registration" && (
            <div className="p-3 border rounded bg-white">
              <div className="text-sm font-medium">
                Generated Secret Key (show once)
              </div>
              <div className="mt-2 font-mono text-xs break-all bg-gray-50 p-2 rounded">
                {secretKey || "(not generated yet)"}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Keep this secret safe — it will not be shown again after
                refresh.
              </div>
            </div>
          )}
          <div className="my-3 flex flex-wrap gap-2">
            {/* <button
              onClick={compareDeterminism}
              className="px-3 py-2 rounded border"
              disabled={busy}
            >
              Compare Determinism
            </button> */}

            {mode === "payment" ? (
              <>
                <button
                  onClick={handleSign}
                  className="px-3 py-2 rounded border bg-white"
                  disabled={busy}
                >
                  Sign (if secret provided)
                </button>
                <button
                  onClick={callPaymentsSubmit}
                  className="px-3 py-2 rounded border bg-white"
                  disabled={busy}
                >
                  Call /payments/submit
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={validateSignature}
                  className="px-3 py-2 rounded border bg-white"
                >
                  Validate Signature
                </button>
                <button
                  onClick={callWalletCreate}
                  className="px-3 py-2 rounded border bg-white"
                >
                  Call /wallets/create
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Canonical JSON output
            </label>
            <pre className="w-full h-56 overflow-auto bg-gray-50 p-3 border rounded font-mono text-sm whitespace-pre-wrap">
              {canonical}
            </pre>
          </div>

          <div className="p-3 border rounded bg-white">
            <h3 className="font-semibold mb-2">
              Deterministic result (stepwise)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <div>JSON input valid</div>
                <div>{renderStatus(steps.json)}</div>
              </div>
              <div className="flex justify-between">
                <div>Canonical available</div>
                <div>{renderStatus(steps.canonical)}</div>
              </div>
              <div className="flex justify-between">
                <div>Signature valid</div>
                <div>{renderStatus(steps.signature)}</div>
              </div>
              <div className="flex justify-between">
                <div>API result</div>
                <div>{renderStatus(steps.api)}</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Server response / details
            </label>
            <pre className="w-full overflow-auto p-3 border rounded bg-white font-mono text-sm">
              {serverResponse
                ? JSON.stringify(serverResponse, null, 2)
                : "No response yet"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
