import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';

const DashBoardSetting = () => {
  const [name, setName] = useState('Sarah Jenkins');
  const [email, setEmail] = useState('sarah.jenkins@platform.os');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    alert('Profile updated!');
  };

  const handleChangePassword = () => {
    alert('Password changed!');
  };

  const handleDelete = () => {
    alert('Account deleted!');
  };

  const handleLogout = () => {
    alert('Logged out!');
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
            className="btn-primary"
          >
            Save Changes
          </button>
        </div>

        {/* Password */}
        <div className="space-y-4 border-t border-border-primary pt-6">
          <h3 className="text-sm font-medium text-tertiary">Password</h3>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              className="w-full bg-surface border border-border-primary rounded-lg p-2 text-sm"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-subtle"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            onClick={handleChangePassword}
            className="btn-outline"
          >
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