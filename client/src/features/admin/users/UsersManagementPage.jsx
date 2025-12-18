import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { UserDrawer } from './components/UserDrawer';

// Mock Data
const USERS = [
  { id: 1, name: 'Olivia Hart', email: 'olivia.h@launchmail.com', org: 'BrightPath Studios', role: 'Founder', status: 'Active', lastActive: '2 hours ago', avatar: 'https://i.pravatar.cc/150?u=olivia' },
  { id: 2, name: 'Daniel Kim', email: 'd.kim@orionlabs.io', org: 'Orion Labs', role: 'Admin', status: 'Active', lastActive: 'Yesterday', avatar: 'https://i.pravatar.cc/150?u=daniel' },
  { id: 3, name: 'Chloe Davis', email: 'chloe@creativebay.com', org: 'CreativeBay', role: 'Member', status: 'Suspended', lastActive: '3 days ago', avatar: 'https://i.pravatar.cc/150?u=chloe' },
  { id: 4, name: 'Marcus Allen', email: 'marcus@finexpo.net', org: 'FinExpo', role: 'Member', status: 'Active', lastActive: '5 hours ago', avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { id: 5, name: 'Sarah Lee', email: 'slee@northforge.tech', org: 'NorthForge', role: 'Admin', status: 'Active', lastActive: 'Just now', avatar: 'https://i.pravatar.cc/150?u=sarah' },
];

export function UsersManagementPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-2">Users Management</h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">Manage all user accounts, status, roles, and organization associations.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Input 
              icon={Search} 
              placeholder="Search users..." 
              className="h-10 text-sm"
            />
          </div>
          <div className="relative">
            <select className="h-10 pl-4 pr-8 rounded-md border border-border-light bg-background-light text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none cursor-pointer">
              <option>Filter: All Users</option>
              <option>Filter: Active</option>
              <option>Filter: Suspended</option>
              <option>Filter: Admins</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          </div>
        </div>
        <Button className="w-full sm:w-auto gap-2">
          <Plus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark">
              <tr>
                {['User', 'Email', 'Organization', 'Role', 'Status', 'Last Active', 'Actions'].map((head) => (
                  <th key={head} className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {USERS.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => handleRowClick(user)}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} size="sm" />
                      <span className="font-medium text-text-primary dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{user.org}</td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral" className="bg-gray-100 dark:bg-gray-800 text-text-secondary border-gray-200">{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'Active' ? 'success' : 'error'}>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-text-tertiary">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-text-tertiary transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Simple) */}
        <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <span className="text-xs text-text-tertiary">Showing 1-5 of 14,208 users</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>

      {/* User Detail Drawer */}
      <UserDrawer 
        user={selectedUser} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

    </div>
  );
}