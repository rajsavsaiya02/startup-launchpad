import { apiClient } from "../lib/axios";

const talentApi = {
  // 1. Opportunities
  createOpportunity: async (opportunityData) => {
    const response = await apiClient.post(
      "/talent/opportunities",
      opportunityData,
    );
    return response.data;
  },

  deleteOpportunity: async (id) => {
    const response = await apiClient.delete(`/talent/opportunities/${id}`);
    return response.data;
  },

  getAllOpportunities: async (params) => {
    const response = await apiClient.get("/talent/opportunities", { params });
    return response.data;
  },

  getOpportunityById: async (id) => {
    const response = await apiClient.get(`/talent/opportunities/${id}`);
    return response.data;
  },

  updateOpportunity: async (id, opportunityData) => {
    const response = await apiClient.put(
      `/talent/opportunities/${id}`,
      opportunityData,
    );
    return response.data;
  },

  // 2. Applications
  applyForOpportunity: async (id, applicationData) => {
    const response = await apiClient.post(
      `/talent/opportunities/${id}/apply`,
      applicationData,
    );
    return response.data;
  },

  getOpportunityApplications: async (id) => {
    const response = await apiClient.get(
      `/talent/opportunities/${id}/applications`,
    );
    return response.data;
  },

  getMyApplications: async () => {
    const response = await apiClient.get("/talent/applications/me");
    return response.data;
  },

  updateApplicationStatus: async (id, statusData) => {
    const response = await apiClient.put(
      `/talent/applications/${id}/status`,
      statusData,
    );
    return response.data;
  },

  // 3. Public Profiles
  getPublicProfile: async (username) => {
    const response = await apiClient.get(`/talent/profile/${username}`);
    return response.data;
  },

  updatePublicProfile: async (profileData) => {
    const response = await apiClient.put("/talent/profile/me", profileData);
    return response.data;
  },

  // 4. Messaging
  sendMessage: async (applicationId, content) => {
    const response = await apiClient.post(
      `/talent/applications/${applicationId}/messages`,
      { content },
    );
    return response.data;
  },

  getApplicationMessages: async (applicationId) => {
    const response = await apiClient.get(
      `/talent/applications/${applicationId}/messages`,
    );
    return response.data;
  },

  getOrgApplications: async () => {
    const response = await apiClient.get("/talent/applications/org");
    return response.data;
  },

  getOrgConversations: async () => {
    const response = await apiClient.get("/talent/conversations/org");
    return response.data;
  },

  // Direct Messaging
  sendDirectMessage: async (userId, data) => {
    const response = await apiClient.post(`/talent/messages/${userId}`, data);
    return response.data;
  },

  getDirectMessages: async (userId, params) => {
    // params needs organizationId always
    const response = await apiClient.get(`/talent/messages/${userId}`, {
      params,
    });
    return response.data;
  },

  deleteConversation: async (userId) => {
    const response = await apiClient.delete(
      `/talent/messages/conversation/${userId}`,
    );
    return response.data;
  },

  deleteApplicationConversation: async (applicationId) => {
    const response = await apiClient.delete(
      `/talent/applications/${applicationId}/conversation`,
    );
    return response.data;
  },

  blockOrganization: async (orgId, action) => {
    // action: 'block' | 'unblock'
    const response = await apiClient.post(`/talent/block-org/${orgId}`, {
      action,
    });
    return response.data;
  },

  // Shortlisting
  toggleShortlist: async (userId) => {
    const response = await apiClient.post(`/talent/shortlist/${userId}`);
    return response.data;
  },

  getOrgShortlistedTalent: async () => {
    const response = await apiClient.get("/talent/shortlist");
    return response.data;
  },

  getMyShortlists: async () => {
    const response = await apiClient.get("/talent/shortlist/me");
    return response.data;
  },

  // Talent User Search (Find Talent tab)
  getTalentUsers: async (params) => {
    const response = await apiClient.get("/talent/users", { params });
    return response.data;
  },

  // 5. Archives
  getArchives: async () => {
    const response = await apiClient.get("/talent/archives");
    return response.data;
  },

  deleteFromArchive: async (id) => {
    const response = await apiClient.delete(`/talent/archives/${id}`);
    return response.data;
  },
};

export default talentApi;
