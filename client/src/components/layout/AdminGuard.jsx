import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminGuard() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-gray-500">Checking permissions...</div>
            </div>
        );
    }

    // Check if authenticated AND has admin role
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
        return <Outlet />;
    }

    // Redirect non-admins to admin login (or home if preferred)
    return <Navigate to="/admin/login" replace />;
}
