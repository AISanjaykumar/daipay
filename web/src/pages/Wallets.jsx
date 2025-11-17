import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import toast from "react-hot-toast";
import { genKeypair } from "../utils/genKeypair.js";
import SecretPopup from "../components/SecretPopup.jsx";
import ActiveWallet from "../components/ActiveWallet.jsx";

export default function Wallets() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  async function create() {
    if (!user) return;
    if (user.isActiveWallet) return toast.error("You already have a wallet.");

    const kp = genKeypair();
    setSecretKey(kp.secret);

    try {
      setLoading(true);
      const out = await api("/wallets/create", {
        method: "POST",
        body: JSON.stringify({
          pubkey: kp.pubkey,
          email: user.email,
          name: user.name,
        }),
      });
      toast.success("✅ Wallet created.");
      setShowPopup(true);
    } catch (err) {
      console.error("Error creating wallet:", err);
      toast.error("Failed to create wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleClosePopup = async () => {
    await refreshUser();
    setSecretKey("");
    setShowPopup(false);
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
        {user.isActiveWallet ? (
          <ActiveWallet wallet={user.wallet} />
        ) : (
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
                {loading ? "⏳ Creating Wallet..." : "Create Wallet"}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {showPopup && (
        <SecretPopup
          user={user}
          secretKey={secretKey}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
