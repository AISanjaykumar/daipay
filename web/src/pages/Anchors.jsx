import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Anchors() {
  const [items, setItems] = useState([]);
  const [fromHeight, setFromHeight] = useState("");
  const [toHeight, setToHeight] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await api("/anchors");
    setItems(data.items || []);
  }

  async function run() {
    try {
      setLoading(true);
      const body = {};
      if (fromHeight) body.fromHeight = Number(fromHeight);
      if (toHeight) body.toHeight = Number(toHeight);
      const out = await api("/anchors/run", {
        method: "POST",
        body: JSON.stringify(body),
      });
      alert("✅ Anchor created: " + JSON.stringify(out));
      load();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create anchor. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full bg-white md:px-6">
        <h2 className="text-2xl font-semibold text-gray-800 my-6 text-center">
          🌐 Anchor Management
        </h2>

        {/* Create Anchor Section */}
        <div className="border border-gray-200 rounded-xl p-6 mb-10 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Create New Anchor
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
            <input
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="From Height (optional)"
              value={fromHeight}
              onChange={(e) => setFromHeight(e.target.value)}
            />
            <input
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="To Height (optional)"
              value={toHeight}
              onChange={(e) => setToHeight(e.target.value)}
            />
          </div>

          <button
            onClick={run}
            disabled={loading}
            className={`mt-5 w-full md:w-fit px-6 py-3 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Anchoring..." : "Run Anchoring"}
          </button>
        </div>

        {/* Recent Anchors List */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Anchors
        </h3>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No anchors found. Run one to get started.
          </p>
        ) : (
          <div
            style={{
              overflowY: "scroll",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // Internet Explorer and Edge
            }}
            className="space-y-4 max-h-[400px] overflow-y-auto"
          >
            {items.map((a) => (
              <div
                key={a.anchor_id}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:shadow-md transition relative overflow-auto"
              >
                <span className="px-3 absolute drop-shadow-sm top-3 right-4 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  {a.chain}
                </span>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    <b>ID:</b>{" "}
                    <code className="text-blue-600 break-all">
                      {a.anchor_id}
                    </code>
                  </div>
                </div>

                <div className="text-sm text-gray-700 mt-2">
                  <b>Range:</b> {a.block_height_from} → {a.block_height_to}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <b>Merkle Root:</b>{" "}
                  <code className="break-all text-gray-600">
                    {a.merkle_root}
                  </code>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <b>TX:</b>{" "}
                  <code className="break-all text-gray-600">{a.tx_hash}</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
