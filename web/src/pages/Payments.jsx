import { useState } from "react";
import { api } from "../api/client.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

function canonical(obj) {
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = obj[k];
        return acc;
      }, {})
  );
}

export default function Payments() {
  const [fromPub, setFromPub] = useState("");
  const [fromSecret, setFromSecret] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(100000);
  const [nonce, setNonce] = useState(
    "n-" + Math.random().toString(36).slice(2)
  );
  const [ref, setRef] = useState("por:demo");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      setStatus("");

      const body = {
        from,
        to,
        amount_micros: Number(amount),
        nonce,
        timestamp: new Date().toISOString(),
        ref,
      };

      const c = canonical(body);
      const sig = bs58.encode(
        nacl.sign.detached(new TextEncoder().encode(c), bs58.decode(fromSecret))
      );

      const out = await api("/payments/submit", {
        method: "POST",
        body: JSON.stringify({
          canonical_body: c,
          from_sig: sig,
          from_pubkey: fromPub,
        }),
      });

      setStatus(`✅ Payment Accepted! Pox ID: ${out.pox_id}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Payment Failed. Check your details or try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-6">
      <div className="w-full flex-1 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          💸 Send Deterministic Payment
        </h2>

        <div className="flex flex-col gap-4 w-full">
          <input
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="From Wallet ID"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="From Public Key (base58)"
            value={fromPub}
            onChange={(e) => setFromPub(e.target.value)}
          />
          <input
            type="password"
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="From Secret Key (base64)"
            value={fromSecret}
            onChange={(e) => setFromSecret(e.target.value)}
          />
          <input
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="To Wallet ID"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <input
            type="number"
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Amount (μDAI)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nonce"
            value={nonce}
            onChange={(e) => setNonce(e.target.value)}
          />
          <input
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ref (optional)"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />

          <button
            onClick={submit}
            disabled={loading}
            className={`mt-3 p-3 w-full rounded-lg text-white font-medium transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Submit Payment"}
          </button>

          {status && (
            <div
              className={`mt-3 h-fit font-medium break-words whitespace-pre-wrap w-full max-w-full ${
                status.startsWith("✅")
                  ? "text-green-600"
                  : status.startsWith("❌")
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {status}
            </div>
          )}
        </div>

        <p className="mt-6 text-sm text-gray-500 text-center">
          ⚠️ <b>Security Note:</b> Client-side secrets are for{" "}
          <span className="text-red-500">development only</span>. Use a secure
          signer in production.
        </p>
      </div>
    </div>
  );
}
