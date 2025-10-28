import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await api("/blocks");
      setBlocks(data.items || []);
    } catch (err) {
      console.error("Failed to load blocks:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full  bg-white p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">📦 Blocks</h2>
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-10">
            Loading blocks...
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No blocks available.
          </div>
        ) : (
          <div
            style={{
              overflowY: "scroll",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // Internet Explorer and Edge
            }}
            className="space-y-4 max-h-[500px] overflow-y-auto"
          >
            {blocks.map((b) => (
              <div
                key={b.height}
                className="border border-gray-200 bg-gray-50 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-gray-800 font-medium">
                    <b>Height:</b> {b.height}
                  </div>
                  <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {b.receipt_ids?.length || 0} Receipts
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  <b>Root:</b>{" "}
                  <code className="text-gray-600 break-all">{b.root}</code>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <b>Prev:</b>{" "}
                  <code className="text-gray-600 break-all">{b.prev_root}</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
