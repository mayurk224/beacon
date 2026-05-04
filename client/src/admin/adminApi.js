import { apiClient } from "../lib/apiClient";

/**
 * GET /api/admin/users
 * Supports: page, limit, search, isActive, role query params
 */
export const getAllUsers = async (params = {}) => {
  const { data } = await apiClient.get("/api/admin/users", { params });
  return data; // { users, pagination }
};

/**
 * GET /api/admin/users/:id
 */
export const getUserById = async (userId) => {
  const { data } = await apiClient.get(`/api/admin/users/${userId}`);
  return data.user;
};

/**
 * PATCH /api/admin/users/:id/status
 * body: { isActive: boolean }
 */
export const updateUserStatus = async (userId, isActive) => {
  const { data } = await apiClient.patch(`/api/admin/users/${userId}/status`, {
    isActive,
  });
  return data; // { message, user }
};

/**
 * PATCH /api/admin/users/:id/role
 * body: { role: string }
 */
export const updateUserRole = async (userId, role) => {
  const { data } = await apiClient.patch(`/api/admin/users/${userId}/role`, {
    role,
  });
  return data; // { message, user }
};

/**
 * DELETE /api/admin/users/:id/delete
 * Soft-deletes the user and revokes all sessions
 */
export const deleteUser = async (userId) => {
  const { data } = await apiClient.delete(`/api/admin/users/${userId}/delete`);
  return data; // { message, user }
};
