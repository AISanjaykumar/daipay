import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function HeroSection() {
  const { user } = useAuth();
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          DAIPay™ — Deterministic Micropayments.
        </h1>

        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
          Send and verify payments with pure math — no miners, no consensus.
          Instant, verifiable, and trustless on the DAIChain™ Proof-of-Exchange
          system.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href={user ? "/dashboard" : "/login"}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/about"
            className="inline-flex items-center gap-2 border border-gray-600 hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition"
          >
            Learn More
          </a>
        </div>

        <div className="mt-16 flex justify-center gap-10 text-gray-400">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 mb-2 text-cyan-400" />
            <span>Mathematical Security</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="w-6 h-6 mb-2 text-cyan-400" />
            <span>Instant Transactions</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
