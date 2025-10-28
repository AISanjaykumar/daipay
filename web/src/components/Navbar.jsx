import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gray-900 text-white">
      <Link to="/" className="font-bold text-xl">DAIPay™</Link>
      <div className="space-x-6">
        <Link to="/about">About</Link>
        <Link to="/docs">Docs</Link>
        <Link to="/help">Help</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/wallets" className="bg-blue-500 px-4 py-2 rounded-md">Launch App</Link>
      </div>
    </nav>
  );
}
