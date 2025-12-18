import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  ShoppingBag, 
  FileText, 
  Activity, 
  Settings, 
  Palette,
  LogOut
} from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { cn } from '../../../utils/cn';

const ADMIN_NAV = [
  { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
  { type: 'divider', label: 'Management' },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Organizations', path: '/admin/organizations', icon: Building2 },
  { name: 'Plans & Billing', path: '/admin/plans', icon: CreditCard },
  { name: 'Marketplace', path: '/admin/marketplace', icon: ShoppingBag },
  { type: 'divider', label: 'System' },
  { name: 'Content (CMS)', path: '/admin/content', icon: FileText },
  { name: 'Audit Logs', path: '/admin/audit', icon: Activity },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
  { name: 'Design System', path: '/admin/design', icon: Palette },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-text-primary transition-colors duration-300 flex">
      
      {/* 1. Admin Sidebar (Fixed Left) */}
      <aside className="w-64 fixed inset-y-0 left-0 z-50 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col transition-all duration-300 lg:flex">
        
        {/* Logo Area */}
        <div className="h-[72px] flex items-center gap-3 px-6 border-b border-border-light dark:border-border-dark">
          <div className="text-primary">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-text-primary dark:text-white leading-tight">Admin Panel</h2>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Super Admin</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {ADMIN_NAV.map((item, idx) => {
            if (item.type === 'divider') {
              return (
                <div key={idx} className="px-3 pt-5 pb-2">
                  <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/25" 
                    : "text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 hover:text-text-primary"
                )}
              >
                <item.icon className={cn("h-5 w-5", ({isActive}) => isActive ? "text-white" : "text-text-tertiary group-hover:text-text-primary")} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-light dark:border-border-dark">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-error hover:bg-error/5 transition-colors">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Layout Area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 w-full h-[72px] bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 lg:px-8">
          
          {/* Breadcrumb / Mobile Toggle Placeholder */}
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              {/* Mobile Menu Trigger would go here */}
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            {/* Global Admin Search */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input 
                type="text" 
                placeholder="Global search (Users, Orgs, Logs)..." 
                className="h-10 pl-9 pr-4 w-64 rounded-full border border-border-light bg-white dark:bg-surface-dark text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="h-10 w-10 flex items-center justify-center rounded-full text-text-tertiary hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-error rounded-full border-2 border-background-light dark:border-background-dark"></span>
            </button>
            <div className="h-8 w-px bg-border-light dark:bg-border-dark mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-text-primary dark:text-white leading-none">Admin User</p>
                <p className="text-xs text-text-tertiary mt-1">super@launchpad.com</p>
              </div>
              <Avatar size="md" fallback="AD" className="bg-linear-to-br from-gray-700 to-gray-900 text-white ring-2 ring-white dark:ring-border-dark cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Page Footer */}
        <footer className="mt-auto border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark py-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-tertiary">
            <p>© 2025 Startup LaunchPad Admin Suite</p>
            <div className="flex gap-6">
              <Link to="/legal/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/legal/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/legal/security" className="hover:text-primary transition-colors">Security</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}