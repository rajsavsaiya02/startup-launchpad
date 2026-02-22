import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const projectFinancialsService = {
  // Get summary of budget, spent, remaining
  getSummary: async (projectId) => {
    const response = await axios.get(
      `${API_URL}/projects/${projectId}/financials`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  // Update total project budget
  updateBudget: async (projectId, budget) => {
    const response = await axios.put(
      `${API_URL}/projects/${projectId}/budget`,
      { budget },
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  // Get paginated and filtered expenses
  getExpenses: async (
    projectId,
    page = 1,
    limit = 10,
    search = "",
    status = "",
    category = "",
  ) => {
    const response = await axios.get(
      `${API_URL}/projects/${projectId}/expenses`,
      {
        params: { page, limit, search, status, category },
        withCredentials: true,
      },
    );
    return response.data;
  },

  // Add new expense record
  createExpense: async (projectId, expenseData) => {
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/expenses`,
      expenseData,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  // Update existing expense record
  updateExpense: async (projectId, expenseId, expenseData) => {
    const response = await axios.put(
      `${API_URL}/projects/${projectId}/expenses/${expenseId}`,
      expenseData,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  // Delete expense record
  deleteExpense: async (projectId, expenseId) => {
    const response = await axios.delete(
      `${API_URL}/projects/${projectId}/expenses/${expenseId}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
};

export default projectFinancialsService;
