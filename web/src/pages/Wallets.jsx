import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";

import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Wallets() {
  const { user } = useAuth(); // get user from context
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false); // wallet creation
  const [fundLoading, setFundLoading] = useState(false); // add funds
  const [showFundModal, setShowFundModal] = useState(false);
  const [amount, setAmount] = useState("");

  async function load() {
    const data = await api("/wallets");
    setWallets(data.items || []);
  }

  async function create() {
    try {
      setLoading(true);
      const out = await api("/wallets", {
        method: "POST",
        body: JSON.stringify({ type: "create", userId: user._id }),
      });
      toast.success("✅ Wallet created.");
      await load();
    } catch (err) {
      console.error("Error creating wallet:", err);
      toast.error("Failed to create wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function addFunds() {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      setFundLoading(true);
      const res = await api("/wallets", {
        method: "POST",
        body: JSON.stringify({
          userId: user._id,
          amount: Number(amount),
          type: "credit",
        }),
      });

      if (res.success) {
        toast.success("💸 Funds added successfully!");
        setShowFundModal(false);
        setAmount("");
        await load();
      } else {
        toast.error("Failed to add funds.");
      }
    } catch (err) {
      console.error("Add funds error:", err);
      toast.error("Something went wrong while adding funds.");
    } finally {
      setFundLoading(false);
    }
  }

  useEffect(() => {
    if (user?.wallet?.active) load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 text-lg">
        Please log in to access your wallet.
      </div>
    );
  }

  return (
    <div className="min-h-[70dvh] bg-gradient-to-br p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        💰 Wallets
      </h2>

      {!user.wallet.active ? (
        // Wallet inactive → show create button
        <div className="flex flex-col mx-auto items-center space-y-4 bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-800">
            You don’t have an active wallet yet.
          </h3>
          <p className="text-gray-500 text-sm text-center">
            Create your first wallet to start transactions.
          </p>

          <div className="w-full space-y-2">
            <button
              onClick={create}
              disabled={loading}
              className={`w-full py-2 font-semibold rounded-lg transition-all hover:cursor-pointer ${
                loading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {loading
                ? "⏳ Creating Wallet..."
                : "Create Wallet (with Faucet)"}
            </button>
          </div>
        </div>
      ) : (
        // Wallet active → show transactions list
        <div className="w-full mx-auto max-w-3xl bg-white shadow-xl rounded-xl p-8 relative">
          <div className="py-4 flex justify-between items-center border-b-2 mb-4">
            <div>
              <span>Balance: </span>
              <span className="font-mono font-bold text-lg">
                {user.wallet.amount} μDAI
              </span>
            </div>
            <div>
              <button
                onClick={() => {
                  toast("This feature is not available at this moment.");
                  // setShowFundModal(true);
                }}
                className="flex gap-2 items-center hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 text-indigo-600 font-semibold transition"
              >
                <FaPlus />
                <span>Add Funds</span>
              </button>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">History</h3>
          <div
            className="space-y-4 max-h-[400px] overflow-y-auto px-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {wallets.length === 0 && (
              <p className="text-gray-600">No wallets found.</p>
            )}

            {wallets.map((w) => (
              <div
                key={w.wallet_id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                <div>
                  <b>🪪 Wallet ID:</b>
                  <p className="break-all text-sm">{w.wallet_id}</p>
                </div>
                <div>
                  <b>🔑 Public Key:</b>
                  <p className="break-all text-sm">{w.pubkey}</p>
                </div>
                <div>
                  <b>💵 Balance:</b> {w.balance_micros} μDAI
                </div>
              </div>
            ))}
          </div>

          {/* 💸 Add Funds Modal */}
          {showFundModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-40 z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Add Funds
                </h3>

                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount (μDAI)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowFundModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                    disabled={fundLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addFunds}
                    disabled={fundLoading}
                    className={`px-4 py-2 rounded-lg text-white font-semibold ${
                      fundLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {fundLoading ? "⏳ Adding..." : "Add Funds"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
