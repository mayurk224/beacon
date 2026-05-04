import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const isRefreshRequest = (config) =>
  config?.url?.includes("/auth/refresh-token");

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshRequest = null;

const refreshSession = async () => {
  if (!refreshRequest) {
    refreshRequest = axios.post(
      buildUrl("/auth/refresh-token"),
      {},
      { withCredentials: true },
    );
  }

  try {
    await refreshRequest;
  } finally {
    refreshRequest = null;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshRequest(originalRequest)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
