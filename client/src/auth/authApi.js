import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
});

export const loginUser = async (credentials) => {
  const { data } = await authApi.post("/login", credentials);
  return data.user;
};

export const loginWithGoogleCredential = async (credential) => {
  const { data } = await authApi.post("/google", { credential });
  return data.user;
};

export const getCurrentUser = async () => {
  const { data } = await authApi.get("/me");
  return data.user;
};

export const logoutUser = async () => {
  await authApi.post("/logout");
};
