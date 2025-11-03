import { useState } from "react";
import { toast } from "react-hot-toast";
import { BsCopy } from "react-icons/bs";
import { LuFileDown } from "react-icons/lu";

export default function SecretPopup({ user, onClose }) {
  const [copied, setCopied] = useState(false);

  const secretKey = user?.wallet?.secret_key || "";
  const maskedSecret =
    secretKey.length > 12
      ? `${secretKey.slice(0, 8)}****${secretKey.slice(-8)}`
      : secretKey;

  const handleCopy = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    toast.success("Secret key copied to clipboard 🔐");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob(
      [
        `Wallet Details:\n\nWallet ID: ${user?.wallet?.wallet_id}\nPublic Key: ${user?.wallet?.pubkey}\nSecret Key: ${secretKey}`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "wallet_secret_key.txt";
    link.click();
    toast.success("Secret key downloaded as text file");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 overflow-auto hide-scroll p-5">
      <div className="bg-white rounded-2xl top-10 md:top-0 p-6 w-full md:w-3xl lg:w-4xl text-center shadow-2xl animate-fade-in relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔐 Your Wallet Secret Key
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          Hi <strong>{user?.name}</strong>, Store the following information
          securely — it will not be shown again.
        </p>

        <div className="bg-slate-50 border border-indigo-50 rounded-xl p-4 text-left space-y-3">
      
          <div className="border-t border-dashed border-indigo-100 pt-3">
            <div className="text-xs text-slate-500 mb-1">
              Secret Key{" "}
              <span className="font-semibold text-red-500">(KEEP PRIVATE)</span>
            </div>
            <div className="font-mono text-sm bg-slate-900 text-cyan-50 p-3 rounded-lg break-all">
              {maskedSecret}
            </div>
            <div className="mt-2 text-[12px] text-slate-500">
              This secret key grants full control of your wallet. Do not share
              it with anyone.
            </div>

            {/* Copy / Download buttons */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-md transition-colors"
              >
                {/* <Copy className="w-4 h-4" /> */}
                <BsCopy />
                {copied ? "Copied!" : "Copy Key"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-gray-700 text-sm px-3 py-1.5 rounded-md transition-colors"
              >
                {/* <Download className="w-4 h-4" /> */}
                <LuFileDown />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-indigo-50 text-left">
          <div className="font-semibold text-slate-900 mb-1.5">
            Security Tips
          </div>
          <ul className="list-disc pl-5 text-slate-600 text-[13px] leading-relaxed">
            <li>
              Do <strong>not</strong> share your secret key.
            </li>
            <li>
              Store it in a secure password manager (1Password, Bitwarden,
              KeePass).
            </li>
          </ul>
        </div>

        {/* Confirm button */}
        <button
          onClick={onClose}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors w-full"
        >
          I’ve Saved It Securely
        </button>
      </div>
    </div>
  );
}
