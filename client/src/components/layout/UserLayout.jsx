import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { UserHeader } from "./UserHeader";
import { UserSidebar } from "./UserSidebar";
import { cn } from "../../utils/cn";
import { useSettings } from "../../context/SettingsContext";

export function UserLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-text-primary transition-colors duration-300">
      {/* 1. User Sidebar */}
      <UserSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Layout Area */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]",
        )}
      >
        {/* Top Header */}
        <UserHeader onMobileMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Content Viewport */}
        <main className="flex-1 p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </main>

        {/* Page Footer */}
        <footer className="mt-auto py-6 px-8 z-10 w-full max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border-light dark:border-border-dark">
            <div className="text-xs text-text-tertiary">
              © {new Date().getFullYear()}{" "}
              {settings?.platform_name || "LaunchPad"} | All rights reserved.
            </div>

            <div className="flex items-center gap-6 text-xs font-medium text-text-tertiary">
              <span className="opacity-75 font-mono">v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
