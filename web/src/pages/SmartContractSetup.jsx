import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaUserCheck, FaCogs, FaRocket, FaBolt } from "react-icons/fa";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SmartContractPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [template, setTemplate] = useState("escrow");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [trigger, setTrigger] = useState("approval");
  const [deployDate, setDeployDate] = useState("");
  const [deployTime, setDeployTime] = useState("");
  const [summary, setSummary] = useState("");
  const [step, setStep] = useState("form");
  const [contractHash, setContractHash] = useState("");
  const [signature, setSignature] = useState("");
  const [deploying, setDeploying] = useState(false);

  // Load contracts
  useEffect(() => {
    loadContracts();
  }, []);

  async function loadContracts() {
    try {
      setLoading(true);
      const data = await api("/contracts");
      setContracts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const generateSummary = () => {
    const base = `Release $${amount || "?"} from ${
      user.wallet.wallet_id || "sender"
    } to ${receiver || "receiver"}`;
    let rule = "";
    if (template === "escrow") rule = ` when both parties confirm delivery.`;
    if (template === "scheduled") rule = ` after ${trigger}.`;
    if (template === "reward")
      rule = ` once the task is completed and approved.`;
    setSummary(base + rule);
  };

  async function toSHA256Hex(text) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Create Contract
  async function handleCreateContract() {
    if (!receiver || !amount) return alert("All fields required");

    if (!summary) generateSummary();
    const payload = {
      template,
      sender: user.wallet.wallet_id,
      receiver,
      amount: Number(amount),
      trigger,
      summary,
    };
    const hash = await toSHA256Hex(JSON.stringify(payload));
    setContractHash(hash);
    payload.contractHash = hash;

    try {
      setCreating(true);
      await api("/contracts/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setReceiver("");
      setAmount("");
      setTrigger("approval");
      loadContracts();
    } catch (err) {
      console.error(err);
      alert("Error creating contract");
    } finally {
      setCreating(false);
    }
  }

  // Deploy Contract (for user approval trigger)
  async function handleDeploy(contractHash) {
    try {
      await api("/contracts/deploy", {
        method: "POST",
        body: JSON.stringify({ contractHash }),
      });
      loadContracts();
    } catch (err) {
      console.error(err);
    }
  }

  // 24hr countdown helper
  const timeLeft = (createdAt) => {
    const diff =
      24 * 60 * 60 * 1000 - (Date.now() - new Date(createdAt).getTime());
    if (diff <= 0) return "Ready";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m left`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      {/* 🧾 Create Contract Form */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full rounded-2xl shadow-xl p-6 relative"
      >
        {/* Smart Contract Form */}
        <div>
          <h2 className="text-xl font-semibold text-center text-amber-600 mb-5">
            Create Smart Contract
          </h2>

          <div className="flex flex-col gap-4">
            {/* Template */}
            <div>
              <label className="font-semibold block mb-1">Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="escrow">Escrow</option>
                <option value="scheduled">Schedule Based</option>
              </select>
            </div>

            {/* Receiver */}
            <div>
              <label className="font-semibold block mb-1">
                Receiver Wallet ID
              </label>
              <input
                placeholder="Receiver Wallet ID"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Amount */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 sm:col-span-2">
              <h4 className="text-gray-600 text-sm text-center font-semibold mb-2">
                💰 Amount
              </h4>
              <motion.div
                key={user.wallet.balance_micros}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center"
              >
                <div className="flex flex-col gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    min={0}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-none outline-none bg-white rounded-lg p-2 text-center w-fit"
                  />
                  <span className="text-3xl font-bold text-green-600 ">
                    μDAI
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Trigger or Date/Time */}
            {template === "escrow" ? (
              <div className="sm:col-span-2">
                <label className="block mb-1">Trigger Event</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="approval">User Approval</option>
                  <option value="24h">24h Timer</option>
                  <option value="auto">Auto Condition</option>
                </select>
              </div>
            ) : (
              <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Deploy Date</label>
                  <input
                    type="date"
                    value={deployDate}
                    onChange={(e) => setDeployDate(e.target.value)}
                    className="border rounded-lg p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Deploy Time</label>
                  <input
                    type="time"
                    value={deployTime}
                    onChange={(e) => setDeployTime(e.target.value)}
                    className="border rounded-lg p-2 w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleCreateContract}
              disabled={!receiver || !amount}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 w-full"
            >
              {deploying ? "Creating..." : "Create Contract"}
            </button>
          </div>
        </div>

        {/* Signed confirmation */}
        {step === "signed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-3 text-green-700 mt-6"
          >
            <FaCheckCircle className="mx-auto text-2xl" />
            <p>Contract created successfully.</p>
            <p className="text-xs text-gray-700">
              Signature:{" "}
              <code className="bg-green-50 px-2 py-1 rounded">{signature}</code>
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* 📜 Smart Contract History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white shadow-md rounded-2xl border border-gray-200 p-6"
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Smart Contract History
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center py-6">Loading contracts...</p>
        ) : contracts.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No smart contracts yet.
          </p>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {contracts.map((ctr) => (
                <motion.div
                  key={ctr._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`border border-gray-200 rounded-xl p-5 bg-white hover:bg-gradient-to-br from-white  to-white drop-shadow-lg transition-all ${
                    ctr.template === "escrow"
                      ? "via-amber-50/50"
                      : "via-blue-50/60"
                  }`}
                >
                  <div className="flex flex-col md:justify-between gap-3 w-full">
                    <div className="w-full">
                      <div className="flex items-center gap-2 w-full relative">
                        <p
                          className={`px-3 py-1 rounded-md drop-shadow-md text-xs font-semibold ${
                            ctr.template === "escrow"
                              ? "bg-white text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          Contract Type :{" "}
                          <span className="font-bold">
                            {ctr.template.toUpperCase()}
                          </span>
                        </p>
                        <span
                          className={`px-3 py-1 absolute drop-shadow-md capitalize right-4 rounded-full text-xs font-semibold ${
                            ctr.status === "deployed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {ctr.status || "Pending"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 break-words whitespace-pre-wrap w-full">
                        <strong>Sender:</strong> {ctr.sender}
                      </p>
                      <p className="text-sm text-gray-700 break-words whitespace-pre-wrap w-full">
                        <strong>Receiver:</strong> {ctr.receiver}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 break-all">
                        Hash: <code>{ctr.contractHash}</code>
                      </p>
                    </div>

                    {/* Trigger Logic Buttons */}
                    <div className="text-right space-y-2">
                      {ctr.trigger === "approval" &&
                        ctr.status !== "deployed" && (
                          <button
                            onClick={() => handleDeploy(ctr.contractHash)}
                            className="bg-emerald-400 hover:drop-shadow-md hover:scale-105 hover:bg-emerald-500 text-white px-4 py-1 rounded-lg text-sm"
                          >
                            Deploy
                          </button>
                        )}
                      {ctr.trigger === "24h" && (
                        <span className="flex items-center gap-1 text-amber-700 text-sm justify-end">
                          <FaClock /> {timeLeft(ctr.createdAt)}
                        </span>
                      )}
                      {ctr.trigger === "auto" && (
                        <span className="flex items-center gap-1 text-gray-600 text-sm justify-end">
                          <FaCogs /> Auto Deploy
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
