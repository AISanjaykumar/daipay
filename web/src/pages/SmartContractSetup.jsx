import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaBolt,
  FaPlus,
  FaRocket,
} from "react-icons/fa";
import { api } from "../api/client";

export default function SmartContractPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [template, setTemplate] = useState("escrow");
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [trigger, setTrigger] = useState("approval");
  const [cooldown, setCooldown] = useState(false);
  const [guardian, setGuardian] = useState(false);
  const [summary, setSummary] = useState("");
  const [step, setStep] = useState("form");
  const [contractHash, setContractHash] = useState("");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  const [signature, setSignature] = useState("");
  const [deploying, setDeploying] = useState(false);

  // Load all contracts
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
    const base = `Release $${amount || "?"} from ${sender || "sender"} to ${
      receiver || "receiver"
    }`;
    let rule = "";
    if (template === "escrow") rule = ` when both parties confirm delivery.`;
    if (template === "scheduled") rule = ` after ${trigger}.`;
    if (template === "reward")
      rule = ` once the task is completed and approved.`;
    const cooldownTxt = cooldown ? " Includes a 24-hour cooldown." : "";
    const guardianTxt = guardian ? " Guardian approval required." : "";
    setSummary(base + rule + cooldownTxt + guardianTxt);
    setStep("form");
  };

  async function toSHA256Hex(text) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const handlePreview = async () => {
    if (!summary) generateSummary();
    const hash = await toSHA256Hex(
      JSON.stringify({
        template,
        sender,
        receiver,
        amount,
        trigger,
        cooldown,
        guardian,
        summary,
      })
    );
    setContractHash(hash);
    setAgree(false);
    setSignature("");
    setStep("preview");
  };

  const handleSignAndDeploy = async () => {
    if (!agree) {
      setAgreeError(true);
      return;
    }
    const payload = {
      template,
      sender,
      receiver,
      amount: Number(amount),
      trigger,
      cooldown,
      guardian,
      summary,
      contractHash,
    };
    try {
      setDeploying(true);

      // 1️⃣ Create the contract first
      await api("/contracts/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // 2️⃣ Then deploy it
      const data = await api("/contracts/deploy", {
        method: "POST",
        body: JSON.stringify({ contractHash }),
      });

      setSignature(data.signature || `sig_${contractHash.slice(0, 12)}`);
      setStep("signed");
      loadContracts();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Smart Contracts</h1>
        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
        >
          <FaPlus /> Create Smart Contract
        </button>
      </div>

      {/* Smart Contract History */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          Smart Contract History
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading contracts...</p>
        ) : contracts.length === 0 ? (
          <p className="text-gray-500">No smart contracts found.</p>
        ) : (
          <div className="space-y-3">
            {contracts.map((ctr) => (
              <div
                key={ctr._id}
                className="flex justify-between items-center border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{ctr.template}</p>
                  <p className="text-sm text-gray-600">{ctr.summary}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hash: <span className="font-mono">{ctr.contractHash}</span>
                  </p>
                  <p
                    className={`text-sm mt-1 font-medium ${
                      ctr.status === "deployed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    Status: {ctr.status || "pending"}
                  </p>
                </div>
                <div>
                  {ctr.status === "deployed" ? (
                    <span className="text-green-600 font-semibold">
                      Deployed
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POPUP FORM */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative"
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              ×
            </button>

            {/* Smart Contract Form */}
            {step === "form" && (
              <div>
                <h2 className="text-xl font-semibold text-center text-amber-600 mb-5">
                  Create Smart Contract
                </h2>

                <div className="space-y-4">
                  {/* Template */}
                  <div>
                    <label className="font-semibold block mb-1">Template</label>
                    <select
                      value={template}
                      onChange={(e) => {
                        setTemplate(e.target.value);
                        setSummary("");
                      }}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="escrow">Escrow</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="reward">Reward</option>
                    </select>
                  </div>

                  {/* Sender/Receiver */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Sender Wallet ID"
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      className="border rounded-lg p-2"
                    />
                    <input
                      placeholder="Receiver Wallet ID"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      className="border rounded-lg p-2"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <input
                      type="number"
                      placeholder="Amount ($)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="border rounded-lg p-2 w-full"
                    />
                  </div>

                  {/* Trigger */}
                  <div>
                    <label className="block mb-1">Trigger Event</label>
                    <select
                      value={trigger}
                      onChange={(e) => setTrigger(e.target.value)}
                      className="border rounded-lg p-2 w-full"
                    >
                      <option value="approval">User Approval</option>
                      <option value="24h">24h Timer</option>
                      <option value="auto">Auto Condition</option>
                    </select>
                  </div>

                  {/* Options */}
                  {/* <div className="flex justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cooldown}
                        onChange={(e) => setCooldown(e.target.checked)}
                        className="h-5 w-5 accent-amber-500"
                      />
                      24h Cooldown
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={guardian}
                        onChange={(e) => setGuardian(e.target.checked)}
                        className="h-5 w-5 accent-amber-500"
                      />
                      Guardian Approval
                    </label>
                  </div> */}

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="bg-amber-600 text-white rounded-lg py-2 hover:bg-amber-700"
                      onClick={generateSummary}
                    >
                      Generate Summary
                    </button>
                    <button
                      disabled={!sender || !receiver || !amount}
                      onClick={handlePreview}
                      className="bg-gray-100 rounded-lg py-2 hover:bg-gray-200 disabled:opacity-50"
                    >
                      Preview
                    </button>
                  </div>

                  {summary && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 p-4 bg-amber-50 border border-amber-400 rounded-lg"
                    >
                      <div className="flex items-center gap-2 text-amber-700 font-semibold">
                        <FaBolt /> Smart Contract Summary
                      </div>
                      <p className="text-gray-700 mt-2">{summary}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Preview */}
            {step === "preview" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 text-emerald-700 mb-3 font-semibold">
                  <FaShieldAlt /> Preview & Confirm
                </div>
                <div className="text-sm">
                  <p className="text-gray-700">Contract Hash:</p>
                  <code className="block bg-emerald-50 p-2 rounded text-emerald-700 break-all">
                    {contractHash}
                  </code>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => {
                      setAgree(e.target.checked);
                      setAgreeError(false);
                    }}
                    className="accent-emerald-600"
                  />
                  <span>I agree to sign and deploy this contract</span>
                </div>
                {agreeError && !agree && (
                  <p className="text-red-500 text-sm mt-1">
                    You must agree before signing and deploying.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => setStep("form")}
                    className="bg-gray-100 py-2 rounded hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSignAndDeploy}
                    disabled={deploying}
                    className={`py-2 rounded hover:cursor-pointer text-white ${
                      agree
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-emerald-400"
                    }`}
                  >
                    {deploying ? "Deploying..." : "Sign & Deploy"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Signed */}
            {step === "signed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-3 text-green-700"
              >
                <FaCheckCircle className="mx-auto text-2xl" />
                <p>Contract signed and queued for deployment.</p>
                <p className="text-xs text-gray-700">
                  Signature:{" "}
                  <code className="bg-green-50 px-2 py-1 rounded">
                    {signature}
                  </code>
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
