import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  return (
    <nav className="flex justify-between px-5 md:px-20 gap-6 py-4 bg-gray-900 text-white font-medium">
      <div>
        {/* logo or branding could go here */}
        <Link to="/" className="font-bold text-xl">
          DAIPay™
        </Link>
      </div>
      <div className="space-x-5">
        <Link to="/" className="hover:text-cyan-400">
          Home
        </Link>
        <Link to="/dashboard" className="hover:text-cyan-400">
          Dashboard
        </Link>
        <Link to="/about" className="hover:text-cyan-400">
          About
        </Link>
        <Link to="/help" className="hover:text-cyan-400">
          Help
        </Link>
      </div>
      <div className="space-x-4">
        {/* login/signup here */}
        {user ? (
          <Link
            to="/dashboard"
            className="hover:text-cyan-400 border-b border-transparent hover:border-cyan-400 "
          >
            Welcome, {user.name}
          </Link>
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
      </div>
    </nav>
  );
}
