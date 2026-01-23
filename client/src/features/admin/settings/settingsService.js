import { apiClient } from '../../../lib/axios';

export const settingsService = {
  getSettings: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  // Specific Update Methods
  updateBrandingSettings: async (settings) => {
    const response = await apiClient.put('/settings/branding', settings);
    return response.data;
  },

  updateGeneralSettings: async (settings) => {
    const response = await apiClient.put('/settings/general', settings);
    return response.data;
  },

  updateEmailSettings: async (settings) => {
    const response = await apiClient.put('/settings/email', settings);
    return response.data;
  },

  // Deprecated
  updateSettings: async (settings) => {
    // Ideally shouldn't be used anymore, but for safety in case I missed a spot
    console.warn('Using deprecated updateSettings. Please migrate to specific update methods.');
    // Fallback to general if someone calls this? Or error?
    // Let's just log it. The backend route might still be there if I didn't comment it out? 
    // I commented it out in routes. So this will fail if called. 
    // I should probably remove this method or map it to one of the others? 
    // But it's better to update the callers. Consuming code will be updated.
    throw new Error("Deprecated: Use updateBrandingSettings, updateGeneralSettings, or updateEmailSettings");
  },

  testEmailConnection: async (config) => {
    // This endpoint will be implemented on the backend to test SMTP/API connection
    const response = await apiClient.post('/settings/email/test', config);
    return response.data;
  },

  uploadBrandingImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', 'public'); // Branding images should be public
    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Email Templates
  getEmailTemplates: async () => {
    const response = await apiClient.get('/settings/email/templates');
    return response.data;
  },

  getEmailTemplateById: async (id) => {
    const response = await apiClient.get(`/settings/email/templates/${id}`);
    return response.data;
  },

  updateEmailTemplate: async (id, data) => {
    const response = await apiClient.put(`/settings/email/templates/${id}`, data);
    return response.data;
  },

  createEmailTemplate: async (data) => {
    const response = await apiClient.post('/settings/email/templates', data);
    return response.data;
  },

  deleteEmailTemplate: async (id) => {
    const response = await apiClient.delete(`/settings/email/templates/${id}`);
    return response.data;
  },

  sendTestEmailTemplate: async (id, data) => {
      const response = await apiClient.post(`/settings/email/templates/${id}/test`, data);
      return response.data;
  }
};

