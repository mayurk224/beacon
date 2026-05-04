import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import {
  addIncidentUpdate,
  assignIncidentResponders,
  getIncidentById,
  getIncidentResponders,
  getIncidentUpdates,
  unassignIncidentResponders,
} from "../incident/incidentApi";
import { getOrganizationById } from "../organization/organizationApi";

const severityColorMap = {
  critical: "bg-danger-soft text-danger-soft border-danger-soft/30",
  high: "bg-orange-500 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500 text-yellow-500 border-yellow-500/20",
  low: "bg-blue-500 text-blue-500 border-blue-500/20",
};

const statusOptions = ["open", "investigating", "resolved"];

const DashBoardIncidentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const incidentId =
    location.state?.incidentId || window.sessionStorage.getItem("activeIncidentId");
  const primaryMembership = user?.memberships?.[0];
  const primaryOrganizationId =
    primaryMembership?.organization?._id || primaryMembership?.organization;
  const canManageIncident = primaryMembership?.role !== "viewer";

  const [incident, setIncident] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [responders, setResponders] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [newUpdateMessage, setNewUpdateMessage] = useState("");
  const [nextStatus, setNextStatus] = useState("investigating");
  const [selectedResponderIds, setSelectedResponderIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [isSavingResponders, setIsSavingResponders] = useState(false);

  const loadIncident = useCallback(async () => {
    if (!incidentId) {
      return;
    }

    setIsLoading(true);
    try {
      const [incidentData, incidentUpdates, assignedResponders, organizationData] =
        await Promise.all([
          getIncidentById(incidentId),
          getIncidentUpdates(incidentId),
          getIncidentResponders(incidentId),
          primaryOrganizationId
            ? getOrganizationById(primaryOrganizationId)
            : Promise.resolve({ members: [] }),
        ]);

      setIncident(incidentData);
      setUpdates(incidentUpdates);
      setResponders(assignedResponders);
      setSelectedResponderIds(
        assignedResponders.map((responder) => responder.userId),
      );
      setMembers(organizationData.members || []);
      setNextStatus(
        incidentData.status === "resolved" ? "resolved" : "investigating",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load incident details.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [incidentId, primaryOrganizationId]);

  useEffect(() => {
    if (location.state?.incidentId) {
      window.sessionStorage.setItem("activeIncidentId", location.state.incidentId);
    }
  }, [location.state]);

  useEffect(() => {
    const run = async () => {
      await loadIncident();
    };

    run();
  }, [loadIncident]);

  const parsedDescription = useMemo(() => {
    const rawDescription = incident?.description || "";
    const [mainDescription, tagLine] = rawDescription.split("\n\nTags: ");
    return {
      mainDescription,
      tags:
        tagLine
          ?.split(",")
          .map((tag) => tag.trim())
          .filter(Boolean) || [],
    };
  }, [incident?.description]);

  const handleSubmitUpdate = async () => {
    if (!newUpdateMessage.trim()) {
      toast.error("Update message is required.");
      return;
    }

    setIsSubmittingUpdate(true);
    try {
      await addIncidentUpdate(incidentId, {
        message: newUpdateMessage.trim(),
        status: nextStatus,
      });
      toast.success("Incident update posted.");
      setNewUpdateMessage("");
      await loadIncident();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.message ||
          "Unable to post update.",
      );
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleResponderToggle = (userId) => {
    setSelectedResponderIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const handleSaveResponders = async () => {
    const currentIds = responders.map((responder) => responder.userId);
    const toAssign = selectedResponderIds.filter((id) => !currentIds.includes(id));
    const toUnassign = currentIds.filter((id) => !selectedResponderIds.includes(id));

    if (toAssign.length === 0 && toUnassign.length === 0) {
      toast.message("Responder assignments are already up to date.");
      return;
    }

    setIsSavingResponders(true);
    try {
      if (toAssign.length > 0) {
        await assignIncidentResponders(incidentId, toAssign);
      }
      if (toUnassign.length > 0) {
        await unassignIncidentResponders(incidentId, toUnassign);
      }
      toast.success("Responder assignments updated.");
      await loadIncident();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update responders.",
      );
    } finally {
      setIsSavingResponders(false);
    }
  };

  if (!incidentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-header text-primary">
        <div className="text-center">
          <p className="text-sm text-muted">No incident selected.</p>
          <button className="btn-primary mt-4" onClick={() => navigate("/home/incidents")}>
            Back to incidents
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-header text-primary">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading incident details...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-header text-primary min-h-screen w-full antialiased">
      <div className="flex flex-col h-full">
        <div className="flex-none px-6 py-6 border-b border-border-primary bg-surface-card">
          <div className="flex flex-col gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-1 text-tertiary font-mono text-[11px] mb-1">
              <button
                type="button"
                onClick={() => navigate("/home/incidents")}
                className="hover:text-brand-soft transition-colors"
              >
                Incidents
              </button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary">{incident._id?.slice(-8).toUpperCase()}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 flex items-start gap-4">
                <div className="mt-1 flex-none w-10 h-10 rounded bg-semantic-error/10 border border-danger-soft/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-danger-soft" />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <h1 className="text-[24px] leading-[32px] tracking-[-0.02em] font-semibold text-primary">
                    {incident.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-tertiary font-mono text-[11px]">
                    <span className="flex items-center gap-1.5 capitalize">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          incident.status === "resolved" ? "bg-semantic-success" : "bg-danger-soft"
                        }`}
                      ></span>
                      {incident.status}
                    </span>
                    <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
                    <span>Updated: {new Date(incident.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <button
                  className="btn-primary"
                  onClick={() => setNextStatus("resolved")}
                  disabled={!canManageIncident}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Resolve
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 border-b border-border-primary">
              {["overview", "activity", "notes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-1 py-2 border-b-2 transition-all text-[12px] font-medium capitalize ${
                    activeTab === tab
                      ? "border-brand-soft text-brand-soft"
                      : "border-transparent text-tertiary hover:text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto p-6 border-r border-border-primary custom-scrollbar">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-surface-card border border-border-primary rounded-lg p-5">
                  <h3 className="text-[16px] font-semibold text-primary mb-3">Description</h3>
                  <div className="text-[13px] leading-[18px] text-tertiary whitespace-pre-line">
                    {parsedDescription.mainDescription}
                  </div>
                  {parsedDescription.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {parsedDescription.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border-primary bg-surface-elevated px-3 py-1 text-xs text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-surface-card border border-border-primary rounded-lg p-5">
                  <h3 className="text-[16px] font-semibold text-primary mb-4">Post Update</h3>
                  <div className="space-y-4">
                    <textarea
                      value={newUpdateMessage}
                      onChange={(event) => setNewUpdateMessage(event.target.value)}
                      placeholder="Share the latest findings, mitigation, or resolution notes..."
                      rows={4}
                      className="w-full bg-surface border border-border-primary rounded-lg p-3 text-[13px] text-primary focus:border-brand-soft focus:outline-none resize-none"
                      disabled={!canManageIncident}
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <select
                        value={nextStatus}
                        onChange={(event) => setNextStatus(event.target.value)}
                        className="input-secondary max-w-48"
                        disabled={!canManageIncident}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleSubmitUpdate}
                        disabled={isSubmittingUpdate || !canManageIncident}
                        className="btn-primary"
                      >
                        {isSubmittingUpdate ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Post Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === "activity" || activeTab === "notes") && (
              <div className="space-y-4">
                {updates.length === 0 ? (
                  <div className="rounded-lg border border-border-primary bg-surface-card p-6 text-sm text-muted">
                    No incident updates yet.
                  </div>
                ) : (
                  updates.map((update) => (
                    <div
                      key={update._id}
                      className="bg-surface-card border border-border-primary rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-subtle" />
                            <span className="text-[12px] font-medium text-primary">
                              {update.createdBy?.name || "System"}
                            </span>
                            {update.status && (
                              <span className="rounded-full border border-border-primary px-2 py-0.5 text-[10px] capitalize text-muted">
                                {update.status}
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-[13px] text-tertiary whitespace-pre-line">
                            {update.message}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-subtle">
                          {new Date(update.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="w-full lg:w-[320px] bg-surface-header border-l border-border-primary overflow-y-auto flex-none">
            <div className="p-5 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-card border border-border-primary rounded p-3 flex flex-col gap-1.5">
                  <span className="font-mono text-subtle text-[10px] uppercase tracking-wider">Severity</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${severityColorMap[incident.severity]?.split(" ")[0] || "bg-muted"}`}></span>
                    <span className="text-[12px] font-medium text-primary capitalize">{incident.severity}</span>
                  </div>
                </div>
                <div className="bg-surface-card border border-border-primary rounded p-3 flex flex-col gap-1.5">
                  <span className="font-mono text-subtle text-[10px] uppercase tracking-wider">Status</span>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-brand-soft" />
                    <span className="text-[12px] font-medium text-primary capitalize">{incident.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-subtle text-[10px] uppercase tracking-wider mb-2">Responders</h4>
                <div className="space-y-2">
                  {responders.length === 0 ? (
                    <div className="rounded-lg border border-border-primary bg-surface-card p-3 text-sm text-muted">
                      No responders assigned.
                    </div>
                  ) : (
                    responders.map((responder) => (
                      <div key={responder.userId} className="flex items-center justify-between rounded-lg border border-border-primary bg-surface-card px-3 py-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-border-muted" />
                          <span className="text-[13px] text-tertiary">{responder.name}</span>
                        </div>
                        <span className="text-[11px] capitalize text-muted">{responder.role}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-surface-interactive"></div>

              <div>
                <h4 className="font-mono text-subtle text-[10px] uppercase tracking-wider mb-3">Manage Responders</h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {members.map((member) => (
                    <label
                      key={member.userId}
                      className="flex items-center justify-between rounded-lg border border-border-primary bg-surface-card px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-border-muted" />
                        <div>
                          <div className="text-[13px] text-primary">{member.name}</div>
                          <div className="text-[11px] capitalize text-muted">{member.role}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedResponderIds.includes(member.userId)}
                        onChange={() => handleResponderToggle(member.userId)}
                        className="h-4 w-4 rounded border border-border-primary bg-surface-card accent-brand-strong"
                        disabled={!canManageIncident}
                      />
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSaveResponders}
                  disabled={isSavingResponders || !canManageIncident}
                  className="btn-outline mt-3 w-full"
                >
                  {isSavingResponders && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Responders
                </button>
              </div>

              <div className="w-full h-px bg-surface-interactive"></div>

              <div className="rounded-lg border border-border-primary bg-surface-card p-4">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Clock className="w-4 h-4 text-subtle" />
                  Timeline
                </div>
                <div className="mt-3 text-xs text-muted">
                  Created by {incident.createdBy?.name || "unknown"} on{" "}
                  {new Date(incident.createdAt).toLocaleString()}
                </div>
                {incident.resolvedAt && (
                  <div className="mt-2 text-xs text-semantic-success">
                    Resolved on {new Date(incident.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardIncidentDetails;
