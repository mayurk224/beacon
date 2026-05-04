import React, { useState, useEffect, useCallback } from 'react';
import {
  Filter, MoreVertical, X, Search, Download,
  Mail, Calendar, Clock, Shield, Trash2, Edit,
  ChevronLeft, ChevronRight, RefreshCw, Loader2,
  CheckCircle, XCircle
} from 'lucide-react';
import { useAdmin } from './useAdmin';

/* ── helpers ── */
const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const getRoleBadge = (role) => {
  switch (role) {
    case 'admin': return 'bg-brand-muted text-brand-strong border border-brand-muted';
    case 'editor': return 'bg-chip-sky-bg text-chip-sky-fg border border-border-muted';
    default: return 'bg-chip-violet-bg text-chip-violet-fg border border-border-muted';
  }
};

const getStatusColor = (isActive, deletedAt) => {
  if (deletedAt) return { dot: 'bg-semantic-error', text: 'text-semantic-error', label: 'Deleted' };
  if (isActive) return { dot: 'bg-semantic-success', text: 'text-semantic-success', label: 'Active' };
  return { dot: 'bg-semantic-warning', text: 'text-semantic-warning', label: 'Inactive' };
};

/* ── component ── */
const AdminUserManagement = () => {
  const {
    users, selectedUser, setSelectedUser,
    pagination, loading, actionLoading,
    fetchUsers, toggleUserStatus, changeUserRole, removeUser,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* build params and fetch */
  const loadUsers = useCallback(() => {
    const params = { page: currentPage, limit: 10 };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (roleFilter) params.role = roleFilter;
    if (statusFilter !== '') params.isActive = statusFilter;
    fetchUsers(params);
  }, [currentPage, searchQuery, roleFilter, statusFilter, fetchUsers]);

  /* debounce search */
  useEffect(() => {
    const timer = setTimeout(loadUsers, 400);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  /* reset page on filter change */
  useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter, statusFilter]);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await removeUser(selectedUser._id);
      setConfirmDelete(false);
    } catch (_) { /* toast shown in hook */ }
  };

  const handleToggleStatus = async (user) => {
    try {
      await toggleUserStatus(user._id, !user.isActive);
    } catch (_) { /* toast shown in hook */ }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await changeUserRole(userId, role);
    } catch (_) { /* toast shown in hook */ }
  };

  /* ── render ── */
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden text-primary">

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border-primary flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">User Management</h1>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              {pagination.total > 0
                ? `${pagination.total} users on platform`
                : 'Manage platform users, roles, and administrative permissions.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-outline max-sm:w-full"
              onClick={loadUsers}
              disabled={loading}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-border-primary">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
              <input
                className="input-secondary pl-9!"
                placeholder="Search by name or email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                className="bg-surface border border-border-primary text-foreground text-sm px-2 sm:px-3 py-2 rounded-lg min-w-30 outline-none focus:border-brand transition-colors"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <select
                className="bg-surface border border-border-primary text-foreground text-sm px-2 sm:px-3 py-2 rounded-lg min-w-32 outline-none focus:border-brand transition-colors"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-secondary gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading users…
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-secondary gap-2">
              <Filter className="w-8 h-8 opacity-40" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="min-w-160 lg:min-w-full">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface-header border-b border-border-primary z-10">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">User</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider hidden sm:table-cell">Role</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider hidden md:table-cell">Joined</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-muted">
                  {users.map((user) => {
                    const status = getStatusColor(user.isActive, user.deletedAt);
                    return (
                      <tr
                        key={user._id}
                        className={`hover:bg-surface-elevated transition-colors cursor-pointer border-l-2 ${
                          selectedUser?._id === user._id
                            ? 'bg-brand-muted border-l-brand'
                            : 'border-l-transparent'
                        }`}
                        onClick={() => { setSelectedUser(user); setConfirmDelete(false); }}
                      >
                        {/* User */}
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-border-primary object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-chip-sky-bg flex items-center justify-center border border-border-muted text-xs text-chip-sky-fg font-medium">
                                {getInitials(user.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-36 sm:max-w-none">{user.name}</p>
                              <p className="text-[11px] text-secondary truncate max-w-36 sm:max-w-48">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 sm:px-6 py-3 hidden sm:table-cell">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap ${getRoleBadge(user.role)}`}>
                            {user.role || 'user'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                            <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                          </div>
                        </td>

                        {/* Joined */}
                        <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-secondary">
                            <Calendar className="w-3 h-3" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 sm:px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                              className="p-1.5 hover:bg-surface-elevated rounded transition-colors text-secondary hover:text-foreground"
                              onClick={() => handleToggleStatus(user)}
                              disabled={actionLoading}
                            >
                              {user.isActive
                                ? <XCircle className="w-3.5 h-3.5" />
                                : <CheckCircle className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              title="Delete user"
                              className="p-1.5 hover:bg-danger-bg-subtle rounded transition-colors text-secondary hover:text-semantic-error"
                              onClick={() => { setSelectedUser(user); setConfirmDelete(true); }}
                              disabled={actionLoading || !!user.deletedAt}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 sm:px-6 py-3 border-t border-border-primary flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-secondary">
            <p>
              Showing <span className="text-foreground">{(currentPage - 1) * pagination.limit + 1}–{Math.min(currentPage * pagination.limit, pagination.total)}</span> of <span className="text-foreground">{pagination.total}</span> users
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <button
                className="px-3 py-1 bg-surface-card border border-border-primary rounded hover:text-foreground disabled:opacity-50 transition-colors"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1">…</span>}
                    <button
                      className={`w-7 h-7 flex items-center justify-center rounded border text-xs transition-colors ${
                        p === currentPage
                          ? 'bg-surface-elevated text-foreground border-border-primary'
                          : 'bg-surface-card border-border-primary hover:text-foreground'
                      }`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                className="px-3 py-1 bg-surface-card border border-border-primary rounded hover:text-foreground disabled:opacity-50 transition-colors"
                disabled={currentPage >= pagination.pages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Detail Drawer ── */}
      {selectedUser && (
        <>
          <div
            className="fixed inset-0 bg-overlay-scrim z-40 md:hidden"
            onClick={() => { setSelectedUser(null); setConfirmDelete(false); }}
          />
          <aside className="fixed md:relative right-0 top-0 h-full w-full sm:w-100 md:w-88 bg-surface-elevated border-l border-border-primary flex flex-col shadow-2xl z-50 md:z-auto animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="p-4 sm:p-6 border-b border-border-primary flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">User Details</h3>
              <button onClick={() => { setSelectedUser(null); setConfirmDelete(false); }} className="text-secondary hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-20 h-20 rounded-full border-2 border-brand object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-chip-sky-bg flex items-center justify-center border-2 border-brand text-xl text-chip-sky-fg font-semibold">
                    {getInitials(selectedUser.name)}
                  </div>
                )}
                <div className="text-center">
                  <h4 className="text-foreground text-lg font-semibold">{selectedUser.name}</h4>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role || 'user'}
                  </span>
                </div>
              </div>

              {/* Info cards */}
              <div className="space-y-3">
                <div className="bg-surface border border-border-primary p-3 rounded">
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="text-sm text-foreground break-all">{selectedUser.email}</p>
                </div>

                {selectedUser.bio && (
                  <div className="bg-surface border border-border-primary p-3 rounded">
                    <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Bio</p>
                    <p className="text-sm text-foreground">{selectedUser.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface border border-border-primary p-3 rounded">
                    <p className="text-[10px] text-secondary uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" /> Joined
                    </p>
                    <p className="text-xs text-foreground">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div className="bg-surface border border-border-primary p-3 rounded">
                    <p className="text-[10px] text-secondary uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" /> Updated
                    </p>
                    <p className="text-xs text-foreground">{formatDate(selectedUser.updatedAt)}</p>
                  </div>
                </div>

                <div className="bg-surface border border-border-primary p-3 rounded">
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                    <Shield className="w-3 h-3" /> Status
                  </p>
                  {(() => {
                    const s = getStatusColor(selectedUser.isActive, selectedUser.deletedAt);
                    return (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                        <span className={`text-sm font-medium ${s.text}`}>{s.label}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Role changer */}
                <div className="bg-surface border border-border-primary p-3 rounded">
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-2">Change Role</p>
                  <select
                    className="w-full bg-surface-elevated border border-border-primary text-foreground text-sm px-3 py-1.5 rounded outline-none focus:border-brand transition-colors"
                    value={selectedUser.role || 'user'}
                    onChange={(e) => handleRoleChange(selectedUser._id, e.target.value)}
                    disabled={actionLoading}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Drawer actions */}
            <div className="p-4 sm:p-6 border-t border-border-primary flex flex-col gap-2 bg-surface-elevated">
              <button
                className="w-full bg-brand text-on-brand py-2 rounded text-sm font-semibold hover:bg-brand-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                onClick={() => handleToggleStatus(selectedUser)}
                disabled={actionLoading || !!selectedUser.deletedAt}
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
              </button>

              {!confirmDelete ? (
                <button
                  className="w-full bg-transparent border border-semantic-error/30 text-semantic-error py-2 rounded text-sm font-semibold hover:bg-semantic-error/10 transition-colors disabled:opacity-60"
                  onClick={() => setConfirmDelete(true)}
                  disabled={actionLoading || !!selectedUser.deletedAt}
                >
                  {selectedUser.deletedAt ? 'Already Deleted' : 'Delete User'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-semantic-error text-white py-2 rounded text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                    onClick={handleDelete}
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Delete
                  </button>
                  <button
                    className="flex-1 border border-border-primary py-2 rounded text-sm font-semibold hover:bg-surface transition-colors"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default AdminUserManagement;