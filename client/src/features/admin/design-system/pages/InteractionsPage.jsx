import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { MousePointer2, Loader2 } from 'lucide-react';

export function InteractionsPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-4">Interactions</h1>
        <p className="text-lg text-text-secondary">Standardizing states and motion for a predictable UX.</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">Interactive States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col items-center justify-center text-center group">
            <h3 className="font-bold mb-4">Hover</h3>
            <button className="px-6 py-2 bg-white border rounded shadow-sm transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5">
              Hover Me
            </button>
            <p className="mt-4 text-xs text-text-tertiary">Lift + Shadow increase</p>
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center text-center">
            <h3 className="font-bold mb-4">Focus</h3>
            <button className="px-6 py-2 bg-white border rounded ring-2 ring-primary/50 outline-none">
              Focus State
            </button>
            <p className="mt-4 text-xs text-text-tertiary">Visible ring (2px)</p>
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center text-center">
            <h3 className="font-bold mb-4">Active</h3>
            <button className="px-6 py-2 bg-primary/10 border border-primary/50 text-primary rounded scale-95">
              Pressed
            </button>
            <p className="mt-4 text-xs text-text-tertiary">Scale down (95%)</p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Motion & Animation</h2>
        <Card className="p-0 overflow-hidden divide-y divide-border-light dark:divide-border-dark">
          {[
            { name: 'Fade In', timing: '150ms', ease: 'ease-out', desc: 'Used for modals and tooltips.' },
            { name: 'Slide In (Right)', timing: '200ms', ease: 'ease-out', desc: 'Used for drawers and side panels.' },
            { name: 'Scale Up', timing: '100ms', ease: 'ease-in-out', desc: 'Used for active states on cards.' },
          ].map((motion) => (
            <div key={motion.name} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="font-bold text-text-primary dark:text-white flex items-center gap-2">
                <MousePointer2 className="h-4 w-4 text-primary" /> {motion.name}
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">{motion.timing}</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">{motion.ease}</span>
              </div>
              <div className="text-sm text-text-secondary">{motion.desc}</div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}