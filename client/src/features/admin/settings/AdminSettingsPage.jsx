import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { settingsService } from './settingsService';
import { useSettings } from '../../../context/SettingsContext.jsx';

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { updateLocalSettings } = useSettings();

  const [settings, setSettings] = useState({

    support_email: '',
    contact_phone: '',
    contact_address: '',
    default_timezone: '',
    default_currency: 'USD',
    session_timeout: '',
    maintenance_mode: false,
    registration_enabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getSettings();
      setSettings({
        ...data,
        maintenance_mode: data.maintenance_mode ?? false,
        registration_enabled: data.registration_enabled ?? true
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Reset status on change
    if (success) setSuccess(false);
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const response = await settingsService.updateGeneralSettings(settings);
      setSettings(response.settings);
      updateLocalSettings(response.settings); // Update global context
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-2">General Settings</h1>
        <p className="text-text-secondary dark:text-gray-400">Configure basic platform information and defaults.</p>
      </div>

      <Card className="p-8 bg-white dark:bg-surface-dark shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-white mb-6">Platform Configuration</h2>
            
            {/* Removed max-w-2xl constraint to fix extra space on right */}
            <div className="space-y-6"> 
              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <p>Settings saved successfully!</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                
                <Input 
                  label="Support Email Address" 
                  name="support_email"
                  placeholder="support@launchpad.com" 
                  value={settings.support_email || ''} 
                  onChange={handleChange}
                />

                <Input 
                  label="Contact Phone" 
                  name="contact_phone"
                  placeholder="+1 (555) 000-0000" 
                  value={settings.contact_phone || ''} 
                  onChange={handleChange}
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Default Currency</label>
                  <select 
                    name="default_currency"
                    value={settings.default_currency || ''} 
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Contact Address</label>
                  <textarea 
                    name="contact_address"
                    rows="3"
                    className="w-full rounded-lg border border-border-light bg-background-light px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white"
                    placeholder="123 Startup St, Tech City, USA"
                    value={settings.contact_address || ''} 
                    onChange={handleChange}
                  />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Default Timezone</label>
                  <select 
                    name="default_timezone"
                    value={settings.default_timezone || ''} 
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white"
                  >
                    <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
                    <option value="PST (Pacific Standard Time)">PST (Pacific Standard Time)</option>
                    <option value="IST (India Standard Time)">IST (India Standard Time)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Session Timeout</label>
                  <select 
                    name="session_timeout"
                    value={settings.session_timeout || ''} 
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white"
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="8 hours">8 hours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="flex items-center justify-between p-4 border border-border-light dark:border-border-dark rounded-lg">
                    <div>
                        <h3 className="font-medium text-text-primary dark:text-white">Maintenance Mode</h3>
                        <p className="text-xs text-text-secondary">Disable site access for non-admins</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="maintenance_mode"
                        checked={settings.maintenance_mode} 
                        onChange={handleChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                 </div>

                 <div className="flex items-center justify-between p-4 border border-border-light dark:border-border-dark rounded-lg">
                    <div>
                        <h3 className="font-medium text-text-primary dark:text-white">Allow Registration</h3>
                        <p className="text-xs text-text-secondary">Allow new users to sign up</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="registration_enabled"
                        checked={settings.registration_enabled} 
                        onChange={handleChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                 </div>
              </div>

              <div className="pt-6 flex justify-end border-t border-border-light dark:border-border-dark mt-6">
                <Button size="lg" className="gap-2" onClick={handleSubmit} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
      </Card>

    </div>
  );
}