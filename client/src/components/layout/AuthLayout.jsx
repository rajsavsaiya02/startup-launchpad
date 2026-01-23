import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { apiClient } from '../../lib/axios';
import { useSettings } from '../../context/SettingsContext.jsx';

export function AuthLayout() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  // Redirect logic is now handled by PublicAuthGuard

  return (
    <div className="flex min-h-screen w-full font-sans bg-gray-50/30">
      {/* Left Side - Form Area */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 xl:px-24 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-gray-50/50 to-white"
      >
        <div className="mx-auto w-full max-w-[420px] space-y-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-lg shadow-primary/20">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">{settings?.platform_name || 'Startup LaunchPad'}</span>
          </div>

          {/* Router Outlet for Login/Signup Forms */}
          <Outlet />

          <div className="flex items-center justify-between text-xs text-gray-400 mt-8 pt-8 border-t border-gray-100">
            <span>&copy; {new Date().getFullYear()} LaunchPad Inc.</span>
            <div className="space-x-4">
              <Link to="/legal/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/legal/terms-of-service" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Visual Area (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gray-900 lg:flex">
        {/* Dynamic Background with deeper mesh gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black" />

        {/* Animated Orbs - refined for subtler motion */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [45, 0, 45],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 -left-20 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]"
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-xl px-12 text-center"
        >
          <div className="mb-8 inline-flex items-center justify-center rounded-2xl bg-white/5 p-4 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/20">
            <Rocket className="h-14 w-14 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
          </div>
          <h2 className="mb-6 text-5xl font-bold tracking-tight text-white drop-shadow-sm">
            Scale your vision.
          </h2>
          <p className="text-xl leading-relaxed text-gray-300 font-light">
            The all-in-one operating system for the next generation of high-growth companies.
          </p>

          {/* Feature Pills - enhanced glass look */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {['Project Management', 'Financial Analytics', 'Talent Marketplace'].map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                className="cursor-default rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white/90 backdrop-blur-lg border border-white/5 shadow-sm transition-colors"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}