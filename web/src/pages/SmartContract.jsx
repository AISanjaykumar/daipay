import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaCogs } from "react-icons/fa";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SmartContract() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [template, setTemplate] = useState("escrow");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [trigger, setTrigger] = useState("approval");
  const [deployDate, setDeployDate] = useState("");
  const [deployTime, setDeployTime] = useState("");
  const [step, setStep] = useState("form");
  const [contractHash, setContractHash] = useState("");
  const [signature, setSignature] = useState("");
  const [deploying, setDeploying] = useState(false);

  // Load contracts on mount
  useEffect(() => {
    loadContracts();
  }, []);

  async function loadContracts() {
    try {
      setLoading(true);
      const data = await api("/contracts");
      setContracts(data);
    } catch (err) {
      console.error("Error loading contracts:", err);
    } finally {
      setLoading(false);
    }
  }

  function generateSummaryData() {
    const base = `Release $${amount || "?"} from ${
      user?.wallet?.wallet_id || "sender"
    } to ${receiver || "receiver"}`;
    if (template === "escrow") return base + " when both parties confirm delivery.";
    if (template === "scheduled")
      return base + " on scheduled date and time.";
    return base;
  }

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

    const summary = generateSummaryData();
    const payload = {
      template,
      sender: user.wallet.wallet_id,
      receiver,
      amount: Number(amount),
      trigger,
      summary,
    };

    if (template === "scheduled" && deployDate && deployTime) {
      // here create a proper date time zone USA
      const dateTime = new Date(`${deployDate}T${deployTime}:00`).toISOString();
      payload.deploy_time = dateTime;
    }

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
      setDeployDate("");
      setDeployTime("");
      loadContracts();
    } catch (err) {
      console.error(err);
      alert("Error creating contract");
    } finally {
      setCreating(false);
    }
  }

  // Accept Contract
  async function handleAccept(contractHash) {
    try {
      await api("/contracts/accept", {
        method: "POST",
        body: JSON.stringify({
          contractHash,
          wallet_id: user.wallet.wallet_id,
        }),
      });
      loadContracts();
    } catch (err) {
      console.error("Accept failed:", err);
    }
  }

  // Deploy Contract
  async function handleDeploy(contractHash) {
    try {
      await api("/contracts/deploy", {
        method: "POST",
        body: JSON.stringify({ contractHash }),
      });
      loadContracts();
    } catch (err) {
      console.error("Deploy failed:", err);
    }
  }

  // Time left (for 24h trigger)
  const timeLeft = (createdAt) => {
    const diff =
      24 * 60 * 60 * 1000 - (Date.now() - new Date(createdAt).getTime());
    if (diff <= 0) return "Ready";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m left`;
  };

  return (
    <div className="p-6 max-w-5xl h-fit mx-auto space-y-10">
      {/* 🧾 Create Contract */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full rounded-2xl shadow-xl p-6 relative"
      >
        <h2 className="text-2xl font-semibold text-center text-amber-600 mb-5">
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

          {/* Amount Input (Wallet-style) */}
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
                  className="border-none outline-none text-3xl font-bold text-center text-green-600 w-fit bg-transparent"
                />
                <span className="text-xl font-bold text-gray-600">μDAI</span>
              </div>
            </motion.div>
          </div>

          {/* Trigger / Schedule Inputs */}
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

        <div className="mt-6 text-center">
          <button
            onClick={handleCreateContract}
            disabled={!receiver || !amount}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 w-full"
          >
            {creating ? "Creating..." : "Create Contract"}
          </button>
        </div>
      </motion.div>

      {/* 📜 Smart Contract History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-gray-200 mb-10"
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
            <div className="space-y-4 h-[80vh] overflow-y-auto hide-scroll">
              {contracts.map((ctr) => {
                const isSender = ctr.sender === user.wallet.wallet_id;
                const senderAccepted = ctr.senderAccepted;
                const receiverAccepted = ctr.receiverAccepted;
                const bothAccepted = senderAccepted && receiverAccepted;

                return (
                  <motion.div
                    key={ctr._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`border border-gray-200 rounded-xl p-5 bg-white hover:bg-gradient-to-br from-white to-white drop-shadow-lg transition-all ${
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
                            {ctr.status.charAt(0).toUpperCase() +
                              ctr.status.slice(1) || "Pending"}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mt-2">
                          Amount: <span className="font-bold text-md text-green-500">{ctr.amount} μDAI</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-2 break-words">
                          <strong>Sender:</strong> {ctr.sender}
                        </p>
                        <p className="text-sm text-gray-700 break-words">
                          <strong>Receiver:</strong> {ctr.receiver}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 break-all">
                          Hash: <code>{ctr.contractHash}</code>
                        </p>
                      </div>

                      {/* ✅ Accept / Deploy logic */}
                      <div className="text-right space-y-2">
                        {bothAccepted && ctr.status !== "deployed" ? (
                          <>
                            {ctr.trigger === "approval" &&
                            ctr.sender === user.wallet.wallet_id &&
                            ctr.template === "escrow" ? (
                              <button
                                onClick={() => handleDeploy(ctr.contractHash)}
                                className="bg-indigo-500 hover:bg-indigo-400 text-gray-50 transition-all duration-300  px-4 py-1 rounded-lg text-sm drop-shadow-md"
                              >
                                Deploy Contract
                              </button>
                            ) : (
                              <p className="text-sm text-green-600 font-semibold">
                                {`Scheduled for Deployment at ${new Date(
                                  ctr.deploy_time
                                ).toLocaleString()}`}
                              </p>
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
                          </>
                        ) : (
                          ctr.status !== "deployed" && (
                            <>
                              {/* Accept button */}
                              {!(
                                (isSender && senderAccepted) ||
                                (!isSender && receiverAccepted)
                              ) && (
                                <button
                                  onClick={() => handleAccept(ctr.contractHash)}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1 rounded-lg text-sm"
                                >
                                  Accept Contract
                                </button>
                              )}
                              {/* Waiting states */}
                              {isSender &&
                                senderAccepted &&
                                !receiverAccepted && (
                                  <p className="text-sm text-gray-600">
                                    Waiting for Receiver to Accept...
                                  </p>
                                )}
                              {!isSender &&
                                receiverAccepted &&
                                !senderAccepted && (
                                  <p className="text-sm text-gray-600">
                                    Waiting for Sender to Accept...
                                  </p>
                                )}
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
