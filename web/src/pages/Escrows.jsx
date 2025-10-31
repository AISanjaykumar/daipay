"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { FaCopy, FaArrowDown } from "react-icons/fa6";

export default function Escrows() {
  const [items, setItems] = useState([]);
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState(100000);
  const [prefix, setPrefix] = useState("por:");
  const [escrowId, setEscrowId] = useState("");
  const [releaseAmount, setReleaseAmount] = useState(50000);
  const [evidence, setEvidence] = useState("por:demo");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user, refreshUser } = useAuth();

  async function load(pageNum = 1, append = false) {
    if (!user?.wallet?.wallet_id) return;
    try {
      const data = await api("/escrows/my", {
        method: "POST",
        body: JSON.stringify({
          wallet_id: user.wallet.wallet_id,
          page: pageNum,
          limit: 10,
        }),
      });
      if (!data?.items) return;
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setHasMore(data.items.length === 10);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load escrows");
    }
  }

  async function create() {
    if (!user?.wallet?.wallet_id)
      return toast.error("You must be logged in with a valid wallet.");
    if (!payee || !amount) return toast.error("Please fill all fields.");

    try {
      setLoading(true);
      setStatus("");
      const body = {
        payer: user.wallet.wallet_id,
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
      toast.success("Escrow created successfully!");
      setStatus(`✅ Escrow created successfully: ${out.escrow_id}`);
      load(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create escrow");
      setStatus("❌ Failed to create escrow. Check your inputs.");
    } finally {
      setLoading(false);
    }
  }

  async function release() {
    if (!escrowId || !releaseAmount)
      return toast.error("Enter Escrow ID and amount.");
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
      toast.success("Funds released successfully!");
      setStatus("✅ Funds released successfully.");
      refreshUser();
      load(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to release funds");
      setStatus("❌ Failed to release funds.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    toast.success("Escrow ID copied!");
  }

  useEffect(() => {
    if (user) load(1);
  }, [user]);

  return (
    <div className="w-full min-h-screen flex justify-center items-start bg-gradient-to-br from-white via-emerald-50 to-white px-3 sm:px-6 p-6 rounded-lg">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl md:p-6 p-3"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-5">
          🤝 My Escrows
        </h2>

        {/* Create + Release Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Create Escrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-gray-200 rounded-2xl p-6 bg-gray-50 flex flex-col justify-between drop-shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Create Escrow
            </h3>
            <div className="grid grid-cols-1 gap-4">
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
                placeholder="Ref Prefix (e.g., por:)"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={create}
              disabled={loading}
              className={`mt-5 w-full px-6 py-3 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md"
              }`}
            >
              {loading ? "Creating..." : "Create Escrow"}
            </motion.button>
          </motion.div>

          {/* Release Escrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-gray-200 rounded-2xl p-6 bg-gray-50 flex flex-col justify-between drop-shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Release Funds
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <input
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                placeholder="Escrow ID"
                value={escrowId}
                onChange={(e) => setEscrowId(e.target.value)}
              />
              <input
                type="number"
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                placeholder="Release Amount (μDAI)"
                value={releaseAmount}
                onChange={(e) => setReleaseAmount(e.target.value)}
              />
              <input
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                placeholder="Evidence Ref"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={release}
              disabled={loading}
              className={`mt-5 w-full px-6 py-3 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-md"
              }`}
            >
              {loading ? "Releasing..." : "Release Funds"}
            </motion.button>
          </motion.div>
        </div>

        {/* Status */}
        {status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-3 mb-8 font-medium text-left break-words whitespace-normal ${
              status.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {status}
          </motion.div>
        )}

        {/* Escrow List */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          My Escrow History
        </h3>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No escrows found for your account.
          </p>
        ) : (
          <>
            <div className="space-y-5 max-h-[500px] overflow-y-auto relative scrollbar-hide py-5">
              <AnimatePresence>
                {items.map((e) => (
                  <motion.div
                    key={e.escrow_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="border border-gray-200 bg-white rounded-xl p-4 drop-shadow-md transition relative"
                  >
                    <div className="flex justify-between flex-wrap items-start gap-2">
                      <div className="flex items-center gap-2 break-all max-w-full">
                        <p className="text-sm text-gray-700 truncate">
                          <b>Escrow ID:</b>{" "}
                          <span className="text-blue-600 break-all">
                            {e.escrow_id}
                          </span>
                        </p>
                        <button
                          onClick={() => copyToClipboard(e.escrow_id)}
                          className="text-gray-500 hover:text-blue-600 transition"
                        >
                          <FaCopy size={14} />
                        </button>
                      </div>
                      <span
                        className={`absolute border -top-4 right-4 px-3 py-1 text-xs rounded-full ${
                          e.state === "exhausted"
                            ? "bg-green-100 text-green-700"
                            : e.state === "active"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {e.state}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 mt-2 break-all">
                      <b>Payer:</b> {e.payer}
                    </div>
                    <div className="text-sm text-gray-700 mt-1 break-all">
                      <b>Payee:</b> {e.payee}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <b>Balance:</b> {e.balance_micros} μDAI
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <b>Prefix:</b> {e.conditions?.ref_prefix}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {hasMore && (
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex justify-center mt-6"
              >
                <button
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    load(nextPage, true);
                  }}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg flex items-center gap-2 shadow-md"
                >
                  <FaArrowDown size={14} />
                  Load More
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
