import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Existing dashboard pages
import Payments from "./pages/Payments.jsx";
import Wallets from "./pages/Wallets.jsx";
import Blocks from "./pages/Blocks.jsx";
import Escrows from "./pages/Escrows.jsx";
import Anchors from "./pages/Anchors.jsx";

// New public pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Help from "./pages/Help.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [tab, setTab] = useState("payments");
  const tabs = [
    { key: "payments", label: "Payments" },
    { key: "wallets", label: "Wallets" },
    { key: "escrows", label: "Escrows" },
    { key: "anchors", label: "Anchors" },
    { key: "blocks", label: "Blocks" },
  ];

  // Dashboard layout (for /app route)
  const Dashboard = () => (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 960,
        margin: "32px auto",
        padding: "0 20px",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1e1e2f" }}>
          ⚡ DAIPay™ MVP
        </h1>
        <p style={{ color: "#666", fontSize: "0.95rem", marginTop: "4px" }}>
          Deterministic Micropayment System built on DAIChain™
        </p>
      </header>

      {/* Navigation Tabs */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? "#4f46e5" : "#f3f4f6",
              color: tab === t.key ? "#fff" : "#111827",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: tab === t.key ? "0 2px 5px rgba(0,0,0,0.15)" : "none",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              if (tab !== t.key) e.currentTarget.style.background = "#e5e7eb";
            }}
            onMouseOut={(e) => {
              if (tab !== t.key) e.currentTarget.style.background = "#f3f4f6";
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Active Tab Content */}
      <main
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        {tab === "payments" && <Payments />}
        {tab === "wallets" && <Wallets />}
        {tab === "escrows" && <Escrows />}
        {tab === "anchors" && <Anchors />}
        {tab === "blocks" && <Blocks />}
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          marginTop: "32px",
          color: "#6b7280",
          fontSize: "0.9rem",
        }}
      >
        API Base:{" "}
        <code style={{ color: "#374151" }}>
          {import.meta.env.VITE_API_BASE || "http://localhost:8080/v1"}
        </code>
      </footer>
    </div>
  );

  // Full App Router
  return (
    <Router>
      {/* Simple top nav for public pages */}
      <nav className="flex justify-between px-5 md:px-20 gap-6 py-4 bg-gray-900 text-white font-medium">
        <div>
          {/* logo or branding could go here */}
          <Link to="/" className="font-bold text-xl">
            DAIPay™
          </Link>
        </div>
        <div className="space-x-5">
          <Link to="/" className="hover:text-cyan-400">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-cyan-400">
            Dashboard
          </Link>
          <Link to="/about" className="hover:text-cyan-400">
            About
          </Link>
          <Link to="/help" className="hover:text-cyan-400">
            Help
          </Link>
        </div>
        <div className="space-x-4">
          {/* login/signup here */}
          <Link
            to="/login"
            className="hover:text-cyan-400 border-b border-transparent hover:border-cyan-400 "
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="hover:text-cyan-400 border-b border-transparent hover:border-cyan-400 "
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} /> {/* Default page */}
        <Route path="/dashboard" element={<Dashboard />} />{" "}
        {/* Original tab-based dashboard */}
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
      </Routes>

      <Footer />
    </Router>
  );
}
