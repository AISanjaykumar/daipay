import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Escrows() {
  const [items, setItems] = useState([]);
  const [payer, setPayer] = useState("");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState(100000);
  const [prefix, setPrefix] = useState("por:");
  const [escrowId, setEscrowId] = useState("");
  const [releaseAmount, setReleaseAmount] = useState(50000);
  const [evidence, setEvidence] = useState("por:demo");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function load() {
    const data = await api("/escrows");
    setItems(data.items || []);
  }

  async function create() {
    try {
      setLoading(true);
      setStatus("");
      const body = {
        payer,
        payee,
        amount_micros: Number(amount),
        conditions: {
          type: "any_of_proofs",
          count: 1,
          ref_prefix: prefix,
        },
      };
      const out = await api("/escrows/create", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setEscrowId(out.escrow_id);
      setStatus(`✅ Escrow created successfully: ${out.escrow_id}`);
      load();
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to create escrow. Check your inputs.");
    } finally {
      setLoading(false);
    }
  }

  async function release() {
    try {
      setLoading(true);
      setStatus("");
      const out = await api("/escrows/release", {
        method: "POST",
        body: JSON.stringify({
          escrow_id: escrowId,
          evidence_ref: evidence,
          amount_micros: Number(releaseAmount),
        }),
      });
      alert("✅ Funds Released: " + JSON.stringify(out));
      setStatus("✅ Funds released successfully.");
      load();
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to release funds.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen h-full  flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          🤝 Escrow Management
        </h2>

        {/* Create Escrow */}
        <div className="border drop-shadow-md border-gray-200 rounded-xl p-6 mb-10 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Create Escrow
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Payer Wallet ID"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
            />
            <input
              className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Payee Wallet ID"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
            />
            <input
              type="number"
              className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Amount (μDAI)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Ref Prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
            />
          </div>
          <button
            onClick={create}
            disabled={loading}
            className={`mt-5 px-6 py-3 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating..." : "Create Escrow"}
          </button>
          {escrowId && (
            <div className="mt-3 text-sm text-gray-700">
              New Escrow ID:{" "}
              <p className="text-blue-600 h-fit break-words whitespace-pre-wrap w-full max-w-full">
                {escrowId}
              </p>
            </div>
          )}
        </div>

        {/* Release Escrow */}
        <div className="border drop-shadow-md  border-gray-200 rounded-xl p-6 mb-10 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Release Funds
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 w-full">
            <input
              className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Escrow ID"
              value={escrowId}
              onChange={(e) => setEscrowId(e.target.value)}
            />
            <input
              className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Evidence Ref"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
            <input
              type="number"
              className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Release Amount (μDAI)"
              value={releaseAmount}
              onChange={(e) => setReleaseAmount(e.target.value)}
            />
          </div>
          <button
            onClick={release}
            disabled={loading}
            className={`mt-5 px-6 py-3 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Releasing..." : "Release Funds"}
          </button>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`mt-3 mb-8 h-fit font-medium break-words whitespace-pre-wrap w-full max-w-full ${
              status.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {status}
          </div>
        )}

        {/* Existing Escrows */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Existing Escrows
        </h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No escrows found. Create one to get started.
          </p>
        ) : (
          <div
            style={{
              overflowY: "scroll",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // Internet Explorer and Edge
            }}
            className="space-y-4 py-2 bg-none max-h-[500px] overflow-y-auto"
          >
            {items.map((e) => (
              <div
                key={e.escrow_id}
                className="border drop-shadow-md border-gray-200 bg-gray-50 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700 w-full max-w-full">
                    <b>ID:</b>{" "}
                    <p className="text-blue-600  h-fit break-words whitespace-pre-wrap w-full max-w-full">
                      {e.escrow_id}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs drop-shadow-sm rounded-full absolute right-4 top-2 ${
                      e.state === "released"
                        ? "bg-green-100 text-green-700"
                        : e.state === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {e.state}
                  </span>
                </div>

                <div className="text-sm text-gray-700 mt-2">
                  <b>Payer:</b>{" "}
                  <p className="h-fit break-words whitespace-pre-wrap w-full max-w-full">
                    {e.payer}
                  </p>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <b>Payee:</b>{" "}
                  <p className="h-fit break-words whitespace-pre-wrap w-full max-w-full">
                    {e.payee}
                  </p>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <b>Balance:</b> {e.balance_micros} μDAI
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <b>Conditions:</b> {e.conditions?.type} / prefix{" "}
                  {e.conditions?.ref_prefix}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
