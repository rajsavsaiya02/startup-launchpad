import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuth = async () => {
        try {
            const response = await apiClient.get('/auth/check-session');
            if (response.data.isAuthenticated) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Session check failed', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        // Capture role before clearing user state
        const isAdmin = user && user.role === 'admin';

        try {
            if (isAdmin) {
                await apiClient.post('/admin/logout');
            } else {
                await apiClient.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            // Always clear local state and redirect
            setUser(null);
            if (isAdmin) {
                navigate('/admin/login');
            } else {
                navigate('/auth/login');
            }
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        checkAuth,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
