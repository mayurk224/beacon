import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Trash2,
  User,
  Monitor,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import {
  changePassword,
  deleteAvatar as deleteProfileAvatar,
  getProfile,
  updateAvatar,
  updateProfile,
  getActiveSessions,
  logoutAllSessions,
} from "../profile/profileApi";

const initialPasswordState = {
  currentPassword: "",
  newPassword: "",
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, setAuthenticatedUser } = useAuth();

  const [profile, setProfile] = useState(user);
  const [draftName, setDraftName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [passwordForm, setPasswordForm] = useState(initialPasswordState);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const currentProfile = await getProfile();
        if (!isMounted) {
          return;
        }
        setProfile(currentProfile);
        setDraftName(currentProfile.name || "");
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Unable to load your profile.",
          );
        }
      }
    };

    const loadSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const data = await getActiveSessions();
        if (isMounted) {
          setSessions(data.sessions || []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.response?.data?.message || "Unable to load active sessions.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingSessions(false);
        }
      }
    };

    loadProfile();
    loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayProfile = profile || user;

  const beginEditing = () => {
    setDraftName(displayProfile?.name || "");
    setIsEditing(true);
  };

  const stopEditing = () => {
    setDraftName(displayProfile?.name || "");
    setIsEditing(false);
  };

  const syncUser = (nextUser) => {
    setProfile(nextUser);
    setAuthenticatedUser(nextUser);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const nextUser = await updateProfile({ name: draftName.trim() });
      syncUser(nextUser);
      setIsEditing(false);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.message ||
          "Unable to update your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
      toast.success("Logged out of all sessions.");
      handleLogout();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to logout of all sessions."
      );
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const nextUser = await updateAvatar(file);
      syncUser(nextUser);
      toast.success("Avatar updated.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to upload your avatar.",
      );
    } finally {
      event.target.value = "";
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsRemovingAvatar(true);

    try {
      const nextUser = await deleteProfileAvatar();
      syncUser(nextUser);
      toast.success("Avatar removed.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to remove your avatar.",
      );
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setIsChangingPassword(true);

    try {
      await changePassword(passwordForm);
      toast.success("Password changed. Please sign in again.");
      await logout();
      navigate("/signin");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.message ||
          "Unable to change your password.",
      );
    } finally {
      setIsChangingPassword(false);
      setPasswordForm(initialPasswordState);
    }
  };

  return (
    <div className="text-primary min-h-screen w-full flex justify-center p-6">
      <div className="w-full max-w-140 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold">Profile</h1>
            <p className="text-[13px] text-subtle">
              Manage your account details
            </p>
          </div>

          <button
            onClick={() => (isEditing ? stopEditing() : beginEditing())}
            className="btn-outline"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="bg-surface-header border border-border-primary rounded-lg p-6 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={
                  displayProfile?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayProfile?.name || "User",
                  )}&background=0f172a&color=ffffff`
                }
                alt="profile"
                className="w-24 h-24 rounded-full object-cover border border-border-muted"
              />

              <label className="absolute bottom-0 right-0 bg-brand-soft text-on-brand p-2 rounded-full cursor-pointer">
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>

            {displayProfile?.avatar && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                disabled={isRemovingAvatar}
                className="text-xs text-muted hover:text-danger-soft"
              >
                {isRemovingAvatar ? "Removing..." : "Remove avatar"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase text-tertiary">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
              <input
                value={isEditing ? draftName : displayProfile?.name || ""}
                disabled={!isEditing}
                onChange={(event) => setDraftName(event.target.value)}
                className="input pl-9!"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase text-tertiary">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
              <input
                value={displayProfile?.email || ""}
                disabled
                className="input pl-9!"
              />
            </div>
            <p className="text-xs text-muted">
              Email changes are not exposed by the current server API.
            </p>
          </div>

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          )}

          <div className="h-px bg-border-primary" />

          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold">Change Password</h2>
              <p className="text-xs text-muted mt-1">
                Local accounts can rotate their password here.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-tertiary">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  className="input pl-9!"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-tertiary">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  className="input pl-9!"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn-outline"
            >
              {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </form>

          <div className="h-px bg-border-primary" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Active Sessions</h2>
                <p className="text-xs text-muted mt-1">
                  You're signed in on these devices.
                </p>
              </div>
              <button onClick={handleLogoutAll} className="text-xs text-danger-soft hover:text-danger">
                Logout all
              </button>
            </div>

            {isLoadingSessions ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-subtle" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-md bg-surface-base border border-border-muted">
                    <Monitor className="w-5 h-5 text-tertiary" />
                    <div className="flex-1 flex flex-col">
                      <p className="text-sm font-medium">{session.userAgent || "Unknown Device"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Globe className="w-3 h-3 text-muted" />
                        <span className="text-[11px] text-muted">{session.ip || "Unknown IP"}</span>
                        <span className="text-[11px] text-muted">•</span>
                        <span className="text-[11px] text-muted">Started {new Date(session.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && !isLoadingSessions && (
                  <p className="text-sm text-muted text-center py-4">No active sessions found.</p>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-border-primary" />

          <div className="flex flex-col gap-3">
            <button onClick={handleLogout} className="btn-outline">
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            <button
              type="button"
              className="btn-destructive"
              disabled
              title="The backend does not currently expose account deletion."
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
