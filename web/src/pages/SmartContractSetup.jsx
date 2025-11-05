import { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaShieldAlt, FaBolt } from "react-icons/fa";
import { api } from "../api/client";

export default function SmartContractSetup() {
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
  const [signature, setSignature] = useState("");

  const generateSummary = () => {
    const base = `Release $${amount || "?"} from ${sender || "sender"} to ${
      receiver || "receiver"
    }`;
    let rule = "";
    if (template === "escrow") rule = ` when both parties confirm delivery.`;
    if (template === "scheduled") rule = ` after ${trigger}.`;
    if (template === "reward")
      rule = ` once the task is completed and approved.`;
    const cooldownTxt = cooldown
      ? " Includes a 24-hour cooldown before finalize."
      : "";
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
      const data = await api("/contracts/deploy", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSignature(data.signature || `sig_${contractHash.slice(0, 12)}`);
      setStep("signed");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* FORM CARD */}
      <div className="bg-white shadow-lg border-2 border-amber-400 rounded-xl p-6">
        <h2 className="text-center font-bold text-xl text-amber-600 mb-4">
          DAIPay Smart Contract Creator
        </h2>

        <div className="space-y-4">
          {/* Template Selector */}
          <div>
            <label className="font-semibold block mb-1">
              Contract Template
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                setSummary("");
              }}
            >
              <option value="escrow">Escrow Release after Approval</option>
              <option value="scheduled">Scheduled Payment</option>
              <option value="reward">Reward after Task Completion</option>
            </select>
          </div>

          {/* Sender & Receiver */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Sender Wallet ID</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => {
                  setSender(e.target.value);
                  setSummary("");
                }}
                placeholder="e.g. user123"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Receiver Wallet ID</label>
              <input
                type="text"
                value={receiver}
                onChange={(e) => {
                  setReceiver(e.target.value);
                  setSummary("");
                }}
                placeholder="e.g. vendor789"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block mb-1">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setSummary("");
              }}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Trigger Event */}
          <div>
            <label className="block mb-1">Trigger Event</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2"
              value={trigger}
              onChange={(e) => {
                setTrigger(e.target.value);
                setSummary("");
              }}
            >
              <option value="approval">User Approval</option>
              <option value="24h">24-Hour Timer</option>
              <option value="auto">Auto Release after Condition</option>
            </select>
          </div>

          {/* Switches */}
          <div className="flex items-center justify-between">
            <span>Add 24h Cooldown?</span>
            <input
              type="checkbox"
              checked={cooldown}
              onChange={(e) => {
                setCooldown(e.target.checked);
                setSummary("");
              }}
              className="h-5 w-5 accent-amber-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Require Guardian Approval?</span>
            <input
              type="checkbox"
              checked={guardian}
              onChange={(e) => {
                setGuardian(e.target.checked);
                setSummary("");
              }}
              className="h-5 w-5 accent-amber-500"
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-md py-2"
              onClick={generateSummary}
            >
              Generate Summary
            </button>
            <button
              className="w-full bg-gray-100 hover:bg-gray-200 rounded-md py-2"
              onClick={handlePreview}
              disabled={!amount || !sender || !receiver}
            >
              Preview & Confirm
            </button>
          </div>

          {/* Summary */}
          {summary && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="mt-3 p-4 bg-amber-50 border border-amber-400 rounded-xl text-sm"
            >
              <div className="flex items-center space-x-2 text-amber-700">
                <FaBolt className="w-4 h-4" />
                <b>Smart Contract Summary</b>
              </div>
              <p className="mt-2 text-gray-800 text-wrap">{summary}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* PREVIEW STEP */}
      {step === "preview" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-emerald-400 shadow-md rounded-xl p-6"
        >
          <div className="flex items-center space-x-2 text-emerald-700 font-semibold mb-3">
            <FaShieldAlt className="w-5 h-5" />
            <span>Preview & Confirm</span>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-gray-700">Contract Hash (SHA-256):</div>
              <code className="block break-all text-emerald-700 bg-emerald-50 p-2 rounded">
                {contractHash}
              </code>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="agree"
                type="checkbox"
                className="h-4 w-4 accent-emerald-600"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label htmlFor="agree">
                I have reviewed the terms and agree to sign & deploy
                deterministically.
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="bg-gray-100 hover:bg-gray-200 py-2 rounded-md"
                onClick={() => setStep("form")}
              >
                Back
              </button>
              <button
                className={`py-2 rounded-md text-white ${
                  agree
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-emerald-400 cursor-not-allowed"
                }`}
                disabled={!agree}
                onClick={handleSignAndDeploy}
              >
                Sign & Deploy
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* SIGNED STATE */}
      {step === "signed" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-green-700 font-semibold space-y-2"
        >
          <div className="flex items-center justify-center space-x-2">
            <FaCheckCircle className="w-5 h-5" />
            <span>
              Contract signed and queued for deterministic deployment.
            </span>
          </div>
          <div className="text-xs text-gray-700">
            Signature:{" "}
            <code className="bg-green-50 rounded px-2 py-1">{signature}</code>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
