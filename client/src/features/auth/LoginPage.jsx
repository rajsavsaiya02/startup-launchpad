import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  CheckCircle,
  ArrowRight,
  Github,
  Chrome,
} from "lucide-react";
import { apiClient, SERVER_URL } from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { OtpModal } from "../../components/auth/OtpModal";

export function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure login from context
  const [searchParams] = useSearchParams();

  // Show verification success message if redirected from OTP
  const isVerified = searchParams.get("verified");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/login", formData);
      // Directly update auth context with user data from response
      // This avoids a race condition where checkAuth might not see the cookie yet
      login(response.data.user);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.requireVerification) {
        setError(err.response.data.message);
        setShowOtp(true);
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm space-y-7"
    >
      <div className="space-y-3 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome Back
        </h1>
        <p className="text-base text-gray-500">
          Enter your credentials to access your workspace.
        </p>
      </div>

      {isVerified && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-lg bg-green-50/50 p-4 text-sm text-green-700 border border-green-200"
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium">
            Email verified! You can now log in.
          </span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-lg bg-red-50/50 p-4 text-sm text-red-600 border border-red-200/60"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-5">
          <Input
            name="email"
            label="Work Email"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            required
            className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-primary/50 transition-all duration-200"
          />
          <div className="space-y-1.5">
            <Input
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
              className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-primary/50 transition-all duration-200"
            />
            <div className="flex items-center justify-end pt-1">
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <Button
          className="w-full h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          size="lg"
          disabled={loading}
          type="submit"
        >
          {loading ? (
            "Logging In..."
          ) : (
            <span className="flex items-center justify-center gap-2 font-semibold">
              Log In <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
          <span className="bg-white/80 px-4 text-gray-400 backdrop-blur-sm">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          onClick={() =>
            (window.location.href = `${SERVER_URL}/api/auth/google`)
          }
        >
          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">Google</span>
        </button>

        <button
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          onClick={() =>
            (window.location.href = `${SERVER_URL}/api/auth/github`)
          }
        >
          <Github className="h-5 w-5 text-gray-900" />
          <span className="text-sm font-medium text-gray-700">GitHub</span>
        </button>
      </div>

      <div className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <Link
          to="/auth/signup"
          className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          Create an account
        </Link>
      </div>
      {/* 
      // Keeping OtpModal as is, assuming it handles its own visibility
      <OtpModal
        isOpen={showOtp}
        email={formData.email}
        onClose={() => setShowOtp(false)}
      /> 
*/}
      <OtpModal
        isOpen={showOtp}
        email={formData.email}
        onClose={() => setShowOtp(false)}
      />
    </motion.div>
  );
}
