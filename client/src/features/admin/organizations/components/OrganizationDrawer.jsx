import React from 'react';
import { X, Building2, Users, CreditCard, Activity, ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Avatar } from '../../../../components/ui/Avatar';

export function OrganizationDrawer({ org, onClose, isOpen }) {
  if (!isOpen || !org) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      
      <aside className="fixed right-0 top-0 h-full w-[480px] bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-border-light dark:border-border-dark flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-start bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary dark:text-white">{org.name}</h2>
                <p className="text-sm text-text-tertiary">Owner: {org.owner}</p>
              </div>
            </div>
            <Badge variant="primary" className="mt-2">{org.plan} Plan</Badge>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Overview Card */}
          <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 space-y-4">
            <h3 className="font-bold text-lg border-b border-border-light dark:border-border-dark pb-2 mb-4">Overview</h3>
            {[
              { label: 'Total Members', value: org.members },
              { label: 'Created On', value: org.created },
              { label: 'Status', value: <Badge variant={org.status === 'Active' ? 'success' : 'error'}>{org.status}</Badge> }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">{item.label}</span>
                <span className="font-medium text-text-primary dark:text-white">{item.value}</span>
              </div>
            ))}
          </section>

          {/* Members List */}
          <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-text-tertiary" /> Team Members
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Emily Carter', role: 'Admin', img: 'https://i.pravatar.cc/150?u=emily' },
                { name: 'Ben Adams', role: 'Member', img: 'https://i.pravatar.cc/150?u=ben' },
                { name: 'Lisa Monroe', role: 'Member', img: 'https://i.pravatar.cc/150?u=lisa' }
              ].map((member, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Avatar src={member.img} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary dark:text-white">{member.name}</p>
                    <p className="text-xs text-text-tertiary">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Admin Controls */}
          <section className="space-y-3">
            <h3 className="font-bold text-lg mb-2">Management</h3>
            <Button variant="primary" className="w-full">Change Plan</Button>
            <Button variant="outline" className="w-full text-warning border-warning/30 hover:bg-warning/10">
              <ShieldAlert className="h-4 w-4 mr-2" /> Suspend Organization
            </Button>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" /> Delete Data
            </Button>
          </section>

        </div>
      </aside>
    </>
  );
}