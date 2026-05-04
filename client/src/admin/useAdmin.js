import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getAllUsers as apiGetAllUsers,
  getUserById as apiGetUserById,
  updateUserStatus as apiUpdateUserStatus,
  updateUserRole as apiUpdateUserRole,
  deleteUser as apiDeleteUser,
} from "./adminApi";

export function useAdmin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch paginated/filtered users
   * params: { page, limit, search, isActive, role }
   */
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetAllUsers(params);
      setUsers(data.users || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1, limit: 10 });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch users";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single user by ID and set as selectedUser
   */
  const fetchUserById = useCallback(async (userId) => {
    setActionLoading(true);
    try {
      const user = await apiGetUserById(userId);
      setSelectedUser(user);
      return user;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch user";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }, []);

  /**
   * Toggle user active status
   */
  const toggleUserStatus = useCallback(
    async (userId, isActive) => {
      setActionLoading(true);
      try {
        const result = await apiUpdateUserStatus(userId, isActive);
        toast.success(result.message || `User ${isActive ? "activated" : "deactivated"}`);
        // Optimistically update in list
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, isActive } : u
          )
        );
        if (selectedUser?._id === userId) {
          setSelectedUser((prev) => ({ ...prev, isActive }));
        }
        return result;
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to update user status";
        toast.error(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [selectedUser]
  );

  /**
   * Update user system role (e.g. admin / user)
   */
  const changeUserRole = useCallback(
    async (userId, role) => {
      setActionLoading(true);
      try {
        const result = await apiUpdateUserRole(userId, role);
        toast.success(result.message || "User role updated");
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role } : u))
        );
        if (selectedUser?._id === userId) {
          setSelectedUser((prev) => ({ ...prev, role }));
        }
        return result;
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to update user role";
        toast.error(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [selectedUser]
  );

  /**
   * Soft-delete a user
   */
  const removeUser = useCallback(
    async (userId) => {
      setActionLoading(true);
      try {
        const result = await apiDeleteUser(userId);
        toast.success(result.message || "User deleted");
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        if (selectedUser?._id === userId) {
          setSelectedUser(null);
        }
        return result;
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to delete user";
        toast.error(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [selectedUser]
  );

  return {
    users,
    selectedUser,
    setSelectedUser,
    pagination,
    loading,
    actionLoading,
    error,
    fetchUsers,
    fetchUserById,
    toggleUserStatus,
    changeUserRole,
    removeUser,
  };
}
