import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import { updateProfile, changePassword as apiChangePassword, logoutAllSessions } from "../profile/profileApi";

const DashBoardSetting = () => {
  const navigate = useNavigate();
  const { user, logout, setAuthenticatedUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setName(user.name || '');
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const nextUser = await updateProfile({ name: name.trim() });
      setAuthenticatedUser(nextUser);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please enter current and new password.');
      return;
    }
    setIsChangingPassword(true);
    try {
      await apiChangePassword(passwordForm);
      toast.success('Password changed! Please log in again.');
      await logout();
      navigate('/signin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    }
  };

  const handleDelete = () => {
    toast.error('Account deletion is not currently supported.');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div className="text-primary min-h-screen w-full p-6 md:p-10">
      <div className="max-w-xl mx-auto bg-surface-card border border-border-primary rounded-xl p-6 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-subtle mt-1">
            Manage your account
          </p>
        </div>

        {/* Profile */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-tertiary">Profile</h3>

          <div>
            <label className="text-xs text-subtle">Name</label>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-4 h-4 text-subtle" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-border-primary rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-subtle">Email</label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-subtle" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-border-primary rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Changes
          </button>
        </div>

        {/* Password */}
        <div className="space-y-4 border-t border-border-primary pt-6">
          <h3 className="text-sm font-medium text-tertiary">Password</h3>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full bg-surface border border-border-primary rounded-lg p-2 text-sm pr-10"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-surface border border-border-primary rounded-lg p-2 text-sm pr-10"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-subtle"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="btn-outline"
          >
            {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Change Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4 border-t border-border-primary pt-6">


          <button
            onClick={handleLogout}
            className="flex items-center gap-2 btn-outline"
          >
            <LogOut size={16} />
            Logout
          </button>

          <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>

          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-4 py-1.5 border border-transparent rounded bg-semantic-error hover:bg-danger-hover transition-colors text-[13px] font-medium text-white shadow-sm
}"
          >
            <Trash2 size={16} />
            Delete Account
          </button>

        </div>

      </div>
    </div>
  );
};

export default DashBoardSetting;