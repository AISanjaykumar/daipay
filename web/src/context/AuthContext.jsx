import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current user
  const refreshUser = async () => {
    try {
      const data = await api(`/auth/me`);

      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // ✅ Google Login
  const googleLogin = async (token) => {
    const { data } = await api("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    setUser(data.user);
  };

  // ✅ Logout (clears cookie)
  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  };

  const value = {
    user,
    setUser,
    googleLogin,
    logout,
    refreshUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
