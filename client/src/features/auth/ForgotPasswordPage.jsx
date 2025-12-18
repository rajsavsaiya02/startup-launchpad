import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-white">Forgot Password</h1>
        <p className="text-sm text-text-secondary dark:text-gray-400">
          Enter your email and we'll send you instructions to reset your password.
        </p>
      </div>

      <form className="space-y-6">
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="you@example.com" 
          icon={Mail}
        />
        
        <Button className="w-full" size="lg">
          Send Reset Link
        </Button>
      </form>

      <div className="text-center">
        <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Return to Login
        </Link>
      </div>
    </div>
  );
}