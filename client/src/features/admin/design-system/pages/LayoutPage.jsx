import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';

export function LayoutPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-4">Layout System</h1>
        <p className="text-lg text-text-secondary">Guidelines for padding, grid structure, and vertical rhythm.</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Grid Structure</h3>
            <p className="text-text-secondary mb-4">
              We use a <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">12-column</code> grid system.
            </p>
            <div className="grid grid-cols-12 gap-2 h-20">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-primary/10 rounded h-full"></div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Page Padding</h3>
            <p className="text-text-secondary mb-4">
              Global padding of <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">32px (2rem)</code> on desktop.
            </p>
            <div className="border-2 border-dashed border-primary/30 p-8 rounded bg-primary/5 h-20 flex items-center justify-center text-xs text-primary font-mono">
              32px Padding
            </div>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Responsive Rules</h2>
        <div className="overflow-hidden rounded-lg border border-border-light dark:border-border-dark">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-surface-dark text-text-secondary font-semibold">
              <tr>
                <th className="px-6 py-4">Breakpoint</th>
                <th className="px-6 py-4">Width</th>
                <th className="px-6 py-4">Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark bg-white dark:bg-background-dark">
              <tr>
                <td className="px-6 py-4 font-mono text-primary">&lt; 768px</td>
                <td className="px-6 py-4 font-mono">Mobile</td>
                <td className="px-6 py-4">Navbar becomes hamburger menu. Grid 1-col.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-primary">&lt; 1280px</td>
                <td className="px-6 py-4 font-mono">Tablet/Laptop</td>
                <td className="px-6 py-4">Sidebar collapses to icons. Grid 2-col.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-primary">&gt; 1280px</td>
                <td className="px-6 py-4 font-mono">Desktop</td>
                <td className="px-6 py-4">Full sidebar. 12-col grid active.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Vertical Rhythm (Do's & Don'ts)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-4 text-success font-bold">
              <CheckCircle className="h-5 w-5" /> Correct Spacing
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-success/20 rounded w-full"></div>
              <div className="h-8 bg-success/20 rounded w-full"></div>
              <div className="h-8 bg-success/20 rounded w-full"></div>
            </div>
            <p className="mt-4 text-xs text-success">Consistent 16px (space-4) gaps.</p>
          </div>
          <div className="p-6 rounded-lg bg-error/5 border border-error/20">
            <div className="flex items-center gap-2 mb-4 text-error font-bold">
              <XCircle className="h-5 w-5" /> Incorrect Spacing
            </div>
            <div className="flex flex-col">
              <div className="h-8 bg-error/20 rounded w-full mb-2"></div>
              <div className="h-8 bg-error/20 rounded w-full mb-6"></div>
              <div className="h-8 bg-error/20 rounded w-full mb-1"></div>
            </div>
            <p className="mt-4 text-xs text-error">Random gaps (8px, 24px, 4px).</p>
          </div>
        </div>
      </section>
    </div>
  );
}