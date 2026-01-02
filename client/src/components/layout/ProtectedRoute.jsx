import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

export function ProtectedRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

    useEffect(() => {
        const verifySession = async () => {
            try {
                await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true });
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        verifySession();
    }, []);

    if (isAuthenticated === null) {
        // specific spinner or loading state
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-gray-500">Verifying access...</div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
}
