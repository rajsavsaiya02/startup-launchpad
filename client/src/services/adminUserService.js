import { apiClient } from '../lib/axios';

export const adminUserService = {
    /**
     * Get all platform users with optional search, status, and role filters
     */
    getPlatformUsers: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.role) params.append('role', filters.role);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await apiClient.get(`/admin/platform-users?${params.toString()}`);
        return response.data;
    },

    /**
     * Create a new platform user
     */
    createPlatformUser: async (userData) => {
        const response = await apiClient.post('/admin/platform-users', userData);
        return response.data;
    },

    /**
     * Update a user's status (active/suspended)
     */
    updateUserStatus: async (userId, status) => {
        const response = await apiClient.put(`/admin/platform-users/${userId}/status`, { status });
        return response.data;
    },

    /**
     * Reset a user's password
     */
    resetUserPassword: async (userId, newPassword = null) => {
        const payload = newPassword ? { newPassword } : {};
        const response = await apiClient.put(`/admin/platform-users/${userId}/password`, payload);
        return response.data;
    },

    /**
     * Delete a platform user
     */
    deletePlatformUser: async (userId) => {
        const response = await apiClient.delete(`/admin/platform-users/${userId}`);
        return response.data;
    }
};
