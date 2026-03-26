import { apiClient as api } from "../lib/axios";

const opportunityService = {
  // ---------------------------------------------------------------------------
  // 1. OPPORTUNITIES CRUD
  // ---------------------------------------------------------------------------

  /**
   * Create a new opportunity (Org/Founder only)
   * @param {Object} data { project_id, type, title, description, skills, compensation_type, budget_min, budget_max, duration, media_urls, external_links }
   */
  createOpportunity: async (data, orgId) => {
    const response = await api.post("/talent/opportunities", {
      ...data,
      organization_id: orgId,
    });
    return response.data;
  },

  /**
   * Get all opportunities (Public/Freelancers)
   * @param {Object} filters { type, status, search, owner_id }
   */
  getAllOpportunities: async (filters = {}) => {
    const response = await api.get("/talent/opportunities", { params: filters });
    return response.data;
  },

  /**
   * Get a specific opportunity by ID
   */
  getOpportunityById: async (id) => {
    const response = await api.get(`/talent/opportunities/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // 2. APPLICATIONS FLOW
  // ---------------------------------------------------------------------------

  /**
   * Apply for an opportunity (Freelancers)
   * @param {String} opportunityId
   * @param {Object} body { cover_letter, proposed_rate }
   */
  applyForOpportunity: async (opportunityId, body) => {
    const response = await api.post(`/talent/opportunities/${opportunityId}/apply`, body);
    return response.data;
  },

  /**
   * Get applications submitted by the current freelancer
   */
  getMyApplications: async () => {
    const response = await api.get("/talent/applications/me");
    return response.data;
  },

  /**
   * Get applications for a specific opportunity (Owner/Founder)
   */
  getOpportunityApplications: async (opportunityId) => {
    const response = await api.get(`/talent/opportunities/${opportunityId}/applications`);
    return response.data;
  },

  /**
   * Get all applications for the current Organization
   */
  getOrgApplications: async () => {
    const response = await api.get("/talent/applications/org");
    return response.data;
  },

  /**
   * Update the status of an application (Founder/Admin)
   * @param {String} applicationId
   * @param {String} status 'Pending', 'Shortlisted', 'Accepted', 'Rejected'
   */
  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.put(`/talent/applications/${applicationId}/status`, { status });
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // 3. MESSAGING
  // ---------------------------------------------------------------------------

  /**
   * Send a message within an application thread
   */
  sendMessage: async (applicationId, content) => {
    const response = await api.post(`/talent/applications/${applicationId}/messages`, { content });
    return response.data;
  },

  /**
   * Get messages for a specific application thread
   */
  getApplicationMessages: async (applicationId) => {
    const response = await api.get(`/talent/applications/${applicationId}/messages`);
    return response.data;
  },
};

export default opportunityService;
