export default function Docs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-6">How DAIPay Works</h2>
      <ol className="list-decimal list-inside space-y-3 text-gray-700">
        <li>Create a wallet → Ed25519 keypair generated.</li>
        <li>Build a canonical JSON payment body.</li>
        <li>Sign it with your private key.</li>
        <li>Server verifies signature and nonce.</li>
        <li>Valid payment → recorded as a deterministic proof (receipt).</li>
        <li>Receipts are batched into sealed blocks.</li>
      </ol>
      <p className="mt-6 text-gray-600 italic">
        Determinism ensures: same data → same hash → same truth.
      </p>
    </div>
  );
}
