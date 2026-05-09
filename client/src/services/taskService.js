import { apiClient } from "../lib/axios";

const BASE_PATH = "/projects";

const getAllTasks = async (scope) => {
  const response = await apiClient.get(`${BASE_PATH}/tasks/all`, {
    params: { scope },
  });
  return response.data;
};

const getTasksByProject = async (projectId) => {
  const response = await apiClient.get(`${BASE_PATH}/${projectId}/tasks`);
  return response.data;
};

const createTask = async (projectId, taskData) => {
  const url = projectId ? `${BASE_PATH}/${projectId}/tasks` : `/tasks`;
  const response = await apiClient.post(url, taskData);
  return response.data;
};

const updateTask = async (projectId, taskId, taskData) => {
  if (!projectId || projectId === "null") {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  }
  const response = await apiClient.put(
    `${BASE_PATH}/${projectId}/tasks/${taskId}`,
    taskData,
  );
  return response.data;
};

const deleteTask = async (projectId, taskId) => {
  // If project_id is null/undefined, use the direct personal task delete route
  if (!projectId || projectId === "null") {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  }
  const response = await apiClient.delete(
    `${BASE_PATH}/${projectId}/tasks/${taskId}`,
  );
  return response.data;
};

const taskService = {
  getAllTasks,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
};

export default taskService;
