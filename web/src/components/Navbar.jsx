import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <nav className="flex justify-between items-center px-5 md:px-20 py-4 bg-gray-900 text-white font-medium relative">
      {/* Logo */}
      <Link to="/" className="font-bold text-xl">
        DAIPay™
      </Link>

      {/* Desktop Menu */}
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
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <button onClick={() => setShowMenu(!showMenu)} className="user-avatar">
          ☰
        </button>
        {showMenu && (
          <div className="fixed inset-0 bg-black/40  flex justify-center items-center z-50">
            <div
              ref={menuRef}
              className="bg-white rounded-2xl w-11/12 max-w-sm p-6 shadow-lg relative text-gray-900 animate-fadeIn"
            >
              <button
                className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700"
                onClick={() => setShowMenu(false)}
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold mb-4">Menu</h2>
              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  onClick={() => setShowMenu(false)}
                  className="py-2 px-3 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Home
                </Link>
                {user && (
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMenu(false)}
                    className="py-2 px-3 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/about"
                  onClick={() => setShowMenu(false)}
                  className="py-2 px-3 rounded-lg hover:bg-gray-100 font-medium"
                >
                  About
                </Link>
                <Link
                  to="/help"
                  onClick={() => setShowMenu(false)}
                  className="py-2 px-3 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Help
                </Link>
                {user && (
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="text-red-600 py-2 px-3 rounded-lg hover:bg-gray-100 font-medium text-left"
                  >
                    Logout
                  </button>
                )}
                {!user && (
                  <Link
                    to="/login"
                    onClick={() => setShowMenu(false)}
                    className="py-2 px-3 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop user menu */}
      <div className="hidden md:block relative">
        {user ? (
          <div className="relative">
            {/* <img
              src={user?.photoURL || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-cyan-500 cursor-pointer user-avatar"
              onClick={() => setShowMenu(!showMenu)}
            /> */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            >
              <h1>{user?.name}</h1>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-full border-2 border-cyan-500 cursor-pointer user-avatar flex items-center justify-center bg-gray-700"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>
            </div>

            {showMenu && (
              <div className="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-lg p-2 usermenu">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="font-semibold truncate">{user?.name}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <ul className="flex flex-col">
                  <button
                    onClick={() => {
                      setShowProfile(true);
                      setShowMenu(false);
                    }}
                    className="text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowProfile(true);
                      setShowMenu(false);
                    }}
                    className="text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                  >
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      logout();
                    }}
                    className="text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400"
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
        <ProfileModal
          onClose={() => setShowProfile(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </nav>
  );
}
