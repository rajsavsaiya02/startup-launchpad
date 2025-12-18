import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader'; // <--- New Header
import { PublicFooter } from './PublicFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#161121] transition-colors duration-300">
      <PublicHeader />
      
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}