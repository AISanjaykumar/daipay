import { FaUser } from "react-icons/fa";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { IoMdSettings } from "react-icons/io";

import { useAuth } from "../context/AuthContext";

export default function ProfileModal({ onClose, activeTab, setActiveTab }) {
  const { user } = useAuth();

  // Close with Esc key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-[760px] h-[440px] bg-gray-900 text-white rounded-2xl shadow-2xl flex overflow-hidden border border-gray-700">
        {/* Sidebar Tabs */}
        <div className="w-fit pt-4 px-2 space-y-2 md:w-44 bg-gray-800 border-r border-gray-700 flex flex-col">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-2 px-4 rounded-md font-medium transition flex items-center gap-2 ${
              activeTab === "profile"
                ? "bg-cyan-500 text-black"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FaUser />
            <span className="hidden md:block">Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`py-2 px-4 rounded-md font-medium transition flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-cyan-500 text-black"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <IoMdSettings />
            <span className="hidden md:block">Settings</span>
          </button>

          <div className="mt-auto px-3 py-4 text-xs text-gray-400">
            <div className="text-xs">Signed in as</div>
            <div className="font-medium">{user?.email}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 relative overflow-auto">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>

          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Profile</h2>
              <div className="flex items-center gap-4">
                <img
                  src={user?.photoURL || "/default-avatar.png"}
                  alt="avatar"
                  className="w-28 h-28 rounded-full border-2 border-cyan-400 object-cover"
                />
                <div>
                  <div className="text-lg font-semibold">
                    {user?.name || "No name"}
                  </div>
                  <div className="text-sm text-gray-400">{user?.email}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Settings</h2>

              <div className="mb-6 max-w-md">
                <h3 className="font-medium mb-2">Change Password</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Change password feature - not implemented");
                  }}
                  className="space-y-2"
                >
                  <input
                    type="password"
                    placeholder="Old password"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                    required
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                    required
                  />
                  <button className="px-4 py-2 bg-blue-600 rounded">
                    Update Password
                  </button>
                </form>
              </div>

              <div className="mb-6 max-w-md">
                <h3 className="font-medium mb-2">Wallet</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Resetting your wallet secret key will generate a new one.
                </p>
                <button
                  onClick={() => {
                    if (confirm("Reset wallet secret key?")) {
                      alert("Wallet secret key reset - backend not linked");
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 rounded"
                >
                  Reset Wallet Secret Key
                </button>
              </div>

              <div className="max-w-md">
                <h3 className="font-medium mb-2 text-red-400">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  Request account deletion (needs admin approval).
                </p>
                <button
                  onClick={() => {
                    if (confirm("Send delete account request?")) {
                      alert("Deletion request sent - backend not linked");
                    }
                  }}
                  className="px-4 py-2 bg-red-600 rounded"
                >
                  Request Deletion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
