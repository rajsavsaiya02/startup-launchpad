import { apiClient } from "../lib/axios";

class FileAssetService {
  /**
   * Fetch all file assets for a given context
   */
  async getFileAssets(contextType, contextId) {
    try {
      const response = await apiClient.get(
        `/file-assets/context/${contextType}/${contextId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching file assets:", error);
      throw error;
    }
  }

  /**
   * Upload a physical file to a given context
   */
  async uploadFile(contextType, contextId, file, title = "") {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (title) {
        formData.append("title", title);
      }

      const response = await apiClient.post(
        `/file-assets/context/${contextType}/${contextId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading file asset:", error);
      throw error;
    }
  }

  /**
   * Add an external link (Drive, Dropbox, etc.) to a context
   */
  async attachExternalLink(contextType, contextId, title, url) {
    try {
      const payload = {
        isExternal: true,
        fileName: title,
        storageUrl: url,
      };
      const response = await apiClient.post(
        `/file-assets/context/${contextType}/${contextId}`,
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error attaching external link:", error);
      throw error;
    }
  }

  /**
   * Delete a file asset by its ID
   */
  async deleteFileAsset(id) {
    try {
      const response = await apiClient.delete(`/file-assets/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting file asset:", error);
      throw error;
    }
  }

  /**
   * Update a file asset's name.
   */
  async updateFileAsset(id, fileName) {
    try {
      const response = await apiClient.put(`/file-assets/${id}`, { fileName });
      return response.data;
    } catch (error) {
      console.error("Error updating file asset:", error);
      throw error;
    }
  }

  /**
   * Returns the secure download URL for a local file asset
   */
  getDownloadUrl(id) {
    // Based on how apiClient is set up, typically we use the full API URL
    // This assumes you hit the proxy or the full backend URL.
    // A safer way if relying on token cookies is a direct anchor href,
    // assuming cookies are sent with cross-origin or same-site requests.
    return `${import.meta.env.VITE_API_URL || "/api"}/file-assets/${id}/download`;
  }
}

export default new FileAssetService();
