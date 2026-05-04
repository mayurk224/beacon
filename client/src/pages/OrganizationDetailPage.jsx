import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getOrganizationById,
  updateOrganization,
  removeOrganizationMember,
  updateOrganizationMemberRole,
  sendOrganizationInvite,
} from "../organization/organizationApi";
import { useAuth } from "../auth/useAuth";
import { toast } from "sonner";
import { Shield, Mail, Trash2, Edit2, Check, X, Users, Building2 } from "lucide-react";

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [updatingName, setUpdatingName] = useState(false);

  // Invite State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);

  const fetchOrg = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrganizationById(id);
      setOrg(data.organization || data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch organization details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  if (loading) {
    return <div className="p-6 text-primary animate-pulse">Loading organization details...</div>;
  }

  if (!org) {
    return <div className="p-6 text-red-500">Organization not found.</div>;
  }

  const currentUserRole = org.members?.find((m) => {
     const memberId = typeof m.user === 'object' ? m.user?._id : m.user;
     return memberId === user?._id;
  })?.role || "viewer";

  const isAdmin = currentUserRole === "admin";
  const canEdit = isAdmin || currentUserRole === "responder";

  const handleUpdateName = async () => {
    if (!editNameValue.trim() || editNameValue === org.name) {
      setIsEditingName(false);
      return;
    }
    setUpdatingName(true);
    try {
      await updateOrganization(id, { name: editNameValue });
      toast.success("Organization name updated");
      setOrg({ ...org, name: editNameValue });
      setIsEditingName(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update name");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await sendOrganizationInvite({ organizationId: id, email: inviteEmail, role: inviteRole });
      toast.success("Invitation sent successfully");
      setInviteEmail("");
      setInviteRole("viewer");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateOrganizationMemberRole(id, userId, newRole);
      toast.success("Role updated");
      fetchOrg();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeOrganizationMember(id, userId);
      toast.success("Member removed");
      fetchOrg();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-surface border border-border-primary rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Building2 size={32} />
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  className="h-10 px-3 bg-surface border border-border-primary rounded-lg text-primary text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
                <button onClick={handleUpdateName} disabled={updatingName} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Check size={20} />
                </button>
                <button onClick={() => setIsEditingName(false)} disabled={updatingName} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-primary">{org.name}</h1>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditNameValue(org.name);
                      setIsEditingName(true);
                    }}
                    className="p-1.5 text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
            )}
            <p className="text-sm text-subtle mt-1">ID: {org._id}</p>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold capitalize border border-blue-200 dark:border-blue-800">
            {currentUserRole}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Users size={20} />
              Members
            </h2>
            <span className="text-sm text-muted">{org.members?.length || 0} Total</span>
          </div>

          <div className="bg-surface border border-border-primary rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-interactive border-b border-border-primary">
                  <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">User</th>
                  <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                  {isAdmin && <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {org.members?.map((member) => {
                  const mUser = member.user || {};
                  const isSelf = mUser._id === user?._id;

                  return (
                    <tr key={mUser._id} className="hover:bg-surface-interactive transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-primary">
                            {mUser.name || "Unknown User"} {isSelf && "(You)"}
                          </span>
                          <span className="text-xs text-subtle">{mUser.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isAdmin && !isSelf ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(mUser._id, e.target.value)}
                            className="bg-surface border border-border-primary text-primary text-xs rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="responder">Responder</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className="px-2 py-1 bg-surface-interactive border border-border-primary text-muted rounded-md text-xs font-medium capitalize">
                            {member.role}
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => handleRemoveMember(mUser._id)}
                              className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <Mail size={20} />
            Invite Members
          </h2>

          <div className="bg-surface border border-border-primary rounded-xl p-5 shadow-sm">
            {isAdmin ? (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full h-10 px-3 bg-surface border border-border-primary rounded-lg text-primary text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="colleague@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-10 px-3 bg-surface border border-border-primary rounded-lg text-primary text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="responder">Responder</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? "Sending..." : "Send Invitation"}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <Shield size={32} className="mx-auto text-muted mb-3 opacity-50" />
                <p className="text-sm text-subtle">
                  Only administrators can invite new members to this organization.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
