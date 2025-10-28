import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    setLoading(false);
  }, []);

  // Google login
  const googleLogin = async (token) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/google`,
      {
        token,
      }
    );

    setUser(data.user);
  };

  // Logout
  const logout = () => {
    setUser(null);
  };

  const value = { user, setUser, googleLogin, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
