// web/src/components/Footer.jsx
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-3">DAIPay™</h2>
          <p className="text-sm leading-relaxed">
            Deterministic Micropayment System — verified by math, not consensus.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-cyan-400">Home</a></li>
            <li><a href="/about" className="hover:text-cyan-400">About</a></li>
            <li><a href="/help" className="hover:text-cyan-400">Help</a></li>
            <li><a href="/wallets" className="hover:text-cyan-400">Dashboard</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Connect</h3>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" className="hover:text-cyan-400">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" className="hover:text-cyan-400">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="mailto:support@daipay.io" className="hover:text-cyan-400">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-10">
        © {new Date().getFullYear()} DAIPay™ • Built on DAIChain™ Principles
      </div>
    </footer>
  );
}
