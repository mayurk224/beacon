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
    <div className="text-[#e2e2e3] min-h-screen w-full p-6 md:p-10">
      <div className="max-w-xl mx-auto bg-[#141414] border border-[#262626] rounded-xl p-6 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-[#8c909f] mt-1">
            Manage your account
          </p>
        </div>

        {/* Profile */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#c2c6d6]">Profile</h3>

          <div>
            <label className="text-xs text-[#8c909f]">Name</label>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-4 h-4 text-[#8c909f]" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8c909f]">Email</label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-[#8c909f]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#4F8CFF] text-white rounded-lg text-sm font-semibold"
          >
            Save Changes
          </button>
        </div>

        {/* Password */}
        <div className="space-y-4 border-t border-[#262626] pt-6">
          <h3 className="text-sm font-medium text-[#c2c6d6]">Password</h3>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2 text-sm"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8c909f]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            onClick={handleChangePassword}
            className="px-4 py-2 border border-[#262626] rounded-lg text-sm"
          >
            Change Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4 border-t border-[#262626] pt-6">


          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-[#262626] rounded-lg text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>

          <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"
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