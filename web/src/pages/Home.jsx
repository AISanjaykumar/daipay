// web/src/pages/Home.jsx
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <section className="flex-grow py-20 bg-gray-50 text-gray-800">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Why DAIPay™ is Different
          </h2>
          <p className="text-gray-600 leading-relaxed">
            DAIPay™ replaces mining and consensus with deterministic reproducibility —
            every transaction is mathematically verifiable. No miners, no waiting.
            Just pure proof-of-exchange, verified instantly.
          </p>
        </div>
      </section>
    </div>
  );
}
