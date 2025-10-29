import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfileMenu({ onClose }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest("#profile-menu")) onClose();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  const menu = (
    <div
      id="profile-menu"
      className="absolute top-14 right-5 bg-gray-800 text-white rounded-lg shadow-lg w-48 z-50 border border-gray-700"
    >
      <div className="px-4 py-3 border-b border-gray-700">
        <p className="font-semibold">{user?.name}</p>
        <p className="text-sm text-gray-400">{user?.email}</p>
      </div>
      <ul className="flex flex-col">
        <Link
          to="/profile"
          className="px-4 py-2 hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          Profile
        </Link>
        <Link
          to="/settings"
          className="px-4 py-2 hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          Settings
        </Link>
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400"
        >
          Logout
        </button>
      </ul>
    </div>
  );

  return createPortal(menu, document.body);
}
