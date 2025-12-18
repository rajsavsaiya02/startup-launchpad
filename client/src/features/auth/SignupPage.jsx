import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function SignupPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold text-text-primary">Create Account</h1>
        <p className="text-sm text-text-tertiary">Start your journey with LaunchPad today.</p>
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" placeholder="Jane" />
          <Input label="Last Name" placeholder="Doe" />
        </div>
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        
        <Button className="w-full" size="lg">Create Account</Button>
      </form>

      <div className="text-center text-sm text-text-tertiary">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}