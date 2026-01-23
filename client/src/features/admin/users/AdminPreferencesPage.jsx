import React from 'react';
import { Bell, Moon, Sun, Smartphone, Globe, Monitor, Sidebar, Eye } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function AdminPreferencesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-2">My Preferences</h1>
        <p className="text-text-secondary dark:text-gray-400">Customize your personal admin console experience.</p>
      </div>

      <div className="space-y-6">
        
        {/* Appearance */}
        <Card className="p-6 bg-white dark:bg-surface-dark">
          <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" /> Appearance
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
             <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/5 text-primary transition-all">
                <Sun className="h-6 w-6" />
                <span className="text-sm font-semibold">Light</span>
             </button>
             <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-secondary">
                <Moon className="h-6 w-6" />
                <span className="text-sm font-medium">Dark</span>
             </button>
             <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-secondary">
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-medium">System</span>
             </button>
          </div>
        </Card>

        {/* Interface Density */}
        <Card className="p-6 bg-white dark:bg-surface-dark">
           <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2">
            <Sidebar className="h-5 w-5 text-primary" /> Interface Density
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                 <div className="h-5 w-5 rounded border border-text-tertiary flex items-center justify-center group-hover:border-primary">
                    <div className="h-2.5 w-2.5 bg-primary rounded-sm"></div>
                 </div>
                 <div>
                    <h4 className="text-sm font-medium text-text-primary dark:text-white">Comfortable</h4>
                    <p className="text-xs text-text-tertiary">Standard spacing for better readability.</p>
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                 <div className="h-5 w-5 rounded border border-text-tertiary flex items-center justify-center group-hover:border-primary">
                    
                 </div>
                 <div>
                    <h4 className="text-sm font-medium text-text-primary dark:text-white">Compact</h4>
                    <p className="text-xs text-text-tertiary">Reduced spacing to see more data on screen.</p>
                 </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 bg-white dark:bg-surface-dark">
          <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Personal Notifications
          </h2>
          
          <div className="space-y-4">
             {[
               "Email me when a new user registers",
               "Email me on critical system alerts",
               "Push notifications for direct messages",
               "Weekly summary report"
             ].map((pref, i) => (
               <div key={i} className="flex items-center justify-between">
                 <span className="text-sm text-text-secondary">{pref}</span>
                 <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${i < 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${i < 2 ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
                 </div>
               </div>
             ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
