import { apiClient } from '../../../lib/axios';

export const adminUsersService = {
  getAllAdmins: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  createAdmin: async (data) => {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },

  updateAdmin: async (id, data) => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  changePassword: async (id, newPassword) => {
    const response = await apiClient.put(`/admin/users/${id}/password`, { newPassword });
    return response.data;
  },

  deleteAdmin: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  }
};
