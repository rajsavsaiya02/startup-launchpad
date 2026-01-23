import { apiClient } from '../../../lib/axios';

export const auditService = {
  getLogs: async (params) => {
    const response = await apiClient.get('/admin/audit', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/admin/audit/stats');
    return response.data;
  },

  getSystemLogs: async (type, page = 1, limit = 10, search = '', date = '') => {
    const response = await apiClient.get('/admin/system/logs', { 
        params: { type, page, limit, search, date } 
    });
    return response.data; // Returns { logs, total, page, pages }
  },

  getActivePorts: async () => {
    const response = await apiClient.get('/admin/system/ports');
    return response.data;
  }
};
