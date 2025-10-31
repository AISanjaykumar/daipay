import { useState, useEffect } from "react";
import { api } from "../api/client.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import toast from "react-hot-toast";
import OtpInput from "../components/OTP.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function canonical(obj) {
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = obj[k];
        return acc;
      }, {})
  );
}

export default function Payments() {
  const { user, refreshUser } = useAuth();

  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [amount, setAmount] = useState(100000);
  const [fromPub, setFromPub] = useState("");
  const [fromSecret, setFromSecret] = useState("");
  const [nonce, setNonce] = useState(
    "n-" + Math.random().toString(36).slice(2)
  );
  const [ref, setRef] = useState("por:demo");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  async function handleSubmitClick() {
    if (to.trim() === "" || fromSecret.trim() === "") {
      toast.error("Please fill in all required fields ❌");
      return;
    }

    if (fromSecret.trim().length !== 88) {
      toast.error("Invalid Secret Key length ❌");
      return;
    }

    if (to.trim().length !== 128) {
      toast.error("Invalid Wallet ID length ❌");
      return;
    }

    try {
      if (sendingOtp) return;
      setSendingOtp(true);
      setOtpOpen(true);

      await api("/mail/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });

      toast.success("OTP sent to your email 📩");
      setResendTimer(300); // 5 minutes timer
    } catch (error) {
      console.error(error);
      toast.error("Failed to send OTP ❌");
    } finally {
      setSendingOtp(false);
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || sendingOtp) return;
    try {
      setSendingOtp(true);
      setOtp("");
      setOtpVerified(false);

      await api("/mail/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });

      toast.success("New OTP sent 🔁");
      setResendTimer(300); // reset 5-min timer
    } catch {
      toast.error("Failed to resend OTP ❌");
    } finally {
      setSendingOtp(false);
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  useEffect(() => {
    async function verifyOtp() {
      if (otp.length === 6) {
        setOtpLoading(true);
        try {
          await api("/mail/verify-otp", {
            method: "POST",
            body: JSON.stringify({ email: user.email, otp }),
          });
          setOtpVerified(true);
          toast.success("OTP verified ✅");
        } catch {
          toast.error("Invalid OTP ❌");
          setOtp("");
        } finally {
          setOtpLoading(false);
        }
      }
    }
    verifyOtp();
  }, [otp]);

  async function submitPayment() {
    try {
      setLoading(true);
      setStatus("");

      const body = {
        from: user.wallet.wallet_id,
        to,
        amount_micros: Number(amount),
        nonce,
        timestamp: new Date().toISOString(),
        ref,
      };

      const c = canonical(body);
      const sig = bs58.encode(
        nacl.sign.detached(new TextEncoder().encode(c), bs58.decode(fromSecret))
      );

      const out = await api("/payments/submit", {
        method: "POST",
        body: JSON.stringify({
          canonical_body: c,
          from_sig: sig,
          from_pubkey: user.wallet.pubkey,
        }),
      });
      refreshUser();
      setTo("");
      setFromSecret("");
      setAmount(100000);
      setNonce("n-" + Math.random().toString(36).slice(2));
      setRef("por:demo");
      setStatus(`✅ Payment Accepted! Pox ID: ${out.pox_id}`);
      toast.success("🎉 Payment completed successfully!");
    } catch (err) {
      console.log(err);

      const msg = err?.response?.data?.error || err?.message || "";

      if (msg.includes("invalid_sig")) {
        setStatus("❌ Invalid signature. Please check your wallet keys.");
        toast.error("Invalid signature ❌");
      } else if (msg.includes("nonce_used")) {
        setStatus(
          "⚠️ Nonce already used. Try refreshing or using a new nonce."
        );
        toast.error("Nonce already used ⚠️");
      } else if (msg.includes("insufficient_balance")) {
        setStatus("⚠️ Insufficient balance. Please check your wallet.");
        toast.error("Insufficient balance ⚠️");
      } else if (msg.includes("wallet_not_found")) {
        setStatus("⚠️ Wallet not found. Please check your wallet.");
        toast.error("Wallet not found ⚠️");
      } else {
        setStatus("❌ Payment failed. Please try again later.");
        toast.error("Payment failed ❌");
      }
    } finally {
      setLoading(false);
      setOtpOpen(false);
      setOtp("");
      setOtpVerified(false);
    }
  }

  return (
    <div className="min-h-[70dvh] flex items-center justify-center bg-gradient-to-br p-6">
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          💸 Send Deterministic Payment
        </h2>

        <div className="flex flex-col gap-4 w-full">
          <input
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="To Wallet ID"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <input
            type="password"
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Your Secret Key"
            value={fromSecret}
            onChange={(e) => setFromSecret(e.target.value)}
          />
          <input
            type="number"
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Amount (μDAI)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nonce"
            value={nonce}
            onChange={(e) => setNonce(e.target.value)}
          />
          <input
            className="p-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ref (optional)"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />

          <button
            onClick={submitPayment}
            disabled={loading || sendingOtp}
            className={`mt-3 p-3 w-full rounded-lg text-white font-medium transition ${
              loading || sendingOtp
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {sendingOtp
              ? "Sending OTP..."
              : loading
              ? "Processing..."
              : "Submit Payment"}
          </button>

          {status && (
            <div
              className={`mt-3 font-medium break-words whitespace-pre-wrap w-full ${
                status.startsWith("✅")
                  ? "text-green-600"
                  : status.startsWith("❌")
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      {otpOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 relative">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              🔒 Verify OTP
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Enter the 6-digit OTP sent to your email.
            </p>

            <div className="flex justify-center mb-4">
              <OtpInput onChange={handleOtpChange} disabled={otpVerified} />
            </div>

            {otpLoading && (
              <div className="flex justify-center items-center gap-2 mb-3">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Verifying
              </div>
            )}

            {!otpVerified && (
              <div className="flex justify-center mb-4">
                <button
                  disabled={resendTimer > 0 || sendingOtp}
                  onClick={handleResend}
                  className={`text-blue-600 text-sm ${
                    resendTimer > 0 || sendingOtp
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {sendingOtp
                    ? "Resending..."
                    : resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </button>
              </div>
            )}

            <button
              onClick={submitPayment}
              disabled={!otpVerified || loading}
              className={`w-full py-2 rounded-lg font-semibold text-white transition ${
                otpVerified
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </button>

            <button
              onClick={() => {
                setOtpOpen(false);
                setOtp("");
                setOtpVerified(false);
              }}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
