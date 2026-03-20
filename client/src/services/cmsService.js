import { apiClient as axios } from '../lib/axios';

const CMS_API = '/cms'; // Based on routes/index.js mounting

export const cmsService = {
  // Public Access
  getPagePublic: async (slug) => {
    const response = await axios.get(`${CMS_API}/public/${slug}`);
    return response.data;
  },

  getPublicIndex: async () => {
    const response = await axios.get(`${CMS_API}/public-index`);
    return response.data;
  },

  // Admin Access
  getPages: async (params = {}) => {
    const response = await axios.get(`${CMS_API}/pages`, { params });
    return response.data;
  },

  createPage: async (data) => {
    const response = await axios.post(`${CMS_API}/pages`, data);
    return response.data;
  },

  getPageAdmin: async (id) => {
    const response = await axios.get(`${CMS_API}/admin/${id}`);
    return response.data;
  },

  updateDraft: async (id, data) => {
    // data = { draft_content, title, seo_title, ... }
    const response = await axios.put(`${CMS_API}/admin/${id}/draft`, data);
    return response.data;
  },

  publishPage: async (id) => {
    const response = await axios.post(`${CMS_API}/admin/${id}/publish`);
    return response.data;
  },

  deletePage: async (id) => {
    const response = await axios.delete(`${CMS_API}/admin/${id}`);
    return response.data;
  },

  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${CMS_API}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // { url: '...' }
  }
};
