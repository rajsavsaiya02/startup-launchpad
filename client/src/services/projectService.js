import { apiClient } from "../lib/axios";

const BASE_PATH = "/projects";

const getProjects = async () => {
  const response = await apiClient.get(BASE_PATH);
  return response.data;
};

const getProjectById = async (id) => {
  const response = await apiClient.get(`${BASE_PATH}/${id}`);
  return response.data;
};

const createProject = async (projectData) => {
  const response = await apiClient.post(BASE_PATH, projectData);
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

const projectService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

export default projectService;
