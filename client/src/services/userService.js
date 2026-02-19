import { apiClient } from "../lib/axios";

const userService = {
  getPreferences: async () => {
    const response = await apiClient.get("/users/preferences");
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await apiClient.put("/users/preferences", preferences);
    return response.data;
  },
};

export default userService;
