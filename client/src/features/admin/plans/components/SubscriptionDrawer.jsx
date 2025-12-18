import React from 'react';
import { X, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';

export function SubscriptionDrawer({ sub, onClose, isOpen }) {
  if (!isOpen || !sub) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      
      <aside className="fixed right-0 top-0 h-full w-[430px] bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-border-light dark:border-border-dark">
        
        {/* Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">{sub.organization}</h2>
            <Badge variant="primary" className="mt-2">{sub.plan} Plan</Badge>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Details */}
          <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 space-y-4">
            <h3 className="font-bold text-lg text-text-primary dark:text-white">Subscription Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Owner</span>
                <span className="font-medium text-text-primary dark:text-white">{sub.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Next Billing</span>
                <span className="font-medium text-text-primary dark:text-white">{sub.nextBilling}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status</span>
                <Badge variant={sub.status === 'Active' ? 'success' : 'error'}>{sub.status}</Badge>
              </div>
            </div>
          </section>

          {/* Change Plan */}
          <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 space-y-4">
            <h3 className="font-bold text-lg text-text-primary dark:text-white">Change Plan</h3>
            <div className="space-y-4">
              <select className="w-full h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white">
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Scale">Scale</option>
              </select>
              <Button className="w-full">Update Subscription</Button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 space-y-4">
            <h3 className="font-bold text-lg text-text-primary dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-error" /> Cancel Subscription
            </h3>
            <p className="text-sm text-text-secondary">This action cannot be undone. Access will be revoked immediately.</p>
            <Button variant="destructive" className="w-full">Cancel Subscription</Button>
          </section>

        </div>
      </aside>
    </>
  );
}