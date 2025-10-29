import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // ✅ Check password requirements
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  // 🔋 Determine strength
  useEffect(() => {
    const score = Object.values(passwordChecks).filter(Boolean).length;

    if (score <= 2) setStrength("Weak");
    else if (score === 3 || score === 4) setStrength("Medium");
    else if (score === 5) setStrength("Strong");
  }, [password]);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) return toast.error("Name is required");
    if (!emailRegex.test(email)) return toast.error("Enter a valid email");
    if (Object.values(passwordChecks).includes(false))
      return toast.error("Password does not meet all requirements");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payloadEmail = email.trim().toLowerCase();

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE}/auth/signup`,
        {
          name,
          email: payloadEmail,
          password,
        }
      );
      setUser(data);
      toast.success("Signup successful 🎉");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-gray-50">
      <Toaster position="top-center" />
      <div className="bg-white p-8 rounded-2xl shadow-md w-80">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create Account
        </h2>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            placeholder="Full Name"
            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Email"
            type="email"
            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 🔋 Password strength */}
          {password && (
            <>
              <div
                className={`text-sm font-semibold ${
                  strength === "Weak"
                    ? "text-red-500"
                    : strength === "Medium"
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}
              >
                Password Strength: {strength}
              </div>

              {/* ✅ Password checklist */}
              <ul className="text-xs space-y-1">
                <li
                  className={`flex items-center gap-1 ${
                    passwordChecks.length ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {passwordChecks.length ? "✅" : "❌"} At least 8 characters
                </li>
                <li
                  className={`flex items-center gap-1 ${
                    passwordChecks.upper ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {passwordChecks.upper ? "✅" : "❌"} 1 uppercase letter
                </li>
                <li
                  className={`flex items-center gap-1 ${
                    passwordChecks.lower ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {passwordChecks.lower ? "✅" : "❌"} 1 lowercase letter
                </li>
                <li
                  className={`flex items-center gap-1 ${
                    passwordChecks.number ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {passwordChecks.number ? "✅" : "❌"} 1 number
                </li>
                <li
                  className={`flex items-center gap-1 ${
                    passwordChecks.special ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {passwordChecks.special ? "✅" : "❌"} 1 special character
                </li>
              </ul>
            </>
          )}

          <input
            placeholder="Confirm Password"
            type="password"
            className={`border border-gray-300 px-3 py-2 rounded-lg outline-none ${
              password === confirmPassword
                ? " focus:ring-2 focus:ring-green-500 "
                : " focus:ring-2 focus:ring-red-500"
            }`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            } text-white py-2 rounded-lg font-medium transition`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
