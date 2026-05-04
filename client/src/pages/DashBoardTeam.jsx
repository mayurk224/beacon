import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Edit2,
  Eye,
  Filter,
  Loader2,
  Mail,
  MoreVertical,
  RefreshCw,
  Send,
  Shield,
  User,
  UserPlus,
  UserX,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import {
  getOrganizationById,
  getOrganizationJoinRequests,
  handleOrganizationJoinRequest,
  removeOrganizationMember,
  sendOrganizationInvite,
  updateOrganizationMemberRole,
} from "../organization/organizationApi";

const roleLabelMap = {
  admin: "Admin",
  responder: "Responder",
  viewer: "Viewer",
};

const DashBoardTeam = () => {
  const { user } = useAuth();
  const primaryMembership = user?.memberships?.[0];
  const primaryOrganizationId =
    primaryMembership?.organization?._id || primaryMembership?.organization;
  const currentUserRole = primaryMembership?.role || "viewer";
  const canManageMembers = currentUserRole === "admin";

  const [organization, setOrganization] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPermissionsMenu, setShowPermissionsMenu] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("responder");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isHandlingJoinRequest, setIsHandlingJoinRequest] = useState("");
  const [memberActionKey, setMemberActionKey] = useState("");

  const loadTeamData = useCallback(async () => {
    if (!primaryOrganizationId) {
      setOrganization(null);
      setTeamMembers([]);
      setJoinRequests([]);
      return;
    }

    setIsLoading(true);
    try {
      const [organizationData, requests] = await Promise.all([
        getOrganizationById(primaryOrganizationId),
        canManageMembers
          ? getOrganizationJoinRequests(primaryOrganizationId)
          : Promise.resolve([]),
      ]);

      setOrganization(organizationData.organization);
      setTeamMembers(
        (organizationData.members || []).map((member) => ({
          id: member.userId,
          name: member.name,
          email: member.email || "",
          role: member.role,
          status:
            member.lastLoginAt &&
            Date.now() - new Date(member.lastLoginAt).getTime() < 15 * 60 * 1000
              ? "active"
              : "offline",
          initial:
            member.name
              ?.split(" ")
              .map((part) => part[0])
              .join("") || "U",
          joinedAt: member.joinedAt,
          lastLoginAt: member.lastLoginAt,
        })),
      );
      setJoinRequests(requests.filter((request) => request.status === "pending"));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load team details.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [canManageMembers, primaryOrganizationId]);

  useEffect(() => {
    const run = async () => {
      await loadTeamData();
    };

    run();
  }, [loadTeamData]);

  const filteredMembers = useMemo(
    () =>
      teamMembers.filter((member) => {
        const matchesSearch =
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole =
          selectedRoleFilter === "all" || member.role === selectedRoleFilter;
        const matchesStatus =
          selectedStatusFilter === "all" || member.status === selectedStatusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      }),
    [teamMembers, searchTerm, selectedRoleFilter, selectedStatusFilter],
  );

  const roleStats = useMemo(
    () => ({
      admin: teamMembers.filter((member) => member.role === "admin").length,
      responder: teamMembers.filter((member) => member.role === "responder").length,
      viewer: teamMembers.filter((member) => member.role === "viewer").length,
    }),
    [teamMembers],
  );

  const getStatusConfig = (status) => {
    if (status === "active") {
      return { dot: "bg-semantic-success", text: "text-semantic-success", label: "Active" };
    }
    return { dot: "bg-surface-interactive", text: "text-subtle", label: "Offline" };
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required.");
      return;
    }

    setIsSendingInvite(true);
    try {
      await sendOrganizationInvite({
        email: inviteEmail.trim(),
        role: inviteRole,
        organizationId: primaryOrganizationId,
      });
      toast.success("Invite sent successfully.");
      setInviteEmail("");
      setInviteRole("responder");
      setShowInviteModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.message ||
          "Unable to send invite.",
      );
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleChangeRole = async (memberId, role) => {
    setMemberActionKey(`${memberId}-${role}`);
    try {
      await updateOrganizationMemberRole(primaryOrganizationId, memberId, role);
      toast.success("Member role updated.");
      setShowPermissionsMenu(null);
      await loadTeamData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update member role.",
      );
    } finally {
      setMemberActionKey("");
    }
  };

  const handleRemoveMember = async (memberId) => {
    setMemberActionKey(`${memberId}-remove`);
    try {
      await removeOrganizationMember(primaryOrganizationId, memberId);
      toast.success("Member removed.");
      setShowPermissionsMenu(null);
      await loadTeamData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to remove member.",
      );
    } finally {
      setMemberActionKey("");
    }
  };

  const handleJoinRequest = async (requestId, status) => {
    setIsHandlingJoinRequest(`${requestId}-${status}`);
    try {
      await handleOrganizationJoinRequest(requestId, status);
      toast.success(`Join request ${status}.`);
      await loadTeamData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update join request.",
      );
    } finally {
      setIsHandlingJoinRequest("");
    }
  };

  const PermissionsMenu = ({ member }) => (
    <div className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border-primary rounded-lg shadow-2xl z-50 overflow-hidden">
      <div className="p-2 border-b border-border-primary">
        <div className="px-2 py-1">
          <p className="text-[12px] font-medium text-primary">{member.name}</p>
          <p className="text-[10px] text-subtle">
            Current role: {roleLabelMap[member.role]}
          </p>
        </div>
      </div>
      <div className="p-2">
        {["admin", "responder", "viewer"].map((role) => (
          <button
            key={role}
            onClick={() => handleChangeRole(member.id, role)}
            disabled={Boolean(memberActionKey)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded text-[13px] text-primary hover:bg-surface-interactive transition-colors"
          >
            {role === "admin" && <Shield className="w-4 h-4 text-brand-soft" />}
            {role === "responder" && <Edit2 className="w-4 h-4 text-chip-sky-bg" />}
            {role === "viewer" && <Eye className="w-4 h-4 text-subtle" />}
            <span>{roleLabelMap[role]}</span>
            {member.role === role && (
              <CheckCircle className="w-3.5 h-3.5 ml-auto text-success-bright" />
            )}
            {memberActionKey === `${member.id}-${role}` && (
              <Loader2 className="w-3.5 h-3.5 ml-auto animate-spin" />
            )}
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-border-primary">
        <button
          onClick={() => handleRemoveMember(member.id)}
          disabled={Boolean(memberActionKey)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded text-[13px] text-semantic-error hover:bg-semantic-error/10 transition-colors"
        >
          {memberActionKey === `${member.id}-remove` ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserX className="w-4 h-4" />
          )}
          <span>Remove from team</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="text-primary min-h-screen w-full">
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-primary mb-1">
              Team Management
            </h1>
            <p className="text-[12px] sm:text-[13px] font-medium text-tertiary">
              Manage workspace members for {organization?.name || "your organization"}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button onClick={() => setShowFilterModal(true)} className="btn-outline">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button onClick={loadTeamData} className="btn-outline" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary"
              disabled={!canManageMembers}
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </div>

        {!primaryOrganizationId ? (
          <div className="rounded-xl border border-border-primary bg-surface-card p-6 text-sm text-muted">
            Join or create an organization before managing members.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-surface-card border border-border-primary rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] font-medium text-subtle uppercase tracking-wider">Total</span>
                  <Users className="w-4 h-4 text-brand-soft" />
                </div>
                <div className="text-[20px] sm:text-[24px] font-bold text-primary">{teamMembers.length}</div>
              </div>
              <div className="bg-surface-card border border-border-primary rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] font-medium text-subtle uppercase tracking-wider">Admins</span>
                  <Shield className="w-4 h-4 text-brand-soft" />
                </div>
                <div className="text-[20px] sm:text-[24px] font-bold text-primary">{roleStats.admin}</div>
              </div>
              <div className="bg-surface-card border border-border-primary rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] font-medium text-subtle uppercase tracking-wider">Responders</span>
                  <Edit2 className="w-4 h-4 text-brand-soft" />
                </div>
                <div className="text-[20px] sm:text-[24px] font-bold text-primary">{roleStats.responder}</div>
              </div>
              <div className="bg-surface-card border border-border-primary rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] font-medium text-subtle uppercase tracking-wider">Viewers</span>
                  <Eye className="w-4 h-4 text-brand-soft" />
                </div>
                <div className="text-[20px] sm:text-[24px] font-bold text-primary">{roleStats.viewer}</div>
              </div>
            </div>

            {canManageMembers && joinRequests.length > 0 && (
              <div className="mb-6 rounded-xl border border-border-primary bg-surface-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold">Pending Join Requests</h2>
                    <p className="text-xs text-muted mt-1">
                      Review people waiting to access this organization.
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-primary">
                    {joinRequests.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {joinRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex flex-col gap-3 rounded-lg border border-border-primary p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-sm text-primary">{request.user?.name}</div>
                        <div className="text-xs text-muted">{request.user?.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn-outline"
                          onClick={() => handleJoinRequest(request._id, "declined")}
                          disabled={Boolean(isHandlingJoinRequest)}
                        >
                          {isHandlingJoinRequest === `${request._id}-declined` && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          Decline
                        </button>
                        <button
                          className="btn-primary"
                          onClick={() => handleJoinRequest(request._id, "accepted")}
                          disabled={Boolean(isHandlingJoinRequest)}
                        >
                          {isHandlingJoinRequest === `${request._id}-accepted` && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5">
              <div className="relative max-w-full sm:max-w-md">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="input pl-9!"
                />
              </div>
            </div>

            <div className="bg-surface-card border border-border-primary rounded-lg overflow-hidden">
              <div className="grid grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_100px_100px_80px] gap-4 p-4 border-b border-border-primary bg-surface-header text-[11px] font-medium text-subtle uppercase tracking-wider">
                <div>Member</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y divide-border-primary">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-subtle mx-auto mb-3" />
                    <p className="text-tertiary">No team members found</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const statusConfig = getStatusConfig(member.status);
                    return (
                      <div
                        key={member.id}
                        className="grid grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_100px_100px_80px] gap-4 p-4 items-center hover:bg-surface-elevated transition-colors relative"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full border border-border-primary bg-surface-panel text-brand-soft flex items-center justify-center text-[13px] font-medium">
                            {member.initial}
                          </div>
                          <div>
                            <div className="text-[14px] font-medium text-primary">{member.name}</div>
                            <div className="text-[11px] text-subtle">
                              Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "recently"}
                            </div>
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-tertiary">
                          {member.email || "Email not exposed by this endpoint"}
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border border-border-primary bg-surface-card text-muted">
                            {roleLabelMap[member.role]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
                          <span className={`text-[11px] font-medium ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex justify-end relative">
                          <button
                            onClick={() =>
                              setShowPermissionsMenu(
                                showPermissionsMenu === member.id ? null : member.id,
                              )
                            }
                            className="p-1 text-subtle hover:text-primary rounded hover:bg-surface-interactive transition-colors"
                            disabled={!canManageMembers}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {showPermissionsMenu === member.id && canManageMembers && (
                            <PermissionsMenu member={member} />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {!canManageMembers && (
              <div className="mt-4 rounded-xl border border-border-primary bg-surface-card p-4 text-sm text-muted">
                Your current role is `viewer`, so the server will block member invites and permission changes.
              </div>
            )}
          </>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-overlay-scrim backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border-primary rounded-xl w-full max-w-md shadow-2xl overflow-hidden mx-4">
            <div className="px-4 sm:px-5 py-4 border-b border-border-primary flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-primary">Invite New Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-subtle hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                  <input
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    className="input pl-9!"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  className="input-secondary"
                >
                  <option value="admin">Admin</option>
                  <option value="responder">Responder</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="px-4 sm:px-5 py-4 border-t border-border-primary bg-surface-card flex justify-end gap-3">
              <button onClick={() => setShowInviteModal(false)} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleInvite} className="btn-primary" disabled={isSendingInvite}>
                {isSendingInvite ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-overlay-scrim backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border-primary rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-primary flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-primary">Filter Team Members</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-subtle hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Role</label>
                <select
                  value={selectedRoleFilter}
                  onChange={(event) => setSelectedRoleFilter(event.target.value)}
                  className="mt-1 w-full bg-surface border border-border-primary rounded-lg p-2 text-[13px] text-primary focus:border-brand-soft focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="responder">Responder</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Status</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(event) => setSelectedStatusFilter(event.target.value)}
                  className="mt-1 w-full bg-surface border border-border-primary rounded-lg p-2 text-[13px] text-primary focus:border-brand-soft focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border-primary bg-surface-card flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedRoleFilter("all");
                  setSelectedStatusFilter("all");
                  setShowFilterModal(false);
                }}
                className="btn-outline"
              >
                Reset
              </button>
              <button onClick={() => setShowFilterModal(false)} className="btn-primary">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoardTeam;
