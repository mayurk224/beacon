import { apiClient, publicApi } from "../lib/apiClient";

export const authApi = publicApi;

export const loginUser = async (credentials) => {
  const { data } = await authApi.post("/auth/login", credentials);
  return data.user;
};

export const loginWithGoogleCredential = async (credential) => {
  const { data } = await authApi.post("/auth/google", { credential });
  return data.user;
};

export const getCurrentUser = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data.user;
};

export const logoutUser = async () => {
  await authApi.post("/auth/logout");
};
