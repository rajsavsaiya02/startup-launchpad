import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { OrganizationDrawer } from './components/OrganizationDrawer';

const ORGS = [
  { id: 1, name: 'BrightPath Studios', owner: 'Olivia Hart', members: 12, plan: 'Growth', status: 'Active', created: 'Jan 12, 2023' },
  { id: 2, name: 'Orion Labs', owner: 'Daniel Kim', members: 34, plan: 'Scale', status: 'Active', created: 'Mar 5, 2023' },
  { id: 3, name: 'CreativeBay', owner: 'Chloe Davis', members: 8, plan: 'Starter', status: 'Suspended', created: 'May 19, 2023' },
  { id: 4, name: 'FinExpo', owner: 'Marcus Allen', members: 16, plan: 'Growth', status: 'Active', created: 'Feb 2, 2023' },
  { id: 5, name: 'NorthForge', owner: 'Sarah Lee', members: 25, plan: 'Scale', status: 'Active', created: 'Jun 10, 2023' },
];

export function AdminOrganizationsPage() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (org) => {
    setSelectedOrg(org);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-2">Organizations</h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">Review all organizations, owners, and subscription details.</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        <div className="relative flex-1">
          <Input icon={Search} placeholder="Search organizations..." className="h-11" />
        </div>
        <div className="relative w-full sm:w-64">
          <select className="h-11 w-full pl-4 pr-10 rounded-md border border-border-light bg-background-light text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none cursor-pointer">
            <option>Filter: All</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Trial</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark">
              <tr>
                {['Organization', 'Owner', 'Members', 'Plan', 'Status', 'Created On', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {ORGS.map((org) => (
                <tr 
                  key={org.id} 
                  onClick={() => handleRowClick(org)}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-text-primary dark:text-white">{org.name}</td>
                  <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{org.owner}</td>
                  <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{org.members}</td>
                  <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{org.plan}</td>
                  <td className="px-6 py-4">
                    <Badge variant={org.status === 'Active' ? 'success' : 'error'}>{org.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-text-tertiary">{org.created}</td>
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
      </div>

      <OrganizationDrawer 
        org={selectedOrg} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

    </div>
  );
}