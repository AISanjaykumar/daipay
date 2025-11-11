import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Help from "./pages/Help.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import Signup from "./pages/Signup.jsx";
import Blocks from "./pages/Blocks.jsx";
import Wallets from "./pages/Wallets.jsx";
import Escrows from "./pages/Escrows.jsx";
import Anchors from "./pages/Anchors.jsx";
import Payments from "./pages/Payments.jsx";
import SmartContract from "./pages/SmartContract.jsx";

import { useAuth } from "./context/AuthContext.jsx";

import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import SecretPopup from "./components/SecretPopup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  const { user } = useAuth();
  const [tab, setTab] = useState("payments");
  const [showSecretPopup, setShowSecretPopup] = useState(false);

  useEffect(() => {
    if (user?.wallet?.secret_key) {
      setShowSecretPopup(true);
    }
  }, [user]);

  const handleClosePopup = () => setShowSecretPopup(false);

  const isDev = import.meta.env.MODE === "development";

  const tabs = [
    { key: "payments", label: "Payments" },
    { key: "wallets", label: "Wallets" },
    { key: "escrows", label: "Escrows" },
    { key: "smartcontract", label: "Smart Contract" },
    ...(isDev ? [{ key: "anchors", label: "Anchors" }] : []),
    { key: "blocks", label: "Blocks" },
  ];

  const Dashboard = () => (
    <div className="font-sans max-w-5xl mx-auto mt-10 px-5">
      {/* Header */}
      <header className="text-center mb-7">
        <h1 className="text-3xl font-bold text-gray-900">⚡ DAIPay™ MVP</h1>
        <p className="text-gray-600 text-sm mt-1">
          Deterministic Micropayment System built on DAIChain™
        </p>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex justify-center gap-3 flex-wrap mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
              tab === t.key
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Active Tab Content */}
      <main className="bg-white rounded-xl overflow-hidden drop-shadow-lg mb-20">
        {tab === "payments" && <Payments />}
        {tab === "wallets" && <Wallets />}
        {tab === "escrows" && <Escrows />}
        {tab === "smartcontract" && <SmartContract />}
        {isDev && tab === "anchors" && <Anchors />}
        {tab === "blocks" && <Blocks />}
      </main>

      {showSecretPopup && (
        <SecretPopup user={user} onClose={handleClosePopup} />
      )}
    </div>
  );

  // ✅ Simple Not Found component
  const NotFound = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-gray-600 text-lg mb-6">Page Not Found</p>
      <a
        href="/"
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
      >
        Go Back Home
      </a>
    </div>
  );

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}
