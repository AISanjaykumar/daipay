import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";

export default function ProfileMenu({ onCloseMenu }) {
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleMouseDown = (e) => {
      const target = e.target;
      const clickedInsideMenu = menuRef.current?.contains(target);
      const clickedInsideModal = modalRef.current?.contains(target);
      if (!clickedInsideMenu && !clickedInsideModal) {
        setShowModal(false);
        if (onCloseMenu) onCloseMenu();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onCloseMenu]);

  // Menu content rendered in portal so it overlays properly
  const menu = (
    <div
      ref={menuRef}
      id="profile-menu"
      className="absolute top-14 right-5 bg-gray-800 text-white rounded-lg shadow-lg w-48 z-50 border border-gray-700"
    >
      <div className="px-4 py-3 border-b border-gray-700">
        <p className="font-semibold truncate">{user?.name}</p>
        <p className="text-sm text-gray-400 truncate">{user?.email}</p>
      </div>
      <ul className="flex flex-col">
        <button
          onClick={() => {
            setShowModal(true);
          }}
          className="text-left px-4 py-2 hover:bg-gray-700 transition-colors"
        >
          Profile
        </button>

        <button
          onClick={() => {
            setShowModal(true);
          }}
          className="text-left px-4 py-2 hover:bg-gray-700 transition-colors"
        >
          Settings
        </button>

        <button
          onClick={() => {
            logout();
            setShowModal(false);
            if (onCloseMenu) onCloseMenu();
          }}
          className="text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400"
        >
          Logout
        </button>
      </ul>
      {showModal &&
        createPortal(
          <ModalWrapper modalRef={modalRef} onClose={() => {}} />,
          document.body
        )}
    </div>
  );

  return createPortal(menu, document.body);
}

function ModalWrapper({ modalRef, onClose }) {
  // read the flag set by menu click to choose the activeTab
  const forcedTab =
    sessionStorage.getItem("profileModalActiveTab") || "profile";
  const [activeTab, setActiveTab] = React.useState(forcedTab);

  useEffect(() => {
    // clear the flag
    sessionStorage.removeItem("profileModalActiveTab");
  }, []);

  return (
    <ProfileModal
      ref={modalRef}
      onClose={onClose}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
}
