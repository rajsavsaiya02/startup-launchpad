import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Eye, Keyboard, MousePointerClick } from 'lucide-react';

export function AccessibilityPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-4">Accessibility</h1>
        <p className="text-lg text-text-secondary">Ensuring Startup LaunchPad is usable by everyone.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Contrast Ratio</h3>
              <p className="text-text-secondary mb-4">
                Text must maintain a minimum contrast ratio of <strong className="text-primary">4.5:1</strong> against the background.
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-primary text-white rounded font-bold">Pass (White on Blue)</div>
                <div className="px-4 py-2 bg-gray-100 text-gray-900 rounded font-bold border">Pass (Dark on Light)</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <Keyboard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Keyboard Navigation</h3>
              <p className="text-text-secondary mb-4">
                All interactive elements must be focusable and operable without a mouse.
              </p>
              <ul className="space-y-2 text-sm text-text-tertiary">
                <li>• <kbd className="bg-gray-100 px-1 rounded border">Tab</kbd> to move focus forward.</li>
                <li>• <kbd className="bg-gray-100 px-1 rounded border">Shift + Tab</kbd> to move focus backward.</li>
                <li>• <kbd className="bg-gray-100 px-1 rounded border">Enter</kbd> or <kbd className="bg-gray-100 px-1 rounded border">Space</kbd> to activate.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <MousePointerClick className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Hit Targets</h3>
              <p className="text-text-secondary">
                Interactive elements must have a minimum touch target size of <strong>44x44px</strong> to accommodate touch screens.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}