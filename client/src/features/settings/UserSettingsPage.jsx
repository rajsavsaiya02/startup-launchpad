import React, { useState } from 'react';
import { 
  User, Settings, Bell, Shield, CreditCard, LogOut, Upload, Save 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';

const SETTINGS_NAV = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'account', label: 'Account Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  { id: 'workspace', label: 'Workspace Settings', icon: Settings },
];

export function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Page Header */}
      <div className="pt-6 pb-2">
        <h1 className="text-4xl font-bold text-text-primary dark:text-white tracking-tight mb-2">Settings</h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">Manage your personal profile, security, and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Settings Navigation */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24 flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
            <nav className="flex flex-col p-2">
              {SETTINGS_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-primary/10 text-primary font-semibold' 
                      : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-primary' : 'text-text-tertiary'}`} />
                  {item.label}
                </button>
              ))}
              <div className="my-2 border-t border-border-light dark:border-border-dark"></div>
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors">
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Right Column: Content Area */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* PROFILE SETTINGS TAB */}
          {activeTab === 'profile' && (
            <Card className="p-8 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
              
              <div className="border-b border-border-light dark:border-border-dark pb-6 mb-6">
                <h2 className="text-2xl font-bold text-text-primary dark:text-white">General Profile</h2>
                <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">Update your photo and personal details.</p>
              </div>

              <div className="space-y-8">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <Avatar src="https://i.pravatar.cc/150?u=alex" size="xl" className="h-24 w-24 ring-4 ring-gray-50 dark:ring-gray-800" />
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" /> Change Photo
                      </Button>
                      <Button variant="ghost" className="text-error hover:bg-error/10 hover:text-error">Remove</Button>
                    </div>
                    <p className="text-xs text-text-tertiary">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" defaultValue="Alex" />
                  <Input label="Last Name" defaultValue="Johnson" />
                  <Input label="Email Address" defaultValue="alex@launchpad.inc" disabled />
                  <Input label="Job Title" defaultValue="Product Manager" />
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Timezone</label>
                    <select className="w-full h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white">
                      <option>Pacific Time (US & Canada)</option>
                      <option>Eastern Time (US & Canada)</option>
                      <option>Greenwich Mean Time</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Language</label>
                    <select className="w-full h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Bio</label>
                  <textarea 
                    className="w-full rounded-lg border border-border-light bg-background-light p-3 text-sm h-32 focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white resize-none"
                    placeholder="Tell us a little about yourself..."
                    defaultValue="Product enthusiast building the next big thing in fintech."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4 border-t border-border-light dark:border-border-dark">
                  <Button size="lg" className="gap-2">
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </div>

              </div>
            </Card>
          )}

          {/* Placeholder for other tabs */}
          {(activeTab !== 'profile' && activeTab !== 'workspace')&& (
            <Card className="p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-surface-dark border-dashed border-2">
              <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-text-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white">Coming Soon</h3>
              <p className="text-text-secondary mt-2 max-w-md">
                The {SETTINGS_NAV.find(i => i.id === activeTab)?.label} panel is currently under development. Check back later for updates.
              </p>
            </Card>
          )}

          {/* WORKSPACE TAB */}
          {activeTab === 'workspace' && (
            <Card className="p-8 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
              <div className="border-b border-border-light dark:border-border-dark pb-6 mb-6">
                <h2 className="text-2xl font-bold text-text-primary dark:text-white">Workspace Settings</h2>
                <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">Manage your organization's identity.</p>
              </div>
              <div className="space-y-6">
                 <Input label="Workspace Name" defaultValue="LaunchPad Inc." />
                 <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Workspace URL</label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 dark:bg-gray-800 border border-r-0 border-border-light dark:border-border-dark rounded-l-lg px-3 py-2.5 text-sm text-text-tertiary">launchpad.com/</span>
                      <input type="text" defaultValue="startup-inc" className="flex-1 rounded-r-lg border border-border-light bg-white dark:bg-background-dark dark:border-border-dark px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20" />
                    </div>
                 </div>
                 <div className="flex justify-end pt-4">
                    <Button>Update Workspace</Button>
                 </div>
              </div>
            </Card>
          )}

        </section>
      </div>
    </div>
  );
}