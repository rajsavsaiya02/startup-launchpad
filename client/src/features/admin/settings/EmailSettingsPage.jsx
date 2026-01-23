import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Server, 
  AtSign, 
  FileText,
  Send,
  Zap,
  Edit2,
  Plus,
  Trash2,
  Eye,
  Code,
  X
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { settingsService } from './settingsService';
import { useSettings } from '../../../context/SettingsContext';
import { useToast } from '../../../components/ui/Toast';

// Tabs Component for internal use
function Tabs({ activeTab, setActiveTab, tabs }) {
  return (
    <div className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-offset-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2
            ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary shadow'
                : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            {tab.icon}
            {tab.label}
          </div>
        </button>
      ))}
    </div>
  );
}

export function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const { updateLocalSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('provider');

  // Templates State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: '', type: '', subject: '', body: '', variables: [] });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Test Email Logic
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailData, setTestEmailData] = useState({ email: '', name: '' });
  const [sendingTest, setSendingTest] = useState(false);
  
  // Toast State
  const { addToast } = useToast();

  const [settings, setSettings] = useState({
    // Provider Config
    email_provider: 'smtp', 
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_secure: false,
    
    // API Keys (if not SMTP)
    mail_api_key: '',
    mail_domain: '',
    
    // Identities
    system_email_name: '',
    system_email_address: '',
    support_email_name: '',
    support_email_address: '',
    marketing_email_name: '',
    marketing_email_address: '',
    
    // Global Settings
    email_footer_text: '',
    enable_marketing_emails: true
  });

  useEffect(() => {
    fetchSettings();
    if (activeTab === 'templates') {
        fetchTemplates();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getSettings();
      setSettings(prev => ({ 
        ...prev, 
        ...data,
        smtp_secure: data.smtp_secure ?? false,
        enable_marketing_emails: data.enable_marketing_emails ?? true
      }));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      if (activeTab === 'provider') setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
      try {
          const data = await settingsService.getEmailTemplates();
          setTemplates(data);
      } catch (err) {
          console.error("Failed to fetch templates", err);
      }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (success) setSuccess(false);
    if (error) setError(null);
  };

  // Hardcoded Defaults for "Working" Connection
  useEffect(() => {
      // If we have loaded settings, ensure SMTP defaults are present if empty
      // This ensures the "Test Connection" works out of the box for the demo.
      if (!loading && settings.email_provider) {
          setSettings(prev => ({
              ...prev,
              email_provider: 'smtp', // Force SMTP
              smtp_host: prev.smtp_host || 'mail.cyberinfospace.com',
              smtp_port: prev.smtp_port || '465',
              smtp_user: prev.smtp_user || 'startuplaunchpad@cyberinfospace.com',
              smtp_password: prev.smtp_password || '@Startup2026',
              smtp_secure: true // Port 465 requires SSL/TLS
          }));
      }
  }, [loading]);



  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const response = await settingsService.updateEmailSettings(settings);
      setSettings(prev => ({ ...prev, ...response.settings }));
      updateLocalSettings(response.settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const response = await settingsService.testEmailConnection(settings);
      
      if (response.success) {
        setTestResult({ success: true, message: response.message });
      } else {
        setTestResult({ success: false, message: response.message || 'Connection failed.' });
      }

      setTimeout(() => setTestResult(null), 5000);
    } catch (err) {
      setTestResult({ success: false, message: err.response?.data?.message || 'Connection failed: Server did not respond.' });
    } finally {
      setTesting(false);
    }
  };

  // Template Handlers

  const handleCreateNew = () => {
      setSelectedTemplate(null);
      setIsCreating(true);
      setTemplateForm({ 
          name: '', 
          type: '', 
          subject: '', 
          body: '<p>Start writing your email content here...</p>', 
          variables: [] 
      });
      setPreviewMode(false);
  };

  const handleTemplateSelect = (template) => {
      setSelectedTemplate(template);
      setIsCreating(false);
      setTemplateForm({ ...template });
      setPreviewMode(false);
  };

  const handleTemplateSave = async () => {
      try {
          setSavingTemplate(true);
          
          if (isCreating) {
             const newTemplate = await settingsService.createEmailTemplate(templateForm);
             setTemplates(prev => [...prev, newTemplate]);
             setSelectedTemplate(newTemplate);
             setIsCreating(false);
          } else {
             const updated = await settingsService.updateEmailTemplate(selectedTemplate.id, templateForm);
             setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
             setSelectedTemplate(updated);
          }
           setSuccess(true);
           setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
          console.error("Failed to save template", err);
          setError(err.response?.data?.message || "Failed to save template");
      } finally {
          setSavingTemplate(false);
      }
  };

  const handleTemplateDelete = async () => {
      if (!selectedTemplate || isCreating) return;
      if (!window.confirm("Are you sure you want to delete this template?")) return;

      try {
          setDeletingTemplate(true);
          await settingsService.deleteEmailTemplate(selectedTemplate.id);
          setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
          setSelectedTemplate(null);
      } catch (err) {
           console.error("Failed to delete template", err);
           setError("Failed to delete template");
      } finally {
          setDeletingTemplate(false);
      }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailData.email) return;
    try {
        setSendingTest(true);
        await settingsService.sendTestEmailTemplate(selectedTemplate.id, testEmailData);
        addToast('Test email sent successfully!', 'success');
        setShowTestModal(false);
        setTestEmailData({ email: '', name: '' });
    } catch (err) {
        console.error('Failed to send test email', err);
        addToast('Failed to send test email: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
        setSendingTest(false);
    }
  };

  const insertVariable = (variable) => {
      const variableTag = `{{${variable}}}`;
      setTemplateForm(prev => ({ ...prev, body: prev.body + variableTag }));
  };

  const getPreviewHtml = () => {
      return `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${templateForm.subject}</h2>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            ${templateForm.body}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">${settings.email_footer_text || '© 2024 Your Company'}</p>
        </div>
      `;
  };

  const tabs = [
    { id: 'provider', label: 'Provider & Config', icon: <Server className="h-4 w-4" /> },
    { id: 'identities', label: 'Sender Identities', icon: <AtSign className="h-4 w-4" /> },
    { id: 'templates', label: 'Templates', icon: <FileText className="h-4 w-4" /> },
  ];

  if (loading && Object.keys(settings).length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto relative">
      
      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-md p-6 relative">
                 <button onClick={() => setShowTestModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                     <X className="h-5 w-5" />
                 </button>
                 <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2">
                     <Send className="h-5 w-5 text-primary" />
                     Send Test Email
                 </h3>
                 <p className="text-sm text-text-secondary dark:text-gray-400 mb-6">
                     Send a test version of <strong>{selectedTemplate?.name}</strong> to verify the design and variables.
                 </p>
                 <div className="space-y-4">
                     <Input 
                        label="Recipient Name"
                        placeholder="John Doe"
                        value={testEmailData.name}
                        onChange={(e) => setTestEmailData(prev => ({ ...prev, name: e.target.value }))}
                     />
                     <Input 
                        label="Recipient Email"
                        placeholder="john@example.com"
                        value={testEmailData.email}
                        onChange={(e) => setTestEmailData(prev => ({ ...prev, email: e.target.value }))}
                     />
                     <div className="flex justify-end gap-3 mt-6">
                         <Button variant="outline" onClick={() => setShowTestModal(false)}>Cancel</Button>
                         <Button onClick={handleSendTestEmail} disabled={sendingTest || !testEmailData.email} className="gap-2">
                             {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                             Send Test
                         </Button>
                     </div>
                 </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-2">Email Settings</h1>
          <p className="text-text-secondary dark:text-gray-400">Configure email providers, sender identities, and templates.</p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" onClick={handleTestConnection} disabled={testing} className="gap-2">
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Test Connection
             </Button>
             <Button onClick={handleSubmit} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
             </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <p>Operation successful!</p>
        </div>
      )}
      
      {testResult && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${testResult.success ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
          {testResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p>{testResult.message}</p>
        </div>
      )}

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

      {/* Content */}
      <div className="space-y-6">
        
        {/* PROVIDER TAB */}
        {activeTab === 'provider' && (
          <Card className="p-8 bg-white dark:bg-surface-dark shadow-sm space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Mail Service Provider</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {['smtp', 'sendgrid', 'ses', 'postmark'].map((provider) => (
                        <div 
                            key={provider}
                            // onClick={() => setSettings(prev => ({ ...prev, email_provider: provider }))} // Disabled switching
                            className={`
                                rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all
                                ${settings.email_provider === provider 
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10 cursor-default' 
                                    : 'border-transparent bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed grayscale'}
                            `}
                            title={provider !== 'smtp' ? 'Currently Disabled' : ''}
                        >
                            <Mail className={`h-6 w-6 ${settings.email_provider === provider ? 'text-primary' : 'text-gray-400'}`} />
                            <span className={`font-medium ${settings.email_provider === provider ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
                                {provider.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>

                {settings.email_provider === 'smtp' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <Input 
                            label="SMTP Host" 
                            name="smtp_host"
                            placeholder="smtp.example.com" 
                            value={settings.smtp_host || ''} 
                            onChange={handleChange}
                        />
                         <Input 
                            label="SMTP Port" 
                            name="smtp_port"
                            placeholder="587" 
                            value={settings.smtp_port || ''} 
                            onChange={handleChange}
                        />
                         <Input 
                            label="SMTP Username" 
                            name="smtp_user"
                            placeholder="user@example.com" 
                            value={settings.smtp_user || ''} 
                            onChange={handleChange}
                        />
                         <Input 
                            label="SMTP Password" 
                            name="smtp_password"
                            type="password"
                            placeholder="••••••••" 
                            value={settings.smtp_password || ''} 
                            onChange={handleChange}
                        />
                        <div className="flex items-center gap-2 pt-2">
                             <input 
                                type="checkbox" 
                                id="smtp_secure"
                                name="smtp_secure"
                                checked={settings.smtp_secure} 
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                             />
                             <label htmlFor="smtp_secure" className="text-sm font-medium text-text-secondary">Use Secure Connection (SSL/TLS)</label>
                        </div>
                    </div>
                )}

                {settings.email_provider !== 'smtp' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <Input 
                            label="API Key" 
                            name="mail_api_key"
                            type="password"
                            placeholder={`Enter ${settings.email_provider.toUpperCase()} API Key`}
                            value={settings.mail_api_key || ''} 
                            onChange={handleChange}
                        />
                         <Input 
                            label="Sending Domain" 
                            name="mail_domain"
                            placeholder="launchpad.com" 
                            value={settings.mail_domain || ''} 
                            onChange={handleChange}
                        />
                     </div>
                )}
            </div>
          </Card>
        )}

        {/* IDENTITIES TAB */}
        {activeTab === 'identities' && (
          <div className="grid grid-cols-1 gap-6">
             {/* System Identity */}
             <Card className="p-6 bg-white dark:bg-surface-dark shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Server className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-primary dark:text-white">System Emails</h3>
                        <p className="text-sm text-text-secondary dark:text-gray-400 mb-6">Used for transactional emails like password resets, notifications, and alerts.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Input 
                                label="Sender Name" 
                                name="system_email_name"
                                value={settings.system_email_name || ''} 
                                onChange={handleChange}
                            />
                             <Input 
                                label="From Address" 
                                name="system_email_address"
                                placeholder="no-reply@..."
                                value={settings.system_email_address || ''} 
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
             </Card>

             {/* Support Identity */}
             <Card className="p-6 bg-white dark:bg-surface-dark shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-primary dark:text-white">Support Emails</h3>
                        <p className="text-sm text-text-secondary dark:text-gray-400 mb-6">Used for help desk replies and support ticket confirmations.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Input 
                                label="Sender Name" 
                                name="support_email_name"
                                value={settings.support_email_name || ''} 
                                onChange={handleChange}
                            />
                             <Input 
                                label="From Address" 
                                name="support_email_address"
                                placeholder="support@..."
                                value={settings.support_email_address || ''} 
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
             </Card>

             {/* Marketing Identity */}
             <Card className="p-6 bg-white dark:bg-surface-dark shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <Send className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-lg font-semibold text-text-primary dark:text-white">Marketing Emails</h3>
                             <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    name="enable_marketing_emails"
                                    checked={settings.enable_marketing_emails} 
                                    onChange={handleChange}
                                    className="sr-only peer" 
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                             </div>
                        </div>
                        <p className="text-sm text-text-secondary dark:text-gray-400 mb-6">Used for newsletters, product updates, and promotional campaigns.</p>
                        
                        {settings.enable_marketing_emails ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                <Input 
                                    label="Sender Name" 
                                    name="marketing_email_name"
                                    value={settings.marketing_email_name || ''} 
                                    onChange={handleChange}
                                />
                                <Input 
                                    label="From Address" 
                                    name="marketing_email_address"
                                    placeholder="news@..."
                                    value={settings.marketing_email_address || ''} 
                                    onChange={handleChange}
                                />
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500 text-center italic">
                                Marketing emails are currently disabled.
                            </div>
                        )}
                    </div>
                </div>
             </Card>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Template List */}
             <Card className="col-span-1 p-0 overflow-hidden bg-white dark:bg-surface-dark shadow-sm">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary dark:text-white">Email Templates</h3>
                    <Button size="xs" variant="outline" onClick={handleCreateNew} title="Create New Template">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
                    {templates.map((template) => (
                        <div 
                            key={template.id} 
                            onClick={() => handleTemplateSelect(template)}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors flex items-center justify-between group ${selectedTemplate?.id === template.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                            <span className={`text-sm font-medium ${selectedTemplate?.id === template.id ? 'text-primary' : 'text-text-secondary dark:text-gray-300'} group-hover:text-primary`}>
                                {template.name}
                            </span>
                            <Edit2 className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div className="p-8 text-center text-sm text-gray-500">
                            No templates found.
                        </div>
                    )}
                </div>
             </Card>

             {/* Template Editor */}
             <Card className="col-span-1 lg:col-span-2 p-6 bg-white dark:bg-surface-dark shadow-sm min-h-[600px] flex flex-col">
                 {selectedTemplate || isCreating ? (
                     <div className="flex flex-col h-full gap-4">
                         {/* Editor Header */}
                         <div className="flex items-center justify-between mb-2">
                             <div>
                                 {isCreating ? (
                                    <Input 
                                        placeholder="Template Name (e.g., Weekly Newsletter)" 
                                        className="h-9 w-64 text-lg font-semibold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-gray-300"
                                        value={templateForm.name}
                                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                                        autoFocus
                                    />
                                 ) : (
                                    <h3 className="text-lg font-semibold text-text-primary dark:text-white">{selectedTemplate.name}</h3>
                                 )}
                                 
                                 {isCreating ? (
                                     <Input 
                                        placeholder="Template Type Code (e.g., newsletter_weekly)" 
                                        className="h-6 w-64 text-xs mt-1 border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-gray-300 font-mono"
                                        value={templateForm.type}
                                        onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                                     />
                                 ) : (
                                     <p className="text-xs text-text-secondary font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded w-fit mt-1">{selectedTemplate.type}</p>
                                 )}
                             </div>
                             
                             <div className="flex items-center gap-2">
                                 <button 
                                    onClick={() => setPreviewMode(!previewMode)} 
                                    className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95"
                                    title={previewMode ? "Edit Mode" : "Preview Mode"}
                                 >
                                     {previewMode ? <Code className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                 </button>
                                 
                                 {!isCreating && (
                                     <button 
                                        onClick={() => setShowTestModal(true)} 
                                        className="p-2.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all hover:scale-105 active:scale-95"
                                        title="Send Test Email"
                                     >
                                         <Send className="h-5 w-5" />
                                     </button>
                                 )}

                                 <button 
                                    onClick={handleTemplateSave} 
                                    disabled={savingTemplate}
                                    className="p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                    title={isCreating ? "Create Template" : "Save Changes"}
                                 >
                                     {savingTemplate ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                 </button>

                                 {!isCreating && (
                                     <button 
                                        onClick={handleTemplateDelete} 
                                        disabled={deletingTemplate}
                                        className="p-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                        title="Delete Template"
                                     >
                                        {deletingTemplate ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                     </button>
                                 )}
                             </div>
                         </div>
                         
                         {/* Subject */}
                         <div>
                             <Input 
                                label="Subject Line"
                                value={templateForm.subject}
                                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                                disabled={previewMode}
                             />
                         </div>
                         
                         {/* Editor/Preview Area */}
                         <div className="flex-1 flex flex-col min-h-[400px]">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-text-secondary">Content</label>
                                {!previewMode && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Insert Variable:</span>
                                        {['name', 'email', 'otp', 'link'].map(v => (
                                            <button 
                                                key={v}
                                                onClick={() => insertVariable(v)}
                                                className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors text-primary font-mono"
                                            >
                                                {`{{${v}}}`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {previewMode ? (
                                <div className="flex-1 w-full rounded-lg border border-border-light bg-white dark:bg-black p-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
                                    <div dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
                                </div>
                            ) : (
                                <textarea 
                                    className="flex-1 w-full rounded-lg border border-border-light bg-background-light px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white font-mono leading-relaxed"
                                    value={templateForm.body}
                                    onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                                    placeholder="Enter HTML content..."
                                    style={{ resize: 'none' }}
                                />
                            )}
                         </div>
                     </div>
                 ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">Select a Template</h3>
                        <p className="text-sm text-text-secondary dark:text-gray-400 max-w-sm mb-6">
                            Choose a template from the list to edit, or create a new one.
                        </p>
                        <Button onClick={handleCreateNew} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create New Template
                        </Button>
                     </div>
                 )}
             </Card>
          </div>
        )}



      </div>
    </div>
  );
}
