import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import ProfileMenu from "./UserProfile";

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex justify-between px-5 md:px-20 gap-6 py-4 bg-gray-900 text-white font-medium relative">
      <div>
        <Link to="/" className="font-bold text-xl">
          DAIPay™
        </Link>
      </div>

      <div className="space-x-5">
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

      <div className="relative flex items-center space-x-3">
        {user ? (
          <button
            className="flex items-center gap-2 hover:text-cyan-400"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <img
              src={user?.photoURL || "/default-avatar.png"}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-cyan-400 object-cover"
            />
            <span>{user.name?.split(" ")[0]}</span>
          </button>
        ) : (
          <>
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
          </>
        )}

        {menuOpen && <ProfileMenu onClose={() => setMenuOpen(false)} />}
      </div>
    </nav>
  );
}
