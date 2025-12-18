import React from 'react';
import { Users, DollarSign, Building2, UserCheck, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

// Mock Data
const STATS = [
  { label: 'Total Users Registered', value: '14,208', icon: Users },
  { label: 'Active Monthly Users', value: '2,971', icon: UserCheck },
  { label: 'Monthly Recurring Revenue', value: '$38,640', icon: DollarSign },
  { label: 'Active Organizations', value: '191', icon: Building2 },
];

const ACTIVITY_LOGS = [
  { text: "User ‘olivia.h’ created a new organization", time: "2 hours ago" },
  { text: "Payment failed for Organization ‘BrightPath’", time: "6 hours ago" },
  { text: "Freelancer profile pending approval: ‘john.design’", time: "Yesterday" },
  { text: "New subscription upgrade: Orion Labs → Growth Plan", time: "Yesterday" },
];

export function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-text-primary dark:text-white">Admin Dashboard</h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">Platform-wide overview of activity, revenue, and system health.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Card key={i} className="p-6 flex flex-col gap-4 border-border-light dark:border-border-dark shadow-subtle hover:shadow-md transition-shadow">
            <stat.icon className="h-8 w-8 text-primary" />
            <div>
              <p className="text-3xl font-bold text-text-primary dark:text-white tabular-nums">{stat.value}</p>
              <p className="text-sm text-text-secondary dark:text-gray-400">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Growth (Line Chart Placeholder) */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary dark:text-white">User Growth Trend</h2>
              <select className="h-10 rounded-md border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-surface-dark dark:border-border-dark">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
              <span className="text-text-tertiary flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Line Chart Placeholder
              </span>
            </div>
          </Card>
        </div>

        {/* Subscriptions (Donut Chart Placeholder) */}
        <div className="lg:col-span-1">
          <Card className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-6">Subscriptions</h2>
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 min-h-[200px]">
              <span className="text-text-tertiary">Donut Chart Placeholder</span>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Starter Plan</span> <span className="font-bold">42%</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Growth Plan</span> <span className="font-bold">37%</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Scale Plan</span> <span className="font-bold">21%</span></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Activity Logs */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary dark:text-white">Recent Activity Logs</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="divide-y divide-border-light dark:divide-border-dark">
          {ACTIVITY_LOGS.map((log, i) => (
            <div key={i} className="flex justify-between py-4 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors px-2 rounded-md">
              <p className="text-text-secondary dark:text-gray-300">{log.text}</p>
              <span className="text-sm text-text-tertiary">{log.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Pending Approvals */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-6">Pending Approvals</h2>
        <div className="space-y-4">
          {[
            "Freelancer profile: emma.creative – Awaiting approval",
            "Gig Listing: Frontend Developer (Acme Labs) – Requires review"
          ].map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-background-light dark:bg-gray-800 border border-border-light dark:border-border-dark">
              <p className="text-text-secondary dark:text-gray-300 font-medium">{item}</p>
              <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent shadow-none">
                Review Now
              </Button>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}