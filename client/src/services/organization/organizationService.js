import { apiClient } from "../../lib/axios";

const organizationService = {
  getDetails: async () => {
    const response = await apiClient.get("/org");
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await apiClient.put("/org", settings);
    return response.data;
  },

  getMembers: async () => {
    const response = await apiClient.get("/org/members");
    return response.data;
  },

  getTeams: async () => {
    const response = await apiClient.get("/org/members"); // Returns members and teams
    return response.data.teams;
  },
};

export default organizationService;
