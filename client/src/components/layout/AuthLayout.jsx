import React from 'react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Form Area */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 py-12 bg-surface-light">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">rocket_launch</span>
            <span className="text-xl font-bold tracking-tight text-text-primary">Startup LaunchPad</span>
          </div>
          
          {/* Router Outlet for Login/Signup Forms */}
          <Outlet />
        </div>
      </div>

      {/* Right Side - Visual Area (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-background-dark relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cube-coat.png')]"></div>
        <div className="relative z-10 p-12 text-white text-center max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Build. Scale. Succeed.</h2>
          <p className="text-lg text-gray-300">
            The comprehensive operating system for high-growth startups. Manage operations, finance, and talent in one unified platform.
          </p>
        </div>
      </div>
    </div>
  );
}