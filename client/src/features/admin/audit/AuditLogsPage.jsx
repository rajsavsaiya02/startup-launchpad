import React from 'react';
import { Search, Calendar, Download, Eye, Server, ChevronDown } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';

const LOGS = [
  { 
    id: 1, 
    time: 'Nov 15, 2023, 10:35 AM', 
    user: { name: 'Olivia Hart', img: 'https://i.pravatar.cc/150?u=olivia' }, 
    event: 'Org Created', 
    desc: "Created new organization 'BrightPath Studios'", 
    ip: '203.0.113.45', 
    status: 'Success' 
  },
  { 
    id: 2, 
    time: 'Nov 15, 2023, 09:10 AM', 
    user: { name: 'Daniel Kim', img: 'https://i.pravatar.cc/150?u=daniel' }, 
    event: 'Login', 
    desc: 'User logged in', 
    ip: '198.51.100.22', 
    status: 'Success' 
  },
  { 
    id: 3, 
    time: 'Nov 14, 2023, 03:00 PM', 
    user: { name: 'Marcus Allen', img: 'https://i.pravatar.cc/150?u=marcus' }, 
    event: 'Plan Change', 
    desc: "Organization 'FinExpo' upgraded to Growth Plan", 
    ip: '203.0.113.11', 
    status: 'Success' 
  },
  { 
    id: 4, 
    time: 'Nov 14, 2023, 11:45 AM', 
    user: { name: 'System', img: null }, 
    event: 'Payment', 
    desc: "Payment failed for Organization 'CreativeBay'", 
    ip: 'N/A', 
    status: 'Failed' 
  },
  { 
    id: 5, 
    time: 'Nov 13, 2023, 08:20 AM', 
    user: { name: 'Chloe Davis', img: 'https://i.pravatar.cc/150?u=chloe' }, 
    event: 'Profile Update', 
    desc: 'Updated user profile details', 
    ip: '192.0.2.78', 
    status: 'Success' 
  },
];

export function AuditLogsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Page Header */}
      <div className="pt-8">
        <h1 className="text-5xl font-bold text-text-primary dark:text-white tracking-tight mb-4">
          Audit Logs
        </h1>
        <p className="text-xl text-text-secondary dark:text-gray-400 max-w-3xl">
          Review all system activities, user actions, and security events across the platform.
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-border-light dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:flex items-end gap-4">
          
          {/* Date Range */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">Date Range</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-tertiary">
                <Calendar className="h-5 w-5" />
              </div>
              <input 
                type="text" 
                placeholder="Last 30 days" 
                className="w-full h-11 pl-10 pr-3 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-text-primary dark:text-white placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* User Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">User</label>
            <div className="relative">
              <select className="w-full h-11 pl-3 pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-text-primary dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer">
                <option>All Users</option>
                <option>Olivia Hart</option>
                <option>Daniel Kim</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-tertiary">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Event Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">Event Type</label>
            <div className="relative">
              <select className="w-full h-11 pl-3 pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-text-primary dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer">
                <option>All Events</option>
                <option>Login</option>
                <option>Plan Change</option>
                <option>Payment</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-tertiary">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-60">
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-tertiary">
                <Search className="h-5 w-5" />
              </div>
              <input 
                type="search" 
                placeholder="Search activity..." 
                className="w-full h-11 pl-10 pr-3 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-text-primary dark:text-white placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Export Button */}
          <div className="w-full xl:w-auto">
            <button className="w-full h-11 px-6 flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-border-light dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['Timestamp', 'User', 'Event Type', 'Description', 'IP Address', 'Status', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-4 text-base font-semibold text-text-primary dark:text-white whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-base text-text-secondary dark:text-gray-300">
                    {log.time}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {log.user.img ? (
                        <Avatar src={log.user.img} size="sm" className="h-8 w-8" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <Server className="h-4 w-4" />
                        </div>
                      )}
                      <span className="text-base font-medium text-text-primary dark:text-white">
                        {log.user.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-base text-text-secondary dark:text-gray-300">
                    <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-sm font-medium text-text-secondary dark:text-gray-300">
                      {log.event}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-base text-text-secondary dark:text-gray-300 max-w-sm truncate" title={log.desc}>
                    {log.desc}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-base text-text-tertiary font-mono">
                    {log.ip}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={log.status === 'Success' ? 'success' : 'error'} className="px-3 py-1 text-sm font-medium rounded-full">
                      {log.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-full hover:bg-primary/10">
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <p className="text-sm text-text-tertiary">Showing 1-5 of 1,240 events</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}