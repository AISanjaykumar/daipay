import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowDown, FaArrowUp, FaCopy } from "react-icons/fa6";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Wallets() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const limit = 10;
  const wallet = user?.wallet;

  // 🧩 Load transactions
  async function loadTransactions() {
    if (!wallet?.wallet_id) return;
    try {
      setLoading(true);
      const res = await api(`/transactions/${wallet.wallet_id}?page=${page}&limit=${limit}`);
      if (res.success) {
        setTransactions(res.transactions || []);
        setTotal(res.total || 0);
      } else toast.error("Failed to load transactions");
    } catch (err) {
      console.error(err);
      toast.error("Error loading transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, [user?.wallet_id]);

  useEffect(() => {
    loadTransactions();
  }, [user, page]);

  // 🔒 Helpers
  const maskKey = (key = "") => (key.length > 12 ? `${key.slice(0, 6)}***${key.slice(-4)}` : key);
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Please log in to access your wallet.
      </div>
    );

  return (
    <div className="min-h-[80dvh] bg-gradient-to-br from-white via-indigo-50 to-white p-6 sm:p-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Wallet Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 flex justify-center items-center gap-2">
            🪙 My DAIpay Wallet
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your balance and view all recent transactions.
          </p>
        </div>

        {/* Wallet Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 bg-white p-5 rounded-xl drop-shadow-lg sm:grid-cols-2 gap-5 mb-8"
        >
          {/* Wallet ID */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <h4 className="text-gray-600 text-sm font-semibold mb-2">🆔 Wallet ID</h4>
            <div className="flex items-center justify-between">
              <span className="font-mono text-gray-800">{maskKey(wallet.wallet_id)}</span>
              <button
                onClick={() => copyToClipboard(wallet.wallet_id, "Wallet ID")}
                className="p-1 rounded hover:bg-indigo-100"
              >
                <FaCopy className="text-indigo-600 text-sm" />
              </button>
            </div>
          </div>

          {/* Public Key */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <h4 className="text-gray-600 text-sm font-semibold mb-2">🔑 Public Key</h4>
            <div className="flex items-center justify-between">
              <span className="font-mono text-gray-800">{maskKey(wallet.pubkey)}</span>
              <button
                onClick={() => copyToClipboard(wallet.pubkey, "Public Key")}
                className="p-1 rounded hover:bg-indigo-100"
              >
                <FaCopy className="text-indigo-600 text-sm" />
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 sm:col-span-2">
            <h4 className="text-gray-600 text-sm text-center font-semibold mb-2">💰 Balance</h4>
            <motion.div
              key={wallet.balance_micros}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center"
            >
              <p className="text-3xl font-bold text-green-600">
                {(wallet.balance_micros / 1_000_000).toFixed(3)} DAI
              </p>
              <p className="text-xs text-gray-600 mt-1">
                ({wallet.balance_micros} μDAI)
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Transactions Section */}
        <div className="border-t border-gray-200 pt-6 bg-none px-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📜 Transaction History
          </h3>

          <div
            className="max-h-[400px] flex flex-col py-2 overflow-y-auto space-y-3"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading ? (
              <p className="text-gray-500 text-center py-6 animate-pulse">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No transactions yet.</p>
            ) : (
              <AnimatePresence>
                {transactions.map((tx) => (
                  <motion.div
                    key={tx._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="border border-gray-200 bg-white rounded-lg p-4 drop-shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center"
                  >
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      {tx.type === "credit" ? (
                        <FaArrowDown className="text-green-500 text-lg" />
                      ) : (
                        <FaArrowUp className="text-red-500 text-lg" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800 capitalize">{tx.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-semibold text-right ${
                        tx.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {(tx.amount_micros / 1_000_000).toFixed(3)} DAI
                      <div className="text-xs text-gray-500">
                        ({tx.amount_micros.toLocaleString()} μDAI)
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Pagination */}
        {transactions.length > 0 && (
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
