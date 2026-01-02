import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setStep(2);
      setMessage('Reset code sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
      navigate('/auth/login', { replace: true }); // Maybe add state to show success
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-white">
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h1>
        <p className="text-sm text-text-secondary dark:text-gray-400">
          {step === 1
            ? "Enter your email and we'll send you instructions to reset your password."
            : "Enter the code sent to your email and your new password."}
        </p>
      </div>

      {error && <p className="text-center text-sm text-error">{error}</p>}
      {message && <p className="text-center text-sm text-success">{message}</p>}

      {step === 1 ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button className="w-full" size="lg" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <Input
            label="OTP Code"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="text-center tracking-widest"
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Min 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button className="w-full" size="lg" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}

      <div className="text-center">
        <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Return to Login
        </Link>
      </div>
    </div>
  );
}