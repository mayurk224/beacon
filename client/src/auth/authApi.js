import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
});
