import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Shield, Lock, Trash2, X, AlertCircle, Edit2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { DataTable } from '../../../components/ui/DataTable';
import { adminUsersService } from './adminUsersService';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';

export function AccessControlPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form states
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminUsersService.getAllAdmins();
      setAdmins(data);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await adminUsersService.createAdmin(formData);
      await fetchAdmins();
      setShowCreateModal(false);
      setFormData({});
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await adminUsersService.updateAdmin(selectedAdmin.id, formData);
      await fetchAdmins();
      setShowEditModal(false);
      setFormData({});
    } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to update admin');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
        await adminUsersService.changePassword(selectedAdmin.id, formData.newPassword);
        setShowPasswordModal(false);
        setFormData({});
        setFormSuccess('Password updated successfully');
        setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to change password');
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (admin) => {
    if(!window.confirm(`Are you sure you want to delete admin ${admin.username}?`)) return;
    try {
        await adminUsersService.deleteAdmin(admin.id);
        fetchAdmins();
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({ role: admin.role, status: admin.status });
    setShowEditModal(true);
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-2">Access Control</h1>
          <p className="text-text-secondary dark:text-gray-400">Manage administrator accounts and permissions.</p>
        </div>
        {user?.role === 'super_admin' && (
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add New Admin
            </Button>
        )}
      </div>

       <Card className="overflow-hidden border border-border-light dark:border-border-dark shadow-sm p-0">
          <DataTable 
             columns={[
                 {
                     header: 'Admin User',
                     accessor: 'username',
                     sortable: true,
                     render: (row) => (
                        <div className="flex flex-col">
                            <span className="font-medium text-text-primary dark:text-white">{row.username}</span>
                            <span className="text-xs text-text-tertiary">{row.email || 'No email'}</span>
                        </div>
                     )
                 },
                 {
                     header: 'Role',
                     accessor: 'role',
                     sortable: true,
                     render: (row) => (
                        <Badge variant={row.role === 'super_admin' ? 'purple' : 'neutral'}>
                            {row.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                     )
                 },
                 {
                     header: 'Status',
                     accessor: 'status',
                     sortable: true,
                     render: (row) => (
                        <Badge variant={row.status === 'active' ? 'success' : 'error'}>
                            {row.status}
                        </Badge>
                     )
                 },
                 {
                     header: 'Last Login',
                     accessor: 'last_login',
                     sortable: true,
                     render: (row) => (
                         <span className="text-text-tertiary">
                             {row.last_login ? new Date(row.last_login).toLocaleString() : 'Never'}
                         </span>
                     )
                 },
                 // Only show Actions column if super_admin
                 ...(user?.role === 'super_admin' ? [{
                     header: 'Actions',
                     accessor: 'actions',
                     align: 'right',
                     render: (row) => (
                        <div className="flex items-center justify-end gap-2">
                            <Button size="xs" variant="ghost" onClick={() => openEditModal(row)}>
                                <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button size="xs" variant="ghost" onClick={() => {
                                setSelectedAdmin(row);
                                setShowPasswordModal(true);
                            }}>
                                <Lock className="h-3 w-3" />
                            </Button>
                            <Button size="xs" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(row)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                     )
                 }] : [])
             ]}
             data={admins}
             loading={loading}
             title="Admins List"
             description={`Total ${admins.length} administrators found`}
             searchable={true}
             pagination={true}
             filters={[
                 {
                     key: 'role',
                     label: 'Role',
                     options: [
                         { label: 'Admin', value: 'admin' },
                         { label: 'Super Admin', value: 'super_admin' }
                     ]
                 },
                 {
                     key: 'status',
                     label: 'Status',
                     options: [
                         { label: 'Active', value: 'active' },
                         { label: 'Suspended', value: 'suspended' }
                     ]
                 }
             ]}
          />
       </Card>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-white dark:bg-surface-dark p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary dark:text-white">Create New Admin</h2>
                    <button onClick={() => setShowCreateModal(false)} className="text-text-tertiary hover:text-text-primary"><X className="h-5 w-5"/></button>
                </div>
                {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>}
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input label="Username" required value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                    <Input label="Password" type="password" required value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <div>
                        <label className="text-sm font-medium text-text-secondary block mb-1">Role</label>
                        <select 
                            className="w-full h-10 rounded-lg border border-border-light bg-background-light px-3 text-sm dark:bg-background-dark dark:border-border-dark dark:text-white"
                            value={formData.role || 'admin'}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="admin">Normal Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Admin'}</Button>
                    </div>
                </form>
            </Card>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-white dark:bg-surface-dark p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary dark:text-white">Edit Admin: {selectedAdmin.username}</h2>
                    <button onClick={() => setShowEditModal(false)} className="text-text-tertiary hover:text-text-primary"><X className="h-5 w-5"/></button>
                </div>
                {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>}
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary block mb-1">Status</label>
                        <select 
                            className="w-full h-10 rounded-lg border border-border-light bg-background-light px-3 text-sm dark:bg-background-dark dark:border-border-dark dark:text-white"
                            value={formData.status || 'active'}
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary block mb-1">Role</label>
                        <select 
                            className="w-full h-10 rounded-lg border border-border-light bg-background-light px-3 text-sm dark:bg-background-dark dark:border-border-dark dark:text-white"
                            value={formData.role || 'admin'}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="admin">Normal Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    {/* Security Code requirement for Super Admin Promotion */}
                    {formData.role === 'super_admin' && selectedAdmin.role !== 'super_admin' && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                             <div className="flex gap-2 items-start mb-2 text-yellow-800 dark:text-yellow-200 text-xs">
                                <Shield className="h-4 w-4 mt-0.5" />
                                <p>Super Admin promotion requires a security code.</p>
                             </div>
                             <Input 
                                placeholder="Enter Security Code"
                                type="password"
                                value={formData.securityCode || ''}
                                onChange={e => setFormData({...formData, securityCode: e.target.value})}
                                className="bg-white dark:bg-black"
                             />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </Card>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-white dark:bg-surface-dark p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary dark:text-white">Change Password</h2>
                    <button onClick={() => setShowPasswordModal(false)} className="text-text-tertiary hover:text-text-primary"><X className="h-5 w-5"/></button>
                </div>
                {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>}
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <p className="text-sm text-text-secondary">Changing password for <b>{selectedAdmin.username}</b></p>
                    <Input label="New Password" type="password" required value={formData.newPassword || ''} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</Button>
                    </div>
                </form>
            </Card>
        </div>
      )}

    </div>
  );
}
