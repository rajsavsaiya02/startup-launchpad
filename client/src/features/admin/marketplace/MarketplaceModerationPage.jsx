import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { ReviewDrawer } from './components/ReviewDrawer';

const PENDING_FREELANCERS = [
  { id: 1, name: 'Emma Creative', role: 'UI/UX Designer', desc: 'Portfolio submitted for review.', img: 'https://i.pravatar.cc/150?u=emma' },
  { id: 2, name: 'John Parker', role: 'Full Stack Developer', desc: '5 years experience in React and Node.', img: 'https://i.pravatar.cc/150?u=john' },
  { id: 3, name: 'Lara Singh', role: 'Brand Designer', desc: 'Strong experience in startup brand identities.', img: 'https://i.pravatar.cc/150?u=lara' },
];

const GIGS = [
  { id: 1, title: 'Frontend Developer (React)', org: 'Orion Labs', cat: 'Development', applicants: 14, status: 'Active' },
  { id: 2, title: 'UI Designer for Dashboard', org: 'BrightPath', cat: 'Design', applicants: 9, status: 'Active' },
  { id: 3, title: 'Marketing Consultant', org: 'NorthForge', cat: 'Marketing', applicants: 6, status: 'Flagged' },
];

const FLAGGED_ITEMS = [
  { id: 1, desc: "Freelancer 'john.design' submitted incomplete details.", type: 'Profile', time: '2 hours ago' },
  { id: 2, desc: "Gig ‘Marketing Consultant’ flagged for suspicious posting.", type: 'Gig', time: 'Yesterday' },
  { id: 3, desc: "User complaint about communication misconduct.", type: 'Message', time: '3 days ago' },
];

export function MarketplaceModerationPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleReview = (item) => {
    setSelectedItem({ description: item.desc, type: item.type });
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-2">Marketplace Moderation</h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">Review freelancers, approve profiles, and manage gig listings.</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input icon={Search} placeholder="Search..." className="h-11" />
        </div>
        <div className="relative w-64">
          <select className="h-11 w-full pl-4 pr-10 rounded-md border border-border-light bg-white text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none cursor-pointer">
            <option>All Items</option>
            <option>Pending Approval</option>
            <option>Approved</option>
            <option>Flagged</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      {/* Pending Approvals */}
      <section className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6 text-text-primary dark:text-white">Pending Freelancer Approvals</h2>
        <div className="space-y-6">
          {PENDING_FREELANCERS.map((f) => (
            <div key={f.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border-light dark:border-border-dark pb-6 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <Avatar src={f.img} size="lg" />
                <div>
                  <h3 className="font-bold text-lg text-text-primary dark:text-white">{f.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="neutral" className="bg-blue-50 text-blue-700 border-blue-200">{f.role}</Badge>
                  </div>
                  <p className="text-sm text-text-tertiary mt-1">{f.desc}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="destructive" size="sm" className="bg-error/10 text-error hover:bg-error/20 border-error/20 shadow-none">Reject</Button>
                <Button size="sm">Approve</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Gigs Table */}
      <section className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6 text-text-primary dark:text-white">Active Gigs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-light dark:border-border-dark">
              <tr>
                {['Gig Title', 'Organization', 'Category', 'Applicants', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="pb-3 font-semibold text-text-primary dark:text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {GIGS.map((g) => (
                <tr key={g.id} className="group">
                  <td className="py-4 font-medium text-text-secondary dark:text-gray-300">{g.title}</td>
                  <td className="py-4 text-text-secondary dark:text-gray-300">{g.org}</td>
                  <td className="py-4 text-text-secondary dark:text-gray-300">{g.cat}</td>
                  <td className="py-4 text-text-secondary dark:text-gray-300">{g.applicants}</td>
                  <td className="py-4">
                    <Badge variant={g.status === 'Active' ? 'success' : 'error'}>{g.status}</Badge>
                  </td>
                  <td className="py-4">
                    <button className="text-text-tertiary hover:text-text-primary"><MoreHorizontal className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Flagged Items */}
      <section className="bg-background-light dark:bg-zinc-900 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-text-primary dark:text-white">Reported Issues & Flags</h2>
        <div className="space-y-4">
          {FLAGGED_ITEMS.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-white dark:bg-background-dark border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-text-secondary dark:text-gray-300 font-medium">{item.desc}</p>
                <Badge variant="neutral" className="bg-blue-50 text-blue-700 border-blue-200">{item.type}</Badge>
                <span className="text-xs text-text-tertiary">{item.time}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleReview(item)}>Review</Button>
            </div>
          ))}
        </div>
      </section>

      <ReviewDrawer 
        item={selectedItem} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

    </div>
  );
}