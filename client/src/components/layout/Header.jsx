import React from "react";
import { NavLink } from "react-router-dom";
import { Search, Menu, Users } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-light bg-surface-light/80 px-6 backdrop-blur-md lg:px-8">
      {/* Mobile Menu Toggle */}
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
        <span className="font-bold text-lg text-primary">LaunchPad</span>
      </div>

      <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
        <NavLink 
          to="/community" 
          className={({ isActive }) => `flex items-center gap-2 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <Users className="h-4 w-4" /> Community
        </NavLink>
      </nav>

      {/* Desktop Search */}
      <div className="hidden lg:flex flex-1 max-w-md ml-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search projects, tasks, or people..."
            className="h-10 w-full rounded-lg border-none bg-background-light pl-10 text-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" className="hidden sm:flex">
          + New Project
        </Button>
      </div>
    </header>
  );
}
