import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Github, Briefcase, GraduationCap, Globe, Rocket } from 'lucide-react';
import { apiClient, SERVER_URL } from '../../lib/axios';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { OtpModal } from '../../components/auth/OtpModal';

export function SignupPage() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [role, setRole] = useState('normal_user');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      await apiClient.post('/auth/register', {
        name,
        email: formData.email,
        password: formData.password,
        role
      });
      setShowOtp(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'founder', label: 'Founder', description: 'Address inefficiency & build startups', icon: Rocket },
    { id: 'freelancer', label: 'Freelancer', description: 'Find gigs & opportunities', icon: Briefcase },
    { id: 'student', label: 'Student', description: 'Learn & find internships', icon: GraduationCap },
    { id: 'normal_user', label: 'Normal User', description: 'Explore the ecosystem', icon: Globe },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm space-y-7"
    >
      <div className="space-y-3 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h1>
        <p className="text-base text-gray-500">
          Join thousands of founders building the future.
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-lg bg-red-50/50 p-4 text-sm text-red-600 border border-red-200/60"
          >
            {error}
          </motion.div>
        )}

        {/* Role Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">I am a...</label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-gray-500">
            {roles.find(r => r.id === role)?.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="firstName"
            label="First Name"
            placeholder="Jane"
            value={formData.firstName}
            onChange={handleChange}
            icon={User}
            required
            className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-primary/50 transition-all duration-200"
          />
          <Input
            name="lastName"
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            icon={User}
            required
            className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-primary/50 transition-all duration-200"
          />
        </div>

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

        <Button
          className="w-full h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          size="lg"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Creating Account...' : (
            <span className="flex items-center justify-center gap-2 font-semibold">
              Create Account <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
          <span className="bg-white/80 px-4 text-gray-400 backdrop-blur-sm">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          onClick={() => window.location.href = `${SERVER_URL}/api/auth/google`}
        >
          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Google</span>
        </button>

        <button
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          onClick={() => window.location.href = `${SERVER_URL}/api/auth/github`}
        >
          <Github className="h-5 w-5 text-gray-900" />
          <span className="text-sm font-medium text-gray-700">GitHub</span>
        </button>
      </div>

      <div className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors">
          Log in
        </Link>
      </div>

      <OtpModal
        isOpen={showOtp}
        email={formData.email}
        onClose={() => setShowOtp(false)}
      />
    </motion.div>
  );
}