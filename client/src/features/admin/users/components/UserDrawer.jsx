import React, { useState } from 'react';
import { X, Shield, Clock, Mail, Building, Activity, Trash2, Lock, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Avatar } from '../../../../components/ui/Avatar';
import { Badge } from '../../../../components/ui/Badge';
import { adminUserService } from '../../../../services/adminUserService';
import { toast } from 'react-toastify';

export function UserDrawer({ user, onClose, isOpen, onUpdate }) {
  const [loadingAction, setLoadingAction] = useState(null);

  if (!isOpen || !user) return null;

  const isSuspended = user.status === 'suspended';

  const handleToggleStatus = async () => {
    try {
      setLoadingAction('status');
      const newStatus = isSuspended ? 'active' : 'suspended';
      await adminUserService.updateUserStatus(user.id, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm("Are you sure you want to reset this user's password? A new random password will be generated.")) return;
    
    try {
      setLoadingAction('password');
      const res = await adminUserService.resetUserPassword(user.id);
      
      // In a real system, send email. Here we show it for admin to copy for demo purposes.
      toast.success(
        <div>
            <p>Password reset successfully!</p>
            <p className="mt-1 font-mono bg-gray-100 p-1 rounded text-black text-xs">{res.generatedPassword}</p>
        </div>,
        { autoClose: 10000 }
      );
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to completely delete this user? This action cannot be undone and will delete associated data!")) return;
    
    try {
      setLoadingAction('delete');
      await adminUserService.deletePlatformUser(user.id);
      toast.success('User deleted successfully');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
       // Display meaningful error (e.g., constraint violations)
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoadingAction(null);
    }
  };

  const joinedDate = new Date(user.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const lastActiveDate = user.last_active 
    ? new Date(user.last_active).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Never';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-border-light dark:border-border-dark flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-start">
          <div className="flex flex-col items-center w-full mt-4">
            <Avatar src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} size="xl" className="h-24 w-24 mb-4 ring-4 ring-background-light dark:ring-background-dark" />
            <h2 className="text-2xl font-bold text-text-primary dark:text-white text-center">{user.name || 'Unknown'}</h2>
            <p className="text-text-secondary dark:text-gray-400 text-center">{user.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant={user.status === 'active' ? 'success' : 'error'} className="capitalize">{user.status || 'Active'}</Badge>
              <Badge variant="neutral" className="capitalize">{user.role?.replace('_', ' ')}</Badge>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* User Details */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-text-primary dark:text-white">User Information</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-4 border border-border-light dark:border-border-dark">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-text-tertiary">Organization</span>
                <span className="col-span-2 font-medium text-text-primary dark:text-white">{user.organization || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-text-tertiary">Last Active</span>
                <span className="col-span-2 font-medium text-text-primary dark:text-white">{lastActiveDate}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-text-tertiary">Joined On</span>
                <span className="col-span-2 font-medium text-text-primary dark:text-white">{joinedDate}</span>
              </div>
            </div>
          </section>

          {/* Admin Actions */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-text-primary dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Admin Actions
            </h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={handleResetPassword}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'password' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Reset Password
              </Button>

              <Button 
                variant="outline" 
                className={`w-full justify-start gap-3 ${isSuspended ? 'text-success border-success/30 hover:bg-success/10' : 'text-warning border-warning/30 hover:bg-warning/10'}`}
                onClick={handleToggleStatus}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'status' ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSuspended ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />)}
                {isSuspended ? 'Activate Account' : 'Suspend Account'}
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-3"
                onClick={handleDelete}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete User
              </Button>
            </div>
          </section>

          {/* Recent Activity Log (Placeholder since backend logic is extensive to retrieve this per user) */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-text-primary dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-text-tertiary" /> Recent Activity (Mock)
            </h3>
            <ul className="space-y-4 relative pl-4 border-l-2 border-border-light dark:border-border-dark opacity-50">
              {[
                { action: "Account created", time: joinedDate },
                { action: "Last logged in", time: lastActiveDate }
              ].map((log, i) => (
                <li key={i} className="relative">
                  <div className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-border-light dark:bg-border-dark border-2 border-white dark:border-background-dark"></div>
                  <p className="text-sm text-text-secondary dark:text-gray-300">{log.action}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{log.time}</p>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </aside>
    </>
  );
}