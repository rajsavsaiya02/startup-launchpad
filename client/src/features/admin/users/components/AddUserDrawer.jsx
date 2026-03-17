import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { adminUserService } from '../../../../services/adminUserService';
import { toast } from 'react-toastify';

export function AddUserDrawer({ isOpen, onClose, onUserAdded }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'normal_user',
    password: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminUserService.createPlatformUser(formData);
      toast.success('User created successfully');
      setFormData({ name: '', email: '', role: 'normal_user', password: '' });
      if (onUserAdded) onUserAdded();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Add New User
            </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary dark:text-white" htmlFor="name">Full Name</label>
                    <Input 
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary dark:text-white" htmlFor="email">Email Address</label>
                    <Input 
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary dark:text-white" htmlFor="role">Role</label>
                    <select 
                        id="role"
                        name="role"
                        className="w-full h-10 px-3 rounded-md border border-border-light bg-background-light text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none cursor-pointer"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="normal_user">Normal User</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="student">Student</option>
                        <option value="founder">Founder</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary dark:text-white" htmlFor="password">Initial Password</label>
                    <Input 
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Must be at least 8 characters"
                        minLength={8}
                    />
                </div>

                {/* Submit button wrapper */}
                <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Create User
                    </Button>
                </div>

            </form>
        </div>
      </aside>
    </>
  );
}
