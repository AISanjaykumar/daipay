import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token & decode user on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ email: decoded.email });
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    const { data } = await axios.post("http://localhost:8080/api/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  // Signup
  const signup = async (name, email, password) => {
    await axios.post("http://localhost:8080/api/auth/signup", {
      name,
      email,
      password,
    });
  };

  // Google login
  const googleLogin = async (token) => {
    const { data } = await axios.post("http://localhost:8080/api/auth/google", {
      token,
    });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = { user, login, signup, googleLogin, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
