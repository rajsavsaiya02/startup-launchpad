import { apiClient } from '../lib/axios';

export const adminOrgService = {
  /**
   * Get all platform organizations with optional search and status filters
   */
  getOrganizations: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiClient.get(`/admin/organizations?${params.toString()}`);
    return response.data;
  },

  /**
   * Update an organization's status: 'active' | 'under_review' | 'suspended'
   * All member data is preserved — this only controls access.
   */
  updateOrgStatus: async (orgId, status) => {
    const response = await apiClient.put(`/admin/organizations/${orgId}/status`, { status });
    return response.data;
  }
};
