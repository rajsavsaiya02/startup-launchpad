import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold text-text-primary">Welcome Back</h1>
        <p className="text-sm text-text-tertiary">Log in to continue building your startup.</p>
      </div>

      <form className="space-y-4">
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        
        <div className="flex items-center justify-between">
           <label className="flex items-center gap-2 text-sm text-text-secondary">
             <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
             Remember me
           </label>
           <Link to="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
        </div>

        <Link to="/dashboard"><Button className="w-full" size="lg">Log In</Button></Link>
      </form>

      <div className="text-center text-sm text-text-tertiary">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}