import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { UserDrawer } from './components/UserDrawer';
import { AddUserDrawer } from './components/AddUserDrawer';
import { adminUserService } from '../../../services/adminUserService';
import { toast } from 'react-toastify';

export function UsersManagementPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddUserDrawerOpen, setIsAddUserDrawerOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState(''); // '', 'active', 'suspended'
  const [pagination, setPagination] = useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterMode === 'active') filters.status = 'active';
      if (filterMode === 'suspended') filters.status = 'suspended';
      filters.page = pagination.page;
      filters.limit = pagination.limit;

      const data = await adminUserService.getPlatformUsers(filters);
      setUsers(data.users || []);
      setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 1
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
        fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterMode, pagination.page, pagination.limit]);

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleUserUpdated = () => {
    // Refresh the list when a user is updated or deleted from the drawer
    fetchUsers();
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select 
                className="h-10 pl-4 pr-8 rounded-md border border-border-light bg-background-light text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none cursor-pointer"
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
            >
              <option value="">Filter: All Users</option>
              <option value="active">Filter: Active</option>
              <option value="suspended">Filter: Suspended</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          </div>
        </div>
        <Button className="w-full sm:w-auto gap-2" onClick={() => setIsAddUserDrawerOpen(true)}>
          <Plus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden relative min-h-[400px]">
        {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-surface-dark/50 z-10 backdrop-blur-sm">
                 <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        ) : null}
        
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
              {users.length === 0 && !loading && (
                <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-text-secondary">
                        No users found matching your criteria.
                    </td>
                </tr>
              )}
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => handleRowClick(user)}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} size="sm" />
                      <span className="font-medium text-text-primary dark:text-white">{user.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{user.organization || '-'}</td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral" className="bg-gray-100 dark:bg-gray-800 text-text-secondary border-gray-200 capitalize">{user.role?.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'active' ? 'success' : 'error'} className="capitalize">{user.status || 'Active'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-text-tertiary whitespace-nowrap">{formatLastActive(user.last_active)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-text-tertiary transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && users.length > 0 && (
            <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-4">
                <span className="text-xs text-text-tertiary shrink-0">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </span>
                <select 
                    className="h-8 pl-3 pr-8 rounded-md border border-border-light bg-background-light text-xs focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none cursor-pointer"
                    value={pagination.limit}
                    onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value), page: 1 })}
                >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                </select>
            </div>
            <div className="flex gap-2 items-center">
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                    Previous
                </Button>
                <span className="text-xs font-medium text-text-primary dark:text-white px-2">
                    Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                    Next
                </Button>
            </div>
            </div>
        )}
      </div>

      {/* User Detail Drawer */}
      <UserDrawer 
        user={selectedUser} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onUpdate={handleUserUpdated}
      />

      {/* Add User Drawer */}
      <AddUserDrawer
        isOpen={isAddUserDrawerOpen}
        onClose={() => setIsAddUserDrawerOpen(false)}
        onUserAdded={fetchUsers}
      />

    </div>
  );
}