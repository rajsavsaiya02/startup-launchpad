import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../utils/cn';

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Sidebar - Desktop Fixed / Mobile Absolute */}
      <Sidebar 
        className={cn(
          isMobileMenuOpen ? "flex translate-x-0" : "hidden lg:flex -translate-x-full lg:translate-x-0"
        )} 
      />

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        <main className="flex-1 p-4 lg:p-5 overflow-x-hidden">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}