import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client.js";
import toast from "react-hot-toast";

export default function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;

  async function load() {
    try {
      setLoading(true);
      const data = await api(`/blocks?page=${page}&limit=${limit}`);
      if (data.success) {
        setBlocks(data.items || []);
        setTotal(data.total || 0);
      } else {
        toast.error("Failed to load blocks");
      }
    } catch (err) {
      console.error("Failed to load blocks:", err);
      toast.error("Error loading blocks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div className="min-h-[80dvh] p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl p-6 "
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            📦 Blockchain Blocks
          </h2>
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Block List */}
        {loading ? (
          <div className="text-center text-gray-500 py-10 animate-pulse">
            Loading blocks...
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No blocks available.
          </div>
        ) : (
          <div
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="space-y-4 max-h-[500px] overflow-y-auto"
          >
            {blocks.map((b) => (
              <motion.div
                key={b.height}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
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
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {blocks.length > 0 && (
          <motion.div
            className="flex justify-center mt-6 gap-3 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600 flex items-center">
              Page {page} / {Math.ceil(total / limit) || 1}
            </span>
            <button
              onClick={() =>
                setPage((p) => (p < Math.ceil(total / limit) ? p + 1 : p))
              }
              disabled={page >= Math.ceil(total / limit)}
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
