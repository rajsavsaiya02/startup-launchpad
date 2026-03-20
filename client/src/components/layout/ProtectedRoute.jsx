import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export function ProtectedRoute() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const { settings, loading: settingsLoading } = useSettings();

    if (isLoading || settingsLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-gray-500">Verifying access...</div>
            </div>
        );
    }

    if (isAuthenticated) {
        if (user?.role === 'admin' || user?.role === 'super_admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        
        // Block normal users if maintenance mode is enabled
        if (settings?.maintenance_mode) {
            return <Navigate to="/upcoming" replace />;
        }

        return <Outlet />;
    }

    return <Navigate to="/auth/login" replace />;
}
