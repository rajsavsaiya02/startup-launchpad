import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Palette, 
  Box, 
  Layout, 
  MousePointer2, 
  Accessibility, 
  BookOpen, 
  Layers 
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { name: 'Introduction', path: '/admin/design', icon: BookOpen, end: true },
    ]
  },
  {
    title: "Core",
    items: [
      { name: 'Foundations', path: '/admin/design/foundations', icon: Palette },
      { name: 'Components', path: '/admin/design/components', icon: Box },
    ]
  },
  {
    title: "Guidelines",
    items: [
      { name: 'Layout & Grid', path: '/admin/design/layout', icon: Layout },
      { name: 'Interactions', path: '/admin/design/interactions', icon: MousePointer2 },
      { name: 'Accessibility', path: '/admin/design/accessibility', icon: Accessibility },
    ]
  }
];

export function DesignSystemLayout() {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-sans text-text-primary transition-colors duration-300">
      
      {/* Persistent Documentation Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 z-30 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex flex-col h-full">
        
        {/* Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-text-primary dark:text-white">LaunchPad</h1>
              <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">Design System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-primary"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", ({isActive}) => isActive ? "text-primary" : "text-text-tertiary")} />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Version Info */}
        <div className="p-4 border-t border-border-light dark:border-border-dark">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-xs text-text-tertiary">
            <p className="font-medium text-text-secondary dark:text-gray-300">Current Version</p>
            <p className="mt-1 font-mono">v1.2.0 • Nov 28, 2025</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-w-0">
        <div className="max-w-5xl mx-auto p-8 lg:p-12">
          <Outlet />
        </div>
      </main>

    </div>
  );
}