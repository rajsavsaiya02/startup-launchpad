import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MoreHorizontal, Loader2, Building2, ExternalLink, Users, ChevronDown } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { OrganizationDrawer } from './components/OrganizationDrawer';
import { adminOrgService } from '../../../services/adminOrgService';
import { toast } from 'react-toastify';

// Status badge variant/label helper
const STATUS_CONFIG = {
  active:       { variant: 'success',  label: 'Active' },
  under_review: { variant: 'warning',  label: 'Under Review' },
  suspended:    { variant: 'error',    label: 'Suspended' },
};

export function AdminOrganizationsPage() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchOrgs = useCallback(async () => {
    try {
      setLoading(true);
      const filters = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) filters.search = searchTerm;
      if (filterStatus) filters.status = filterStatus;

      const data = await adminOrgService.getOrganizations(filters);
      setOrgs(data.organizations || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      }));
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, pagination.page, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(fetchOrgs, 300);
    return () => clearTimeout(timer);
  }, [fetchOrgs]);

  const handleActionClick = (e, org) => {
    e.stopPropagation();
    setSelectedOrg(org);
    setIsDrawerOpen(true);
  };

  const handleOrgUpdated = () => {
    fetchOrgs();
  };

  const statusConfig = (status) => STATUS_CONFIG[status] || { variant: 'neutral', label: status };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-2">
          Organizations Management
        </h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">
          Manage all organizations, statuses, and founder information.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        <div className="flex items-center gap-4 w-full">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              placeholder="Search organizations..."
              className="h-10 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
            />
          </div>
          <div className="relative">
            <select
              className="h-10 pl-4 pr-10 rounded-lg border border-border-light bg-background-light text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none cursor-pointer hover:border-border-dark dark:hover:border-gray-600 transition-colors"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
            >
              <option value="">Filter: All Status</option>
              <option value="active">Active</option>
              <option value="under_review">Under Review</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-surface-dark/60 z-10 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-border-light dark:border-border-dark">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">Organization</th>
                <th className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">Founder</th>
                <th className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">Workspace</th>
                <th className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">Members</th>
                <th className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {orgs.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-text-secondary">
                      <Building2 className="h-10 w-10 text-text-tertiary opacity-40" />
                      <p className="font-medium">No organizations found</p>
                      <p className="text-sm text-text-tertiary">Try adjusting your search or filter.</p>
                    </div>
                  </td>
                </tr>
              )}
              {orgs.map((org) => {
                const sc = statusConfig(org.status);
                return (
                  <tr
                    key={org.organization_id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Organization: logo + name + brief description */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border-light dark:border-border-dark">
                          {org.logo_url ? (
                            <img src={org.logo_url} alt={org.name} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary dark:text-white truncate">{org.name}</p>
                          {org.brief_description && (
                            <p className="text-xs text-text-tertiary truncate">{org.brief_description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Founder profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={org.founder?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.founder?.name || 'F')}&background=random`}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary dark:text-white truncate">
                            {org.founder?.name || '—'}
                          </p>
                          <p className="text-xs text-text-tertiary truncate">{org.founder?.email || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Workspace Slug */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-text-secondary dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md">
                        {org.workspace_url}
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </span>
                    </td>

                    {/* Members */}
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                        <Users className="h-3.5 w-3.5" />
                        <span>{org.member_count}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        id={`org-action-${org.organization_id}`}
                        onClick={(e) => handleActionClick(e, org)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary hover:text-primary transition-all active:scale-95"
                        title="Manage organization"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && orgs.length > 0 && (
          <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-4">
              <span className="text-xs text-text-tertiary shrink-0">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} organizations
              </span>
              <div className="relative">
                <select
                  className="h-9 pl-3 pr-8 rounded-lg border border-border-light bg-background-light text-xs font-medium dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none cursor-pointer hover:border-border-dark dark:hover:border-gray-600 transition-colors"
                  value={pagination.limit}
                  onChange={(e) => setPagination(p => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </button>
              <span className="text-xs font-medium text-text-primary dark:text-white px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Organization Drawer */}
      <OrganizationDrawer
        org={selectedOrg}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleOrgUpdated}
      />
    </div>
  );
}