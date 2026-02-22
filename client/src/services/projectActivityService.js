import { apiClient } from "../lib/axios";

class ProjectActivityService {
  /**
   * Fetch all activities for a project
   */
  async getActivities(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/activities`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project activities:", error);
      throw error;
    }
  }

  /**
   * Add a new activity log
   */
  async addActivity(projectId, content) {
    try {
      const response = await apiClient.post(
        `/projects/${projectId}/activities`,
        {
          content,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error adding project activity:", error);
      throw error;
    }
  }

  /**
   * Update an existing activity log
   */
  async updateActivity(projectId, activityId, content) {
    try {
      const response = await apiClient.put(
        `/projects/${projectId}/activities/${activityId}`,
        { content },
      );
      return response.data;
    } catch (error) {
      console.error("Error updating project activity:", error);
      throw error;
    }
  }

  /**
   * Delete an activity log
   */
  async deleteActivity(projectId, activityId) {
    try {
      const response = await apiClient.delete(
        `/projects/${projectId}/activities/${activityId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting project activity:", error);
      throw error;
    }
  }
}

export default new ProjectActivityService();
