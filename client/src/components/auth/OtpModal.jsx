import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  X,
} from "lucide-react"; // Added icons
import { apiClient } from "../../lib/axios";
import { Button } from "../../components/ui/Button";

export function OtpModal({ email, isOpen, onClose }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  // Auto-focus first input on open
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, 6).split("");
    if (data.length > 0) {
      const newOtp = [...otp];
      data.forEach((char, i) => {
        if (i < 6 && !isNaN(Number(char))) newOtp[i] = char;
      });
      setOtp(newOtp);
      if (data.length < 6) {
        inputRefs.current[data.length]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/verify-email", { email, otp: otpCode });
      onClose();
      navigate("/auth/login?verified=true");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      // Shake animation or clear could go here
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setResendLoading(true);
    setError("");
    try {
      await apiClient.post("/auth/resend-otp", { email });
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-surface-dark border border-gray-100 dark:border-gray-800"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verify your email
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                  We've sent a verification code to <br />
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {email}
                  </span>
                </p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-8">
              {/* OTP Inputs */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-xl font-bold text-gray-900 focus:border-primary focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-primary/10 transition-all dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-primary"
                  />
                ))}
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all"
                disabled={loading}
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Verify Email <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>

              {/* Resend Section */}
              <div className="flex flex-col items-center gap-4 text-sm">
                <p className="text-gray-500">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || resendLoading}
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    resendTimer > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-primary hover:text-primary-hover hover:underline"
                  }`}
                >
                  {resendLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : resendTimer > 0 ? (
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-xs">
                      {String(Math.floor(resendTimer / 60)).padStart(2, "0")}:
                      {String(resendTimer % 60).padStart(2, "0")}
                    </span>
                  ) : (
                    "Click to resend"
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
