import { apiClient } from "../../lib/axios";

const BASE_PATH = "/projects"; // We use the same base path but will filter by org context

const getProjects = async () => {
  // For now, we'll fetch all projects.
  // Ideally, the backend should filter by owner_org_id != null
  const response = await apiClient.get(BASE_PATH, {
    params: { scope: "organization" },
  });
  return response.data;
};

const getProjectById = async (id) => {
  const response = await apiClient.get(`${BASE_PATH}/${id}`);
  return response.data;
};

const createProject = async (projectData) => {
  // Force organizational context
  const data = { ...projectData, is_organizational: true };
  const response = await apiClient.post(BASE_PATH, data);
  return response.data;
};

const updateProject = async (id, projectData) => {
  const response = await apiClient.put(`${BASE_PATH}/${id}`, projectData);
  return response.data;
};

const deleteProject = async (id) => {
  const response = await apiClient.delete(`${BASE_PATH}/${id}`);
  return response.data;
};

const orgProjectService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

export default orgProjectService;
