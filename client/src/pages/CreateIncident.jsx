import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, CloudUpload, Loader2, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import { getOrganizationById } from "../organization/organizationApi";
import { useIncident } from "../incident/useIncident";

const severityOptions = [
  { id: "critical", label: "Critical", color: "text-danger-soft border-danger-soft/30 bg-semantic-error/10" },
  { id: "high", label: "High", color: "text-orange-500 border-orange-500/20 bg-orange-500/5" },
  { id: "medium", label: "Medium", color: "text-yellow-500 border-yellow-500/20 bg-yellow-500/5" },
  { id: "low", label: "Low", color: "text-blue-500 border-blue-500/20 bg-blue-500/5" },
];

const CreateIncident = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNewIncident } = useIncident();
  const primaryMembership = user?.memberships?.[0];
  const primaryOrganizationId =
    primaryMembership?.organization?._id || primaryMembership?.organization;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("high");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      if (!primaryOrganizationId) {
        return;
      }

      setIsLoadingMembers(true);
      try {
        const organization = await getOrganizationById(primaryOrganizationId);
        if (!isMounted) {
          return;
        }
        setMembers(organization.members || []);
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Unable to load organization members.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingMembers(false);
        }
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [primaryOrganizationId]);

  const organizationRole = primaryMembership?.role || "viewer";
  const canCreateIncident = organizationRole !== "viewer";

  const currentAssigneeNames = useMemo(
    () =>
      members
        .filter((member) => selectedAssignees.includes(member.userId))
        .map((member) => member.name),
    [members, selectedAssignees],
  );

  const handleAddTag = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    const nextTag = newTag.trim();

    if (!nextTag || tags.includes(nextTag)) {
      setNewTag("");
      return;
    }

    setTags((current) => [...current, nextTag]);
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((current) => current.filter((tag) => tag !== tagToRemove));
  };

  const handleAssigneeToggle = (userId) => {
    setSelectedAssignees((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!primaryOrganizationId) {
      toast.error("Join or create an organization before creating incidents.");
      return;
    }

    if (!canCreateIncident) {
      toast.error("Your role only allows viewing incidents.");
      return;
    }

    setIsSubmitting(true);

    try {
      const incident = await createNewIncident({
        title: title.trim(),
        description: [description.trim(), tags.length ? `Tags: ${tags.join(", ")}` : ""]
          .filter(Boolean)
          .join("\n\n"),
        severity,
        organizationId: primaryOrganizationId,
        assignedUsers: selectedAssignees,
      });

      toast.success("Incident created successfully.");
      navigate("/home/incident_details", {
        state: { incidentId: incident._id },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.message ||
          "Unable to create the incident right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-primary min-h-screen w-full antialiased">
      <div className="flex h-full">
        <main className="flex-1 pt-12 pb-20 px-8">
          <div className="max-w-[720px] mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text-primary tracking-tight">
                Create Incident
              </h1>
              <p className="mt-2 text-sm text-muted">
                Report a live incident for your current organization and assign responders.
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full text-[22px] font-semibold bg-transparent border-b border-neutral-800 pb-4 placeholder:text-neutral-600 focus:border-brand-strong focus:outline-none"
                  placeholder="What happened? (e.g. API returning 500 errors)"
                  type="text"
                  maxLength={100}
                  required
                />
              </div>

              <div className="relative">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full bg-surface-card border border-border-primary rounded-xl p-5 text-[15px] leading-relaxed placeholder:text-neutral-500 resize-none focus:border-brand-strong focus:outline-none min-h-[160px]"
                  placeholder="Describe what's happening, symptoms, and impact..."
                  rows={7}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">
                    Severity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {severityOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSeverity(option.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          severity === option.id
                            ? option.color
                            : "border border-border-primary text-muted hover:bg-surface-inset"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">
                    Assignees
                  </label>
                  <div className="bg-surface-card border border-border-primary rounded-xl p-4 max-h-48 overflow-y-auto">
                    {isLoadingMembers ? (
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading responders...
                      </div>
                    ) : members.length === 0 ? (
                      <p className="text-sm text-muted">No members found in this organization.</p>
                    ) : (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <label
                            key={member.userId}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border-primary px-3 py-2"
                          >
                            <div>
                              <div className="text-sm text-primary">{member.name}</div>
                              <div className="text-xs text-muted capitalize">{member.role}</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedAssignees.includes(member.userId)}
                              onChange={() => handleAssigneeToggle(member.userId)}
                              className="h-4 w-4 rounded border border-border-primary bg-surface-card accent-brand-strong"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted">
                    {currentAssigneeNames.length > 0
                      ? `Assigned: ${currentAssigneeNames.join(", ")}`
                      : "No responders assigned yet."}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">
                  Tags
                </label>
                <div className="bg-surface-card border border-border-primary rounded-xl p-4 flex flex-wrap gap-2 items-center min-h-[58px]">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1.5 bg-surface-card border border-border-primary px-3 py-1.5 rounded-lg text-sm text-muted"
                    >
                      <Tag className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-muted hover:text-semantic-error transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <input
                    value={newTag}
                    onChange={(event) => setNewTag(event.target.value)}
                    onKeyDown={handleAddTag}
                    className="bg-transparent border-none p-1 text-sm flex-1 min-w-[140px] placeholder:text-subtle focus:outline-none"
                    placeholder="Add tag... (press Enter)"
                    type="text"
                  />
                </div>
              </div>

              <div className="p-6 border-2 border-dashed border-border-primary rounded-2xl bg-surface-elevated/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-11 h-11 rounded-xl bg-brand-soft flex items-center justify-center border border-border-primary flex-shrink-0">
                    <Brain className="w-6 h-6 text-brand-strong" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Notes on AI</h4>
                    <p className="text-sm text-muted mt-1.5 leading-relaxed">
                      The current server does not expose AI enrichment yet, so this form sends your live incident data directly to the backend.
                    </p>
                  </div>
                </div>
                <button type="button" className="btn-outline" disabled>
                  Coming Soon
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                  Attachments
                </label>
                <div className="border border-dashed border-border-primary bg-surface-card rounded-2xl p-12 flex flex-col items-center justify-center opacity-70">
                  <div className="w-14 h-14 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4">
                    <CloudUpload className="w-7 h-7 text-muted" />
                  </div>
                  <p className="text-muted font-medium text-center">
                    File uploads are not wired to incident creation yet
                  </p>
                  <p className="text-xs text-muted mt-1">
                    The backend currently supports avatar uploads, but not incident attachments.
                  </p>
                </div>
              </div>

              <div className="mt-16 flex items-center justify-end gap-4 pb-10">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => navigate("/home/incidents")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !canCreateIncident}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Incident
                </button>
              </div>
            </form>

            {!canCreateIncident && (
              <div className="mt-4 rounded-xl border border-semantic-error/30 bg-semantic-error/10 p-4 text-sm text-danger-soft">
                Your current organization role is `viewer`, so the server will block incident creation.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateIncident;
