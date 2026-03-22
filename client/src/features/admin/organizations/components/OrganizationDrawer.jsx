import React, { useState } from 'react';
import {
  X, Building2, Users, ExternalLink, ShieldAlert, CheckCircle, Clock,
  Loader2, Mail, Globe
} from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Avatar } from '../../../../components/ui/Avatar';
import { adminOrgService } from '../../../../services/adminOrgService';
import { toast } from 'react-toastify';

// ─── Status configuration ──────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    variant: 'success',
    label: 'Active',
    icon: CheckCircle,
    description: 'All members have full access. Everything works normally.',
    color: 'text-green-600 dark:text-green-400',
    ring: 'ring-green-500/20',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  under_review: {
    variant: 'warning',
    label: 'Under Review',
    icon: Clock,
    description: 'Only Founders & Co-Founders can access. Regular members are blocked — no data loss.',
    color: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  suspended: {
    variant: 'error',
    label: 'Suspended',
    icon: ShieldAlert,
    description: 'Only the founding Founder retains access. All other members are blocked — no data loss.',
    color: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-500/20',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
};

const STATUS_ACTIONS = [
  {
    status: 'active',
    label: 'Set Active',
    icon: CheckCircle,
    btn: 'text-green-700 border-green-300 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:border-green-800 dark:bg-green-900/20 dark:hover:bg-green-900/40',
    confirm: (name) => `Set "${name}" back to Active? All members will regain normal access.`,
  },
  {
    status: 'under_review',
    label: 'Put Under Review',
    icon: Clock,
    btn: 'text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/40',
    confirm: (name) => `Put "${name}" under review?\n\nOnly Founders & Co-Founders will be able to access this organization until it's restored. No data will be lost.`,
  },
  {
    status: 'suspended',
    label: 'Suspend',
    icon: ShieldAlert,
    btn: 'text-red-700 border-red-300 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:border-red-800 dark:bg-red-900/20 dark:hover:bg-red-900/40',
    confirm: (name) => `Suspend "${name}"?\n\nOnly the founding Founder will retain access. All other members — including Co-Founders and Admins — will be blocked. No data will be lost.`,
  },
];

// ─── Component ────────────────────────────────────────────────────────────
export function OrganizationDrawer({ org, onClose, isOpen, onUpdate }) {
  const [loadingAction, setLoadingAction] = useState(null);

  if (!isOpen || !org) return null;

  const currentStatus = STATUS_CONFIG[org.status] || STATUS_CONFIG.active;
  const CurrentIcon = currentStatus.icon;

  const handleStatusChange = async (action) => {
    if (org.status === action.status) return; // Already this status — no-op

    const confirmed = window.confirm(action.confirm(org.name));
    if (!confirmed) return;

    try {
      setLoadingAction(action.status);
      await adminOrgService.updateOrgStatus(org.organization_id, action.status);
      toast.success(`"${org.name}" is now ${STATUS_CONFIG[action.status].label}.`);
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update organization status');
    } finally {
      setLoadingAction(null);
    }
  };

  const founderName = org.founder?.name || 'Unknown';
  const founderEmail = org.founder?.email || '—';
  const founderAvatar = org.founder?.avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(founderName)}&background=random`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-background-dark shadow-2xl z-50 flex flex-col border-l border-border-light dark:border-border-dark">

        {/* ── Header ── */}
        <div className="p-6 border-b border-border-light dark:border-border-dark bg-gray-50/60 dark:bg-gray-900/40 shrink-0">
          <div className="flex items-start justify-between gap-3">
            {/* Org identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-border-light dark:border-border-dark overflow-hidden">
                {org.logo_url ? (
                  <img src={org.logo_url} alt={org.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-text-primary dark:text-white truncate">{org.name}</h2>
                <a
                  href={`/community/${org.workspace_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  /{org.workspace_url} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            {/* Close */}
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status badge row */}
          <div className="mt-4 flex items-center gap-2">
            <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
            <span className="text-xs text-text-tertiary flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {org.member_count} member{org.member_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Brief Description */}
          {org.brief_description && (
            <section>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">About</h3>
              <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                {org.brief_description}
              </p>
            </section>
          )}

          {/* Founder Card */}
          <section>
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Founder</h3>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-border-light dark:border-border-dark">
              <Avatar
                src={founderAvatar}
                size="lg"
                className="ring-2 ring-background-light dark:ring-background-dark shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-text-primary dark:text-white">{founderName}</p>
                <p className="text-sm text-text-secondary dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{founderEmail}</span>
                </p>
              </div>
            </div>
          </section>

          {/* Current Status Info */}
          <section>
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Current Status</h3>
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${currentStatus.bg} ring-1 ${currentStatus.ring}`}>
              <CurrentIcon className={`h-5 w-5 shrink-0 mt-0.5 ${currentStatus.color}`} />
              <div>
                <p className={`text-sm font-semibold ${currentStatus.color}`}>{currentStatus.label}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5 leading-relaxed">
                  {currentStatus.description}
                </p>
              </div>
            </div>
          </section>

          {/* Status Control Actions */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Change Status</h3>
            {STATUS_ACTIONS.map((action) => {
              const isCurrentStatus = org.status === action.status;
              const ActionIcon = action.icon;
              const isLoading = loadingAction === action.status;

              return (
                <button
                  key={action.status}
                  onClick={() => handleStatusChange(action)}
                  disabled={isCurrentStatus || loadingAction !== null}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                    ${isCurrentStatus
                      ? 'opacity-40 cursor-not-allowed border-border-light dark:border-border-dark bg-transparent text-text-tertiary'
                      : action.btn
                    }
                  `}
                >
                  {isLoading
                    ? <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    : <ActionIcon className="h-4 w-4 shrink-0" />
                  }
                  <span>{action.label}</span>
                  {isCurrentStatus && (
                    <span className="ml-auto text-xs font-normal opacity-70">Current</span>
                  )}
                </button>
              );
            })}
          </section>

          {/* Access Control Summary */}
          <section>
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Access Control Reference</h3>
            <div className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-text-secondary">Status</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-text-secondary">Founder</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-text-secondary">Co-Founder</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-text-secondary">Others</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {[
                    { label: 'Active', founder: '✅', co: '✅', other: '✅' },
                    { label: 'Under Review', founder: '✅', co: '✅', other: '❌' },
                    { label: 'Suspended', founder: '✅', co: '❌', other: '❌' },
                  ].map(row => (
                    <tr key={row.label} className={org.status === row.label.toLowerCase().replace(' ', '_') ? 'bg-primary/5' : ''}>
                      <td className="px-3 py-2.5 font-medium text-text-primary dark:text-white">{row.label}</td>
                      <td className="px-3 py-2.5 text-center">{row.founder}</td>
                      <td className="px-3 py-2.5 text-center">{row.co}</td>
                      <td className="px-3 py-2.5 text-center">{row.other}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-tertiary mt-2">
              ⚠️ Status changes never delete member data. Access is restored when set back to Active.
            </p>
          </section>

        </div>
      </aside>
    </>
  );
}