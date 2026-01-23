import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
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
        return <Outlet />;
    }

    return <Navigate to="/auth/login" replace />;
}
