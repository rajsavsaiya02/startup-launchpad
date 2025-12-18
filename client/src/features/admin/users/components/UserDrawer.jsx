import React from 'react';
import { X, Shield, Clock, Mail, Building, Activity, Trash2, Lock, Ban } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Avatar } from '../../../../components/ui/Avatar';
import { Badge } from '../../../../components/ui/Badge';

export function UserDrawer({ user, onClose, isOpen }) {
  if (!isOpen || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-border-light dark:border-border-dark flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-start">
          <div className="flex flex-col items-center w-full mt-4">
            <Avatar src={user.avatar} size="xl" className="h-24 w-24 mb-4 ring-4 ring-background-light dark:ring-background-dark" />
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">{user.name}</h2>
            <p className="text-text-secondary dark:text-gray-400">{user.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant={user.status === 'Active' ? 'success' : 'error'}>{user.status}</Badge>
              <Badge variant="neutral">{user.role}</Badge>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* User Details */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-text-primary dark:text-white">User Information</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-4 border border-border-light dark:border-border-dark">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-text-tertiary">Organization</span>
                <span className="col-span-2 font-medium text-text-primary dark:text-white">{user.organization}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-text-tertiary">Last Login</span>
                <span className="col-span-2 font-medium text-text-primary dark:text-white">{user.lastActive}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-text-tertiary">Joined On</span>
                <span className="col-span-2 font-medium text-text-primary dark:text-white">Oct 12, 2023</span>
              </div>
            </div>
          </section>

          {/* Admin Actions */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-text-primary dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Admin Actions
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Lock className="h-4 w-4" /> Reset Password
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 text-warning border-warning/30 hover:bg-warning/10">
                <Ban className="h-4 w-4" /> Suspend Account
              </Button>
              <Button variant="destructive" className="w-full justify-start gap-3">
                <Trash2 className="h-4 w-4" /> Delete User
              </Button>
            </div>
          </section>

          {/* Recent Activity Log */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-text-primary dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-text-tertiary" /> Recent Activity
            </h3>
            <ul className="space-y-4 relative pl-4 border-l-2 border-border-light dark:border-border-dark">
              {[
                { action: "Logged in from 192.168.1.1", time: "2 hours ago" },
                { action: "Updated profile information", time: "1 day ago" },
                { action: "Changed plan to 'Pro'", time: "3 days ago" }
              ].map((log, i) => (
                <li key={i} className="relative">
                  <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-border-light dark:bg-border-dark border-2 border-white dark:border-background-dark"></div>
                  <p className="text-sm text-text-secondary dark:text-gray-300">{log.action}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{log.time}</p>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </aside>
    </>
  );
}