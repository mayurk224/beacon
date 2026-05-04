import { apiClient } from "../lib/apiClient";

export const getProfile = async () => {
  const { data } = await apiClient.get("/api/users/profile");
  return data.user;
};

export const updateProfile = async (payload) => {
  const { data } = await apiClient.patch("/api/users/profile", payload);
  return data.user;
};

export const updateAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await apiClient.post("/api/users/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.user;
};

export const deleteAvatar = async () => {
  const { data } = await apiClient.delete("/api/users/profile/avatar");
  return data.user;
};

export const changePassword = async (payload) => {
  const { data } = await apiClient.post("/api/users/profile/password", payload);
  return data;
};
