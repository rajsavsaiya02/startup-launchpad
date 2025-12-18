import React, { useState } from 'react';
import { Search, CheckCircle, Rocket, TrendingUp, Building2, MoreHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { SubscriptionDrawer } from './components/SubscriptionDrawer';

const SUBS = [
  { id: 1, organization: 'BrightPath Studios', owner: 'Olivia Hart', plan: 'Growth', nextBilling: 'Nov 28, 2023', status: 'Active' },
  { id: 2, organization: 'Orion Labs', owner: 'Daniel Kim', plan: 'Scale', nextBilling: 'Dec 12, 2023', status: 'Active' },
  { id: 3, organization: 'CreativeBay', owner: 'Chloe Davis', plan: 'Starter', nextBilling: '—', status: 'Suspended' },
  { id: 4, organization: 'FinExpo', owner: 'Marcus Allen', plan: 'Growth', nextBilling: 'Nov 20, 2023', status: 'Active' },
  { id: 5, organization: 'NorthForge', owner: 'Sarah Lee', plan: 'Scale', nextBilling: 'Dec 2, 2023', status: 'Active' },
];

export function PlansSubscriptionsPage() {
  const [selectedSub, setSelectedSub] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (sub) => {
    setSelectedSub(sub);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-2">Plans & Subscriptions</h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">Manage pricing tiers and organization billing.</p>
      </div>

      {/* Plans Grid */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-6">Active Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Starter', price: '$0', icon: Rocket, desc: 'For early-stage founders.', features: ['1 Organization', '5 Members', 'Basic dashboards'] },
            { name: 'Growth', price: '$29', icon: TrendingUp, popular: true, desc: 'For growing teams.', features: ['Unlimited orgs', 'Unlimited members', 'Full Financial Hub', 'Talent Marketplace'] },
            { name: 'Scale', price: '$79', icon: Building2, desc: 'For scaling companies.', features: ['Everything in Growth', 'Advanced analytics', 'Budget forecasting', 'Priority support'] },
          ].map((plan) => (
            <Card key={plan.name} className={`p-8 relative flex flex-col h-full ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>}
              
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <plan.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white">{plan.name}</h3>
              <p className="text-4xl font-bold text-text-primary dark:text-white mt-4 mb-2">{plan.price} <span className="text-base font-medium text-text-secondary">/mo</span></p>
              <p className="text-sm text-text-secondary mb-6">{plan.desc}</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-text-secondary dark:text-gray-400">
                    <CheckCircle className="h-5 w-5 text-success shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              
              <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full">Edit Plan</Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Subscriptions Table */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
          <h2 className="text-2xl font-bold text-text-primary dark:text-white">Organization Subscriptions</h2>
          <div className="flex gap-4 w-full sm:w-auto">
            <Input icon={Search} placeholder="Search..." className="w-full sm:w-64" />
            <select className="h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white">
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark">
                <tr>
                  {['Organization', 'Owner', 'Current Plan', 'Next Billing', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {SUBS.map((sub) => (
                  <tr 
                    key={sub.id} 
                    onClick={() => handleRowClick(sub)}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-text-primary dark:text-white">{sub.organization}</td>
                    <td className="px-6 py-4 text-text-secondary dark:text-gray-400 flex items-center gap-2">
                      <Avatar size="xs" fallback={sub.owner[0]} /> {sub.owner}
                    </td>
                    <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{sub.plan}</td>
                    <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{sub.nextBilling}</td>
                    <td className="px-6 py-4">
                      <Badge variant={sub.status === 'Active' ? 'success' : 'error'}>{sub.status}</Badge>
                    </td>
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
      </section>

      <SubscriptionDrawer 
        sub={selectedSub} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

    </div>
  );
}