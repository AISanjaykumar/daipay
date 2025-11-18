import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowDesktopMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Logout handler with confirmation
  const handleLogout = async () => {
    await logout();
    setShowDesktopMenu(false);
  };

  return (
    <nav className="flex justify-between items-center px-5 md:px-20 py-4 bg-gray-900 text-white font-medium relative">
      <Link to="/" className="font-bold text-xl">
        DAIPay™
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-6">
        {user && (
          <Link to="/dashboard" className="hover:text-cyan-400">
            Dashboard
          </Link>
        )}
        <Link to="/about" className="hover:text-cyan-400">
          About
        </Link>
        <Link to="/help" className="hover:text-cyan-400">
          Help
        </Link>
        {import.meta.env.MODE === "development" && (
          <Link to="/debug/deterministic" className="hover:text-cyan-400">
            Debug Deterministic
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <button onClick={() => setShowMobileMenu(true)} className="user-avatar">
          ☰
        </button>

        {showMobileMenu && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div
              ref={menuRef}
              className="bg-white rounded-2xl w-11/12 max-w-sm p-6 shadow-lg relative text-gray-900 animate-fadeIn"
            >
              <button
                className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700"
                onClick={() => setShowMobileMenu(false)}
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold mb-4">Menu</h2>
              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  onClick={() => setShowMobileMenu(false)}
                  className="py-2 px-3 hover:bg-gray-100 rounded-lg"
                >
                  Home
                </Link>
                {user && (
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMobileMenu(false)}
                    className="py-2 px-3 hover:bg-gray-100 rounded-lg"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/about"
                  onClick={() => setShowMobileMenu(false)}
                  className="py-2 px-3 hover:bg-gray-100 rounded-lg"
                >
                  About
                </Link>
                <Link
                  to="/help"
                  onClick={() => setShowMobileMenu(false)}
                  className="py-2 px-3 hover:bg-gray-100 rounded-lg"
                >
                  Help
                </Link>
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="text-red-600 py-2 px-3 rounded-lg hover:bg-gray-100 font-medium text-left"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="py-2 px-3 hover:bg-gray-100 rounded-lg"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop User Menu */}
      <div className="hidden md:block relative">
        {user ? (
          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setShowDesktopMenu(!showDesktopMenu)}
            >
              <h1>{user?.name}</h1>
              <button className="w-10 h-10 rounded-full border-2 border-cyan-500 cursor-pointer user-avatar flex items-center justify-center bg-gray-700">
                {user?.name?.charAt(0).toUpperCase()}
              </button>
            </div>

            {showDesktopMenu && (
              <div className="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-lg p-2 z-50">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="font-semibold truncate">{user?.name}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <ul className="flex flex-col">
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      setShowProfile(true);
                      setShowDesktopMenu(false);
                    }}
                    className="text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setShowProfile(true);
                      setShowDesktopMenu(false);
                    }}
                    className="text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-left px-4 py-2 text-red-500 hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="text-cyan-400 border px-3 py-1 rounded-md border-cyan-500"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="hover:text-cyan-400 border px-3 py-1 rounded-md border-white-500"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {showProfile && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40">
          <ProfileModal
            onClose={() => setShowProfile(false)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      )}
    </nav>
  );
}
