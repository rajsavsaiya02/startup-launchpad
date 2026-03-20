import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { settingsService } from '../features/admin/settings/settingsService';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    useEffect(() => {
        console.log("[DEBUG] SettingsProvider: MOUNTED");
        return () => console.log("[DEBUG] SettingsProvider: UNMOUNTED");
    }, []);
    const [settings, setSettings] = useState({
        platform_name: 'Startup LaunchPad',
        support_email: 'support@launchpad.com',
        contact_phone: '',
        contact_address: '',
        default_timezone: 'UTC',
        default_currency: 'USD',
        maintenance_mode: false,
        registration_enabled: true,
        logo_url: '/assets/logo.png', // Default logo path
        favicon_url: '/favicon.ico',
        primary_color: '#228be6', // Default Mantine blue
        secondary_color: '#868e96',
        accent_color: '#f03e3e'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // If this fails (e.g. 401 or network error), we stick to defaults
                // or we could retry. For public pages it might fail if API is protected?
                // Wait, per my walkthrough API is protected by verifyAdminToken?
                // If it is, then public pages (Login, Landing) cannot fetch it.
                // Uh oh. The user wants "Startup LaunchPad" everywhere to be dynamic.
                // This implies the GET /api/settings endpoint should likely be PUBLIC
                // so that the Login page can show the correct Platform Name.
                // I will need to update the backend route to allow public access for GET.
                
                console.log("[DEBUG] SettingsProvider: Fetching settings...");
                const data = await settingsService.getSettings();
                console.log("[DEBUG] SettingsProvider: Settings received:", data);
                if (data) {
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.warn('Failed to fetch settings (using defaults):', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Function to update settings locally (optimistic) or re-fetch
    const updateLocalSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    // Dynamically update document title and favicon
    useEffect(() => {
        if (settings.platform_name) {
            document.title = `${settings.platform_name} | Build. Scale. Succeed.`;
        }

        if (settings.favicon_url) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = settings.favicon_url;
        }
    }, [settings.platform_name, settings.favicon_url]);

    const value = useMemo(() => ({ settings, loading, updateLocalSettings }), [settings, loading]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
