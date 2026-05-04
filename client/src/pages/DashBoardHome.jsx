import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Timer,
  BarChart3,
  Building2,
  Activity,
  User,
  Clock,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import { getIncidentsForOrganization } from "../incident/incidentApi";
import {
  createOrganization,
  getOrganizationById,
  requestToJoinOrganization,
} from "../organization/organizationApi";

const DashBoardHome = () => {
  const { user, refreshUser } = useAuth();
  const hasOrganizations = Boolean(user?.memberships?.length);
  const primaryMembership = user?.memberships?.[0];
  const primaryOrganizationId =
    primaryMembership?.organization?._id || primaryMembership?.organization;
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isJoinOrgOpen, setIsJoinOrgOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [isSubmittingOrganization, setIsSubmittingOrganization] = useState(false);
  const [isSubmittingJoinRequest, setIsSubmittingJoinRequest] = useState(false);
  const [organizationSummary, setOrganizationSummary] = useState(null);
  const [isLoadingOrganizationSummary, setIsLoadingOrganizationSummary] =
    useState(false);

  const [activeIncidentsList, setActiveIncidentsList] = useState([]);
  const [resolvedIncidentsList, setResolvedIncidentsList] = useState([]);

  const closeCreateOrganizationModal = () => {
    if (isSubmittingOrganization) {
      return;
    }

    setIsCreateOrgOpen(false);
    setOrganizationName("");
  };

  const closeJoinOrganizationModal = () => {
    if (isSubmittingJoinRequest) {
      return;
    }

    setIsJoinOrgOpen(false);
    setOrganizationId("");
  };

  const handleCreateOrganization = async (event) => {
    event.preventDefault();

    const trimmedName = organizationName.trim();
    if (!trimmedName) {
      toast.error("Organization name is required.");
      return;
    }

    setIsSubmittingOrganization(true);

    try {
      const organization = await createOrganization({ name: trimmedName });
      await refreshUser();
      closeCreateOrganizationModal();
      toast.success(
        `${organization?.name || trimmedName} was created successfully.`
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Unable to create organization right now. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmittingOrganization(false);
    }
  };

  const handleJoinOrganization = async (event) => {
    event.preventDefault();

    const trimmedOrgId = organizationId.trim();
    if (!trimmedOrgId) {
      toast.error("Organization ID is required.");
      return;
    }

    setIsSubmittingJoinRequest(true);

    try {
      await requestToJoinOrganization(trimmedOrgId);
      closeJoinOrganizationModal();
      toast.success("Join request sent successfully.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Unable to send your join request right now. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmittingJoinRequest(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadOrganizationSummary = async () => {
      if (!primaryOrganizationId) {
        if (isMounted) {
          setOrganizationSummary(null);
        }
        return;
      }

      if (isMounted) {
        setIsLoadingOrganizationSummary(true);
      }

      try {
        const [organizationData, incidents] = await Promise.all([
          getOrganizationById(primaryOrganizationId),
          getIncidentsForOrganization(primaryOrganizationId),
        ]);

        if (!isMounted) {
          return;
        }

        const activeIncidents = incidents.filter(
          (incident) => incident.status !== "resolved"
        );

        const resolvedIncidents = incidents.filter(
          (incident) => incident.status === "resolved"
        );

        const severityCounts = activeIncidents.reduce(
          (counts, incident) => {
            counts[incident.severity] += 1;
            return counts;
          },
          {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
          }
        );

        const totalMembers = organizationData.members?.length || 0;
        const onlineMembers = (organizationData.members || []).filter((member) => {
          if (!member.lastLoginAt) {
            return false;
          }

          return (
            Date.now() - new Date(member.lastLoginAt).getTime() <= 15 * 60 * 1000
          );
        }).length;

        setActiveIncidentsList(activeIncidents);
        setResolvedIncidentsList(resolvedIncidents);

        setOrganizationSummary({
          organization: organizationData.organization,
          role: primaryMembership?.role || "viewer",
          severityCounts,
          totalMembers,
          onlineMembers,
          activeIncidents: activeIncidents.length,
          criticalIncidents: severityCounts.critical,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setOrganizationSummary(null);
        const message =
          error.response?.data?.message ||
          "Unable to load organization summary right now.";
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoadingOrganizationSummary(false);
        }
      }
    };

    loadOrganizationSummary();

    return () => {
      isMounted = false;
    };
  }, [primaryMembership?.role, primaryOrganizationId]);

  const topMetrics = [
    {
      id: 1,
      label: "Active Incidents",
      value: organizationSummary?.activeIncidents ?? 0,
      change: "Current count",
      changeColor: "text-subtle",
      icon: AlertTriangle,
      iconColor: "text-danger-soft",
      iconFill: true,
      borderClass: "",
      bgClass: "",
      valueColor: "text-danger-soft",
    },
    {
      id: 2,
      label: "Organization Members",
      value: organizationSummary?.totalMembers ?? 0,
      change: `${organizationSummary?.onlineMembers ?? 0} currently online`,
      changeColor: "text-brand-strong",
      icon: Building2,
      iconColor: "text-brand-strong",
      iconFill: false,
      borderClass: "",
      bgClass: "",
      valueColor: "text-primary",
    },
    {
      id: 3,
      label: "Low/Med Severity",
      value: (organizationSummary?.severityCounts?.low ?? 0) + (organizationSummary?.severityCounts?.medium ?? 0),
      change: "Minor incidents",
      changeColor: "text-subtle",
      icon: BarChart3,
      iconColor: "text-subtle",
      iconFill: false,
      borderClass: "",
      bgClass: "",
      valueColor: "text-primary",
    },
    {
      id: 4,
      label: "Critical (P1)",
      value: organizationSummary?.severityCounts?.critical ?? 0,
      change: "Immediate action",
      changeColor: "text-danger-soft",
      icon: AlertTriangle,
      iconColor: "text-danger-soft pulse-glow",
      iconFill: true,
      borderClass: "border-danger-border-strong",
      bgClass: "bg-danger-bg-subtle",
      valueColor: "text-danger-soft",
    },
  ];

  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return {
          color: 'text-danger-soft',
          bg: 'bg-danger-bg-subtle border-danger-border-strong',
          text: 'Critical'
        };
      case 'high':
        return {
          color: 'text-semantic-warning',
          bg: 'bg-semantic-warning/10 border-semantic-warning/20',
          text: 'High'
        };
      case 'medium':
        return {
          color: 'text-brand-strong',
          bg: 'bg-brand-muted border-brand/25',
          text: 'Medium'
        };
      default:
        return {
          color: 'text-subtle',
          bg: 'bg-surface-elevated border-border-primary',
          text: severity?.charAt(0).toUpperCase() + severity?.slice(1) || 'Low'
        };
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case "open":
        return "bg-danger-soft";
      case "investigating":
        return "bg-semantic-warning";
      case "resolved":
        return "bg-semantic-success";
      default:
        return "bg-subtle";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "open":
        return "text-danger-soft";
      case "investigating":
        return "text-semantic-warning";
      case "resolved":
        return "text-semantic-success";
      default:
        return "text-subtle";
    }
  };

  return (
    <div className="text-primary h-full w-full">
      <main className="h-full w-full px-4 py-3">
        <div className="lg:pb-12 pb-6">
          <div className="mb-6">
            <h2 className="text-[20px] sm:text-[24px] leading-[1.3] tracking-[-0.01em] font-semibold text-primary">
              Welcome back, {user?.name || "Responder"}
            </h2>
            <p className="text-[12px] sm:text-[13px] leading-normal text-secondary mt-1">
              Signed in as {user?.email || "your account"}. Overview of
              platform health and incident response performance.
            </p>
          </div>

          {!hasOrganizations ? (
            <div className="border border-border-primary bg-surface-widget rounded-2xl p-6 sm:p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_30%)] pointer-events-none" />
              <div className="relative max-w-2xl">
                <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border-primary flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-brand-strong" />
                </div>
                <h3 className="text-[22px] sm:text-[28px] leading-tight font-semibold text-primary mb-2">
                  You are not part of any organization yet
                </h3>
                <p className="text-sm sm:text-[15px] text-secondary max-w-xl mb-6">
                  Join an existing organization to collaborate with your team,
                  or create a new one to start managing incidents from your own
                  workspace.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setIsJoinOrgOpen(true);
                    }}
                    className="btn-primary inline-flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Join Organization
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsCreateOrgOpen(true)}
                    className="btn-outline inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Organization
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="bg-surface-widget border border-border-primary rounded-2xl p-5 sm:p-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%)] pointer-events-none" />
                  <div className="relative">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-11 h-11 rounded-xl bg-surface-elevated border border-border-primary flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-brand-strong" />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-tertiary font-medium">
                              Current Organization
                            </p>
                            <h3 className="text-[22px] sm:text-[26px] font-semibold text-primary leading-tight">
                              {organizationSummary?.organization?.name ||
                                "Loading organization..."}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-secondary">
                          Role:{" "}
                          <span className="text-primary font-medium capitalize">
                            {organizationSummary?.role || primaryMembership?.role || "viewer"}
                          </span>
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full border border-border-primary bg-surface-elevated px-3 py-1.5">
                        <Activity className="w-4 h-4 text-semantic-success" />
                        <span className="text-sm text-primary">
                          {isLoadingOrganizationSummary
                            ? "Loading activity..."
                            : `${organizationSummary?.onlineMembers ?? 0} online / ${
                                organizationSummary?.totalMembers ?? 0
                              } members`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
                      <div className="rounded-xl border border-border-primary bg-surface-elevated p-4">
                        <p className="text-[11px] uppercase tracking-wider text-tertiary font-medium mb-2">
                          Active Incidents
                        </p>
                        <p className="text-2xl font-semibold text-primary">
                          {organizationSummary?.activeIncidents ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border-primary bg-surface-elevated p-4">
                        <p className="text-[11px] uppercase tracking-wider text-tertiary font-medium mb-2">
                          Low
                        </p>
                        <p className="text-2xl font-semibold text-primary">
                          {organizationSummary?.severityCounts?.low ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border-primary bg-surface-elevated p-4">
                        <p className="text-[11px] uppercase tracking-wider text-tertiary font-medium mb-2">
                          Medium
                        </p>
                        <p className="text-2xl font-semibold text-brand-strong">
                          {organizationSummary?.severityCounts?.medium ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border-primary bg-surface-elevated p-4">
                        <p className="text-[11px] uppercase tracking-wider text-tertiary font-medium mb-2">
                          High
                        </p>
                        <p className="text-2xl font-semibold text-semantic-warning">
                          {organizationSummary?.severityCounts?.high ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-danger-border-strong bg-danger-bg-subtle p-4">
                        <p className="text-[11px] uppercase tracking-wider text-danger-soft font-medium mb-2">
                          Critical
                        </p>
                        <p className="text-2xl font-semibold text-danger-soft">
                          {organizationSummary?.severityCounts?.critical ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
                {topMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className={`bg-surface-widget border border-border-primary rounded-xl p-3 ${metric.borderClass} ${metric.bgClass}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-subtle text-[11px] leading-none tracking-[0.01em] font-medium uppercase">
                        {metric.label}
                      </span>
                      <metric.icon
                        className={`${metric.iconColor} w-4 h-4`}
                        fill={metric.iconFill ? "currentColor" : "none"}
                      />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-[24px] sm:text-[28px] leading-[1.2] tracking-[-0.02em] font-bold ${metric.valueColor}`}
                      >
                        {metric.value}
                      </span>
                      <span className={`text-xs ${metric.changeColor}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="sm:col-span-2 bg-surface-widget border border-border-primary rounded-xl overflow-hidden">
                  <div className="p-3 sm:p-4 border-b border-border-primary flex justify-between items-center">
                    <h3 className="text-[16px] sm:text-[18px] leading-[1.4] font-semibold text-primary">
                      Active Incidents
                    </h3>
                    <Link
                      to="/home/incident"
                      className="text-brand text-[12px] leading-none tracking-[0.01em] font-medium hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="divide-y divide-border-primary">
                    {activeIncidentsList.length > 0 ? (
                      activeIncidentsList.map((incident) => {
                        const styles = getSeverityStyles(incident.severity);
                        return (
                          <div
                            key={incident._id}
                            className="p-4 hover:bg-surface-elevated transition-colors flex items-center gap-4"
                          >
                            <div
                              className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${styles.bg}`}
                            >
                              <span className={`font-bold ${styles.color}`}>
                                {incident.severity?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-primary font-medium truncate">
                                  {incident.title}
                                </span>
                                <span
                                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${styles.bg}`}
                                >
                                  {styles.text}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4 text-xs text-subtle">
                                <span className="flex items-center gap-1 truncate">
                                  <User className="w-3 h-3 shrink-0" />{" "}
                                  <span className="truncate">
                                    {incident.createdBy?.name || "Member"}
                                  </span>
                                </span>
                                <span className="flex items-center gap-1 shrink-0">
                                  <Clock className="w-3 h-3" /> {new Date(incident.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Link to="/home/incident_details" state={{ incidentId: incident._id }} className="p-2 hover:bg-surface-inset rounded-lg text-subtle">
                              <ChevronRight className="w-5 h-5" />
                            </Link>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-secondary">
                        No active incidents found.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-surface-widget border border-border-primary rounded-xl p-3 sm:p-4">
                  <h3 className="text-[16px] sm:text-[18px] leading-[1.4] font-semibold text-primary mb-4">
                    System Health
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${(organizationSummary?.severityCounts?.critical > 0 || organizationSummary?.severityCounts?.high > 0) ? "bg-danger-soft" : "bg-semantic-success"}`}></span>
                        <span className="text-sm font-medium text-primary">Core Services</span>
                      </div>
                      <span className={`text-xs ${(organizationSummary?.severityCounts?.critical > 0 || organizationSummary?.severityCounts?.high > 0) ? "text-danger-soft" : "text-semantic-success"}`}>
                        {(organizationSummary?.severityCounts?.critical > 0 || organizationSummary?.severityCounts?.high > 0) ? "Degraded" : "Operational"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${organizationSummary?.severityCounts?.critical > 0 ? "bg-danger-soft" : "bg-semantic-success"}`}></span>
                        <span className="text-sm font-medium text-primary">Incident Pipeline</span>
                      </div>
                      <span className={`text-xs ${organizationSummary?.severityCounts?.critical > 0 ? "text-danger-soft" : "text-semantic-success"}`}>
                        {organizationSummary?.severityCounts?.critical > 0 ? "Under Load" : "Healthy"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-border-primary">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-subtle uppercase font-medium">
                        On-Call Status
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-border-primary flex items-center justify-center bg-surface-elevated">
                        <User className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {user?.name || "You"}
                        </p>
                        <p className="text-xs text-subtle">
                          Active responder
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-widget border border-border-primary rounded-xl overflow-hidden w-full">
                <div className="p-3 sm:p-4 border-b border-border-primary">
                  <h3 className="text-[16px] sm:text-[18px] leading-[1.4] font-semibold text-primary">
                    Resolved Incidents
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-150">
                    <thead className="bg-surface-elevated text-subtle text-xs uppercase tracking-wider font-medium">
                      <tr>
                        <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">
                          Incident ID
                        </th>
                        <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">
                          Title
                        </th>
                        <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">
                          Duration
                        </th>
                        <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">
                          Resolved At
                        </th>
                        <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">
                          Responder
                        </th>
                        <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary text-sm text-secondary">
                      {resolvedIncidentsList.length > 0 ? (
                        resolvedIncidentsList.map((incident) => (
                          <tr
                            key={incident._id}
                            className="hover:bg-surface-elevated transition-colors"
                          >
                            <td className="px-3 py-3 sm:px-4 sm:py-4 font-mono text-xs">
                              {incident._id?.slice(-8).toUpperCase()}
                            </td>
                            <td className="px-3 py-3 sm:px-4 sm:py-4 font-medium text-primary">
                              {incident.title}
                            </td>
                            <td className="px-3 py-3 sm:px-4 sm:py-4">
                              {new Date(incident.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 text-subtle">
                              {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-4">{incident.createdBy?.name || "Member"}</td>
                            <td className="px-4 py-4">
                              <span className="flex items-center gap-1.5 text-semantic-success text-xs">
                                <CheckCircle2
                                  className="w-4 h-4"
                                  fill="currentColor"
                                />
                                Resolved
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-4 py-8 text-center text-secondary">
                            No resolved incidents found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {isCreateOrgOpen && (
        <div className="fixed inset-0 z-50 bg-overlay-scrim backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-primary bg-surface-widget shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-border-primary px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Create organization
                </h3>
                <p className="mt-1 text-sm text-secondary">
                  Start a new workspace for your team and incident operations.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateOrganizationModal}
                className="rounded-lg p-2 text-subtle hover:bg-surface-elevated hover:text-primary transition-colors"
                disabled={isSubmittingOrganization}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrganization} className="px-5 py-5">
              <label className="block text-[11px] font-medium text-tertiary uppercase tracking-wider mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                placeholder="Acme Security"
                className="input w-full"
                minLength={2}
                maxLength={100}
                autoFocus
                disabled={isSubmittingOrganization}
              />

              <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateOrganizationModal}
                  className="btn-outline"
                  disabled={isSubmittingOrganization}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmittingOrganization}
                >
                  {isSubmittingOrganization && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isJoinOrgOpen && (
        <div className="fixed inset-0 z-50 bg-overlay-scrim backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-primary bg-surface-widget shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-border-primary px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Join organization
                </h3>
                <p className="mt-1 text-sm text-secondary">
                  Enter the organization ID to send a join request to its admins.
                </p>
              </div>
              <button
                type="button"
                onClick={closeJoinOrganizationModal}
                className="rounded-lg p-2 text-subtle hover:bg-surface-elevated hover:text-primary transition-colors"
                disabled={isSubmittingJoinRequest}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleJoinOrganization} className="px-5 py-5">
              <label className="block text-[11px] font-medium text-tertiary uppercase tracking-wider mb-2">
                Organization ID
              </label>
              <input
                type="text"
                value={organizationId}
                onChange={(event) => setOrganizationId(event.target.value)}
                placeholder="680f4f9d2d5f1a1234567890"
                className="input w-full"
                autoFocus
                disabled={isSubmittingJoinRequest}
              />

              <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeJoinOrganizationModal}
                  className="btn-outline"
                  disabled={isSubmittingJoinRequest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmittingJoinRequest}
                >
                  {isSubmittingJoinRequest && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="fixed lg:bottom-4 right-4 sm:bottom-8 sm:right-8 flex items-center gap-2 sm:gap-3 bg-surface-elevated border border-border-primary rounded-full pl-2 pr-3 sm:pr-4 py-1.5 sm:py-2 shadow-2xl z-40 bottom-14 md:bottom-16">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
          <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full pulse-glow block ${organizationSummary?.severityCounts?.critical > 0 ? "bg-danger-soft" : "bg-semantic-success"}`}></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] sm:text-[10px] text-subtle leading-none uppercase font-bold">
            Org Status
          </span>
          <span className="text-[10px] sm:text-xs text-primary font-medium">
            {organizationSummary?.activeIncidents > 0 ? `${organizationSummary.activeIncidents} Active Incidents` : "All Systems Healthy"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashBoardHome;
