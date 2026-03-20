import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const adminAnalyticsService = {
  /**
   * Fetches platform-wide analytics summary for the Admin Dashboard.
   * Requires admin token (handled by interceptors).
   */
  getAnalyticsSummary: async () => {
    const response = await axios.get(`${BASE_URL}/admin/analytics/summary`, {
      withCredentials: true,
    });
    return response.data;
  },
};
