import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function PublicAuthGuard() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                {/* Simple spinner could go here */}
                <div className="text-gray-500">Checking session...</div>
            </div>
        );
    }

    if (user) {
        // Redirect based on role
        if (user.role === 'admin' || user.role === 'super_admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
