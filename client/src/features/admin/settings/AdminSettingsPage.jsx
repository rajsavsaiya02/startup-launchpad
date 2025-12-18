import React, { useState } from 'react';
import { Settings, Palette, Mail, Bell, ToggleLeft, Plug, Wrench, Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';

const NAV_ITEMS = [
  { id: 'general', label: 'General Settings', icon: Settings },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'email', label: 'Email Templates', icon: Mail },
  { id: 'notifications', label: 'Notification Settings', icon: Bell },
  { id: 'features', label: 'Feature Toggles', icon: ToggleLeft },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'maintenance', label: 'Maintenance Mode', icon: Wrench },
];

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-2">System Settings</h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">Manage platform-wide preferences, branding, and configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-4 shrink-0 sticky top-24">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                    : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full">
          
          {activeTab === 'general' && (
            <Card className="p-8 bg-white dark:bg-surface-dark">
              <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-6">General Settings</h2>
              <p className="text-text-secondary dark:text-gray-400 mb-8">Configure basic platform information.</p>
              
              <div className="space-y-6 max-w-2xl">
                <Input label="Platform Name" placeholder="Startup LaunchPad" defaultValue="Startup LaunchPad" />
                <Input label="Support Email Address" placeholder="support@launchpad.com" defaultValue="support@launchpad.com" />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Default Timezone</label>
                  <select className="w-full h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option selected>PST (Pacific Standard Time)</option>
                    <option>IST (India Standard Time)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Session Timeout</label>
                  <select className="w-full h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white">
                    <option>30 minutes</option>
                    <option selected>1 hour</option>
                    <option>8 hours</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button size="lg" className="gap-2">
                    <Save className="h-4 w-4" /> Save Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Placeholders for other tabs */}
          {activeTab !== 'general' && (
            <Card className="p-12 text-center bg-white dark:bg-surface-dark">
              <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-text-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white">Under Construction</h3>
              <p className="text-text-secondary mt-2">The {NAV_ITEMS.find(i => i.id === activeTab)?.label} panel is coming soon.</p>
            </Card>
          )}

        </div>
      </div>

    </div>
  );
}