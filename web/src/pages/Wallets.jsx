import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [label, setLabel] = useState("");

  async function load() {
    const data = await api("/wallets");
    setWallets(data.items || []);
  }

  async function create() {
    if (!label.trim()) return alert("Please enter a wallet label.");
    const out = await api("/wallets", {
      method: "POST",
      body: JSON.stringify({ label }),
    });
    alert(
      "✅ Wallet created. Save your keys!\n" + JSON.stringify(out, null, 2)
    );
    setLabel("");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        💰 Wallets
      </h2>

      {/* Wallet Creation Section */}
      <div className="w-full p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Create New Wallet
        </h3>
        <div className="grid gap-2">
          <input
            placeholder="Wallet Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
          <button
            onClick={create}
            style={{
              background: "#4f46e5",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#4338ca")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#4f46e5")}
          >
            Create Wallet (with Faucet)
          </button>
        </div>
      </div>

      {/* Wallet List */}
      <h3 className="text-xl font-semibold text-gray-800 mt-4">
        Existing Wallets
      </h3>
      <div
        style={{
          overflowY: "scroll",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // Internet Explorer and Edge
        }}
        className="space-y-4 py-2 px-8 bg-none max-h-[500px] overflow-y-auto"
      >
        {wallets.length === 0 && <p>No wallets found.</p>}
        {wallets.map((w) => (
          <div
            key={w.wallet_id}
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "12px 16px",
              margin: "8px 0",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
            className=""
          >
            <div>
              <b>🪪 Wallet ID:</b>{" "}
              <p style={{ wordBreak: "break-all" }}>{w.wallet_id}</p>
            </div>
            <div>
              <b>🔑 Public Key:</b>{" "}
              <p style={{ wordBreak: "break-all" }}>{w.pubkey}</p>
            </div>
            <div>
              <b>💵 Balance:</b> {w.balance_micros} μDAI
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
