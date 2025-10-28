import { motion } from "framer-motion";

export default function About() {
  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-20 text-gray-800"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h1 className="text-4xl font-bold mb-6 text-indigo-600">About DAIPay™</h1>
      <p className="text-lg leading-relaxed mb-4">
        DAIPay™ is a next-generation <span className="font-semibold">Deterministic Micropayment System </span> 
        built on the principles of the DAIChain™ ecosystem — enabling 
        mathematically verifiable payments without mining, consensus, or 
        intermediaries.
      </p>
      <p className="text-lg leading-relaxed mb-4">
        Our goal is to make digital payments deterministic, reproducible, and 
        cryptographically verifiable. Every transaction is validated by 
        mathematics — not trust.
      </p>
      <p className="text-lg leading-relaxed mb-6">
        DAIPay™ forms the foundational layer of DAIChain™, alongside 
        DAIVault™ for deterministic storage and DAIContracts™ for deterministic 
        computation.
      </p>
      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 rounded-lg">
        <p className="text-indigo-700 font-medium">
          “DAIPay doesn’t depend on trust — it depends on math.”
        </p>
      </div>
    </motion.div>
  );
}
