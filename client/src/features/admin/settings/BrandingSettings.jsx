import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, Palette } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { ImageUpload } from '../../../components/ui/ImageUpload';
import { settingsService } from './settingsService';
import { useSettings } from '../../../context/SettingsContext';

const BrandingSettings = () => {
    const { settings: globalSettings, updateLocalSettings, loading: contextLoading } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Local state for the form
    const [settings, setSettings] = useState({
        platform_name: '',
        logo_url: '',
        favicon_url: '',
        primary_color: '#228be6',
        secondary_color: '#15aabf',
        accent_color: '#fd7e14'
    });

    // Load settings from global context or defaults
    useEffect(() => {
        if (globalSettings) {
             setSettings(prev => ({
                ...prev,
                platform_name: globalSettings.platform_name || 'Startup LaunchPad',
                logo_url: globalSettings.logo_url || '/branding/logo.png',
                favicon_url: globalSettings.favicon_url || '/branding/favicon.png',
                primary_color: globalSettings.primary_color || '#228be6',
                secondary_color: globalSettings.secondary_color || '#15aabf',
                accent_color: globalSettings.accent_color || '#fd7e14'
            }));
            setLoading(false);
        }
    }, [globalSettings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
        if (success) setSuccess(false);
        if (error) setError(null);
    };

    // Handler for ImageUpload components
    const handleImageChange = (field, file) => {
        // If it's a file object, we need to upload it. 
        // If it's null (cleared), we set url to empty.
        // For the 'value' prop of ImageUpload, it expects an initial URL.
        // ImageUpload passes back a File object on change.
        
        // We'll handle the upload immediately for simplicity, or we could wait for save.
        // The previous implementation uploaded immediately. Let's stick to that pattern 
        // effectively, but ImageUpload usually returns a File.
        
        // Wait, ImageUpload component in this project returns a FILE object.
        // We need to upload this file to get a URL to store in settings.
        if (file) {
            uploadImage(field, file);
        } else {
            setSettings(prev => ({ ...prev, [field]: '' }));
        }
    };

    const uploadImage = async (field, file) => {
        try {
            // Optimistic UI or Loading state for image? 
            // The ImageUpload component shows preview.
            // We just need to get the URL.
            const result = await settingsService.uploadBrandingImage(file);
            if (result.file && result.file.url) {
                setSettings(prev => ({ ...prev, [field]: result.file.url }));
            }
        } catch (err) {
            console.error('Image upload failed:', err);
            setError(`Failed to upload ${field.replace('_url', '')}.`);
        }
    };

    const handleSubmit = async () => {
        if (settings.platform_name.trim().length < 2) {
            setError('Platform name is required (min 2 chars)');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            // Only send branding fields
            const payload = { 
                platform_name: settings.platform_name,
                logo_url: settings.logo_url,
                favicon_url: settings.favicon_url,
                primary_color: settings.primary_color,
                secondary_color: settings.secondary_color,
                accent_color: settings.accent_color
            };
            
            const response = await settingsService.updateBrandingSettings(payload);
            
            // Use server response to ensure we have the authoritative state
            if (response.settings) {
                updateLocalSettings(response.settings);
                setSettings(prev => ({
                    ...prev,
                    platform_name: response.settings.platform_name || prev.platform_name,
                    primary_color: response.settings.primary_color || prev.primary_color,
                    secondary_color: response.settings.secondary_color || prev.secondary_color,
                    accent_color: response.settings.accent_color || prev.accent_color,
                    logo_url: response.settings.logo_url || prev.logo_url,
                    favicon_url: response.settings.favicon_url || prev.favicon_url
                }));
            } else {
                 // Fallback if response structure is different (though it should match AdminSettingsPage)
                 updateLocalSettings(settings);
            }

            setSuccess(true);
            
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
             console.error('Failed to update settings:', err);
             setError(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading || contextLoading) {
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
                <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-2">Branding Configuration</h1>
                <p className="text-text-secondary dark:text-gray-400">Manage your platform's identity, visual assets, and color scheme.</p>
            </div>

            <Card className="p-8 bg-white dark:bg-surface-dark shadow-sm space-y-8">
                <div>
                   
                    {/* Feedback Messages */}
                    <div className="space-y-4 mb-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                <p>{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <p>Branding settings updated successfully!</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        {/* LEFT COLUMN: Identity & Colors */}
                        <div className="md:col-span-12 lg:col-span-5 space-y-8">
                             {/* Platform Identity */}
                             <section className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-border-light dark:border-border-dark">
                                    <h2 className="text-lg font-semibold text-text-primary dark:text-white">Platform Identity</h2>
                                </div>
                                <Input
                                    label="Platform Name"
                                    name="platform_name"
                                    placeholder="e.g. Startup LaunchPad"
                                    value={settings.platform_name || ''}
                                    onChange={handleChange}
                                    description="Appears in the browser tab and header"
                                />
                             </section>

                            {/* Color Scheme */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-border-light dark:border-border-dark">
                                    <h2 className="text-lg font-semibold text-text-primary dark:text-white flex items-center gap-2">
                                        <Palette className="h-4 w-4 text-primary" /> Color Scheme
                                    </h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <ColorPickerInput 
                                        label="Primary Color" 
                                        name="primary_color"
                                        value={settings.primary_color}
                                        onChange={handleChange}
                                        description="Main brand color (Buttons, Links)"
                                    />
                                    <ColorPickerInput 
                                        label="Secondary Color" 
                                        name="secondary_color"
                                        value={settings.secondary_color}
                                        onChange={handleChange}
                                        description="Secondary actions and backgrounds"
                                    />
                                    <ColorPickerInput 
                                        label="Accent Color" 
                                        name="accent_color"
                                        value={settings.accent_color}
                                        onChange={handleChange}
                                        description="Highlights and warnings"
                                    />
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Visual Assets */}
                        <div className="md:col-span-12 lg:col-span-7 space-y-8">
                             <section className="space-y-6 h-full">
                                <div className="flex items-center gap-2 pb-2 border-b border-border-light dark:border-border-dark">
                                    <h2 className="text-lg font-semibold text-text-primary dark:text-white">Visual Assets</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary dark:text-white">Platform Logo</label>
                                        <p className="text-xs text-text-secondary mb-2">Displayed in the navigation bar. Recommended: 200x50px PNG/SVG.</p>
                                        <ImageUpload 
                                            value={settings.logo_url}
                                            onChange={(file) => handleImageChange('logo_url', file)}
                                            aspect={4/1}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary dark:text-white">Favicon</label>
                                        <p className="text-xs text-text-secondary mb-2">Browser tab icon. Recommended: 512x512px PNG (Transparent) or SVG for best SEO & Retina display support.</p>
                                        <ImageUpload 
                                            value={settings.favicon_url}
                                            onChange={(file) => handleImageChange('favicon_url', file)}
                                            aspect={1}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                             </section>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end border-t border-border-light dark:border-border-dark mt-8">
                        <Button size="lg" className="gap-2" onClick={handleSubmit} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>

                </div>
            </Card>
        </div>
    );
};

const ColorPickerInput = ({ label, name, value, onChange, description }) => {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">{label}</label>
            <div className="flex gap-2">
                <div className="relative w-12 h-11 flex-shrink-0 overflow-hidden rounded-lg border border-border-light dark:border-border-dark shadow-sm">
                    <input 
                        type="color" 
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer border-0 p-0 m-0"
                    />
                </div>
                <div className="flex-grow">
                    <input
                        type="text"
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white font-mono uppercase"
                        placeholder="#000000"
                    />
                </div>
            </div>
            {description && <p className="text-xs text-text-tertiary">{description}</p>}
        </div>
    );
};

export default BrandingSettings;
