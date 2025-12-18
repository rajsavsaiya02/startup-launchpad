import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function PatternsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-4">Patterns & Rules</h1>
        <p className="text-lg text-text-secondary">Guidelines for layout, accessibility, and interaction states.</p>
      </div>

      {/* INTERACTION STATES */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Interaction States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Hover</h3>
            <div className="h-16 flex items-center justify-center bg-gray-50 rounded-lg mb-2 group">
              <button className="px-4 py-2 bg-white border rounded shadow-sm transition-all hover:bg-gray-50 hover:shadow-md">Hover Me</button>
            </div>
            <p className="text-xs text-text-tertiary">Elements subtly change background or shadow to indicate interactivity.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Focus</h3>
            <div className="h-16 flex items-center justify-center bg-gray-50 rounded-lg mb-2">
              <button className="px-4 py-2 bg-white border rounded ring-2 ring-primary/50">Focused</button>
            </div>
            <p className="text-xs text-text-tertiary">A visible focus ring (2px) ensures accessibility for keyboard users.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Active/Pressed</h3>
            <div className="h-16 flex items-center justify-center bg-gray-50 rounded-lg mb-2">
              <button className="px-4 py-2 bg-primary/10 border border-primary/50 text-primary rounded scale-95">Pressed</button>
            </div>
            <p className="text-xs text-text-tertiary">A pressed state provides immediate feedback that an action is registered.</p>
          </Card>
        </div>
      </section>

      {/* ACCESSIBILITY */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Accessibility Rules</h2>
        <Card className="p-6 divide-y divide-border-light">
          <div className="py-4 flex gap-4 items-start">
            <CheckCircle className="text-success h-6 w-6 shrink-0" />
            <div>
              <h4 className="font-bold">Contrast Ratio</h4>
              <p className="text-sm text-text-secondary">Text must maintain a minimum contrast ratio of 4.5:1 against the background.</p>
            </div>
          </div>
          <div className="py-4 flex gap-4 items-start">
            <CheckCircle className="text-success h-6 w-6 shrink-0" />
            <div>
              <h4 className="font-bold">Focus Indicators</h4>
              <p className="text-sm text-text-secondary">Interactive elements must have clearly visible focus states for navigation.</p>
            </div>
          </div>
          <div className="py-4 flex gap-4 items-start">
            <AlertCircle className="text-warning h-6 w-6 shrink-0" />
            <div>
              <h4 className="font-bold">Semantic HTML</h4>
              <p className="text-sm text-text-secondary">Use proper tags (button, a, input) instead of div/span for interactive elements.</p>
            </div>
          </div>
        </Card>
      </section>

      {/* RESPONSIVE */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Responsive Breakpoints</h2>
        <div className="overflow-hidden rounded-lg border border-border-light">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-text-secondary font-semibold">
              <tr>
                <th className="px-6 py-3">Breakpoint</th>
                <th className="px-6 py-3">Width</th>
                <th className="px-6 py-3">Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light bg-white">
              <tr>
                <td className="px-6 py-4 font-mono">sm</td>
                <td className="px-6 py-4 font-mono">640px</td>
                <td className="px-6 py-4">Mobile landscape / Tablets</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono">md</td>
                <td className="px-6 py-4 font-mono">768px</td>
                <td className="px-6 py-4">Tablets / Small Laptops (Sidebar collapses)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono">lg</td>
                <td className="px-6 py-4 font-mono">1024px</td>
                <td className="px-6 py-4">Laptops / Desktops</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono">xl</td>
                <td className="px-6 py-4 font-mono">1280px</td>
                <td className="px-6 py-4">Large Monitors</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}