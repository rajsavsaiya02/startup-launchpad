import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { cn } from '../../utils/cn';

// Updated Link Structure per request
const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' }, // Hash link handling
  { name: 'Pricing', path: '/pricing' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light bg-surface-light/80 backdrop-blur-md dark:border-border-dark dark:bg-background-dark/80 transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Logo className="h-8 w-8 text-primary group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold tracking-tight text-text-primary dark:text-white">
            Startup LaunchPad
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => cn(
                "text-sm font-medium transition-colors duration-200",
                isActive // && link.path !== '/'  Don't highlight Home active state on subpages
                  ? "text-primary font-semibold" 
                  : "text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white"
              )}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth/login">
            <Button variant="ghost" className="text-sm font-semibold text-text-secondary dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              Log In
            </Button>
          </Link>
          <Link to="/auth/signup">
            <Button className="rounded-lg px-5 shadow-sm shadow-primary/20">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-text-secondary dark:text-gray-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-background-dark px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "text-base font-medium px-4 py-2 rounded-md transition-colors",
                  isActive && link.path !== '/'
                    ? "bg-primary/10 text-primary" 
                    : "text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-border-light dark:border-border-dark">
            <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">Log In</Button>
            </Link>
            <Link to="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full justify-center">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}