import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { OtpModal } from '../../components/auth/OtpModal';

export function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Show verification success message if redirected from OTP
  const isVerified = searchParams.get('verified');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/login', formData, { withCredentials: true });
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.requireVerification) {
        setError(err.response.data.message);
        setShowOtp(true);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold text-text-primary">Welcome Back</h1>
        <p className="text-sm text-text-tertiary">Log in to continue building your startup.</p>
      </div>

      {isVerified && (
        <div className="rounded-md bg-success/10 p-3 text-sm text-success">
          Email verified! You can now log in.
        </div>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
            Remember me
          </label>
          <Link to="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
        </div>

        <Button className="w-full" size="lg" disabled={loading} type="submit">
          {loading ? 'Logging In...' : 'Log In'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-text-tertiary">Or continue with</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        Google
      </Button>

      <Button
        variant="outline"
        className="w-full mt-2"
        onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
          <path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-5.9-.2-21.8-.2-42-68 14.6-82.3-32.6-82.3-32.6-11.6-29.5-28.5-41.9-28.5-41.9-22.1-15.2 1.7-14.9 1.7-14.9 24.5 1.7 37.4 25.1 37.4 25.1 21.8 37.2 57.1 26.6 71.1 20.3 2.2-15.7 8.5-26.5 15.3-33-54.4-6.1-111.6-27.2-111.6-121.3 0-26.8 9.5-48.7 25-65.9-2.5-6.2-10.9-31.4 2.3-64.3 0 0 20.6-6.6 67.5 25.2 19.6-5.4 40.8-8.2 62-8.2s42.4 2.8 62 8.2c46.8-31.9 67.4-25.2 67.4-25.2 13.3 32.9 4.9 58 2.4 64.3 15.6 17.1 25.1 39 25.1 65.9 0 94.4-57.4 115.1-112.2 120.9 8.7 7.5 16.5 21.7 16.5 43.7 0 31.6-.2 57-.2 64.7 0 6.6 4.7 14.5 17.6 12.1C426.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
        </svg>
        GitHub
      </Button>

      <div className="text-center text-sm text-text-tertiary">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </div>

      <OtpModal
        isOpen={showOtp}
        email={formData.email}
        onClose={() => setShowOtp(false)}
      />
    </div >
  );
}