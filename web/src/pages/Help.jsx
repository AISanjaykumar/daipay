import { motion } from "framer-motion";

export default function Help() {
  return (
    <motion.div
      className="p-6 max-w-5xl py-20 mx-auto text-gray-800"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className="text-4xl font-bold mb-6 text-indigo-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        micros & Determinism
      </motion.h1>

      <motion.p
        className="text-lg mb-6 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        DAIpay works in <strong>micro</strong>, where{" "}
        <code>1 Credit = 1,000,000 micros</code>. Using micros ensures every
        transaction is an exact integer —
        <span className="text-indigo-500 font-medium">
          {" "}
          no rounding, no ambiguity.
        </span>
      </motion.p>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Anchors</h2>
        <p className="text-lg leading-relaxed">
          Anchors record cryptographic proofs of transactions to a public or
          federated ledger, guaranteeing integrity and reproducibility. They act
          as{" "}
          <span className="font-medium text-indigo-600">
            mathematical witnesses
          </span>
          for every deterministic payment.
        </p>
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Escrows</h2>
        <p className="text-lg leading-relaxed">
          Escrows temporarily lock funds until a condition is met — for example,
          confirming that goods or services were delivered. If the condition
          fails, the funds return to sender, ensuring
          <span className="text-indigo-500 font-medium">
            {" "}
            deterministic fairness
          </span>
          for both parties.
        </p>
      </motion.div>

      <motion.div
        className="mt-12 bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-lg shadow-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="text-indigo-700 font-medium text-lg">
          “Every micros counts. Determinism means precision — not probability.”
        </p>
      </motion.div>
    </motion.div>
  );
}
