import React, { useState, useEffect } from 'react';
import { Rocket, Clock, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function MaintenancePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Set a mock launch date 14 days from now
  useEffect(() => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 14);
    
    const interval = setInterval(() => {
      const now = new Date();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Simulate API call
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 h-full flex-1 flex flex-col items-center justify-center py-20">
        
        {/* Brand/Logo */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl mb-6 ring-1 ring-blue-500/20">
            <Rocket className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Startup Launchpad
          </h2>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight tight-leading">
            Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Extraordinary</span><br />
            Is Coming Soon
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We're currently working hard behind the scenes to bring you a revolutionary platform. 
            Get ready to launch your next big idea.
          </p>

          {/* Countdown Timer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-8">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map((item, i) => (
              <div key={i} className="flex flex-col p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
                <span className="text-4xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Notify Form */}
          <div className="max-w-md mx-auto w-full pt-10">
            {submitted ? (
              <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl animate-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span className="font-medium">You're on the list! We'll be in touch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="pl-10 h-12 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                  Notify Me <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              We promise not to spam properly. Check our privacy policy.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 w-full text-center text-sm text-gray-500 dark:text-gray-600">
        &copy; {new Date().getFullYear()} Startup Launchpad. All rights reserved.
      </div>
    </div>
  );
}
