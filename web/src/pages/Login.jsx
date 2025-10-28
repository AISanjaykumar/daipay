import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data } = await axios.post("http://localhost:8080/v1/auth/login", {
      email,
      password,
    });
    console.log(data);

    setUser(data.user);

    localStorage.setItem("token", data.token);

    navigate("/dashboard");
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const { data } = await axios.post("http://localhost:8080/api/auth/google", {
      token,
    });
    console.log(data);
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-64">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white py-2">
          Login
        </button>
      </form>

      {/* <div className="mt-4">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => console.log("Google login failed")}
        />
      </div> */}
    </div>
  );
}
