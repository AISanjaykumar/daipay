import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true; // ✅ Allow cookies

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current user
  const refreshUser = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE}/auth/me`
      );
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
    const { data } = await axios.post("/auth/google", { token });
    setUser(data.user);
  };

  // ✅ Logout (clears cookie)
  const logout = async () => {
    await axios.post("/auth/logout");
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
