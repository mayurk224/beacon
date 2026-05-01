import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Save,
  LogOut,
  Trash2,
  Loader2,
  Pencil,
  Image as ImageIcon,
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [bio, setBio] = useState('Frontend developer passionate about UI/UX.');
  const [profilePic, setProfilePic] = useState(
    'https://i.pravatar.cc/150?img=12'
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);

    setTimeout(() => {
      alert('Profile updated!');
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/signin');
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      'Are you sure? This action cannot be undone.'
    );

    if (confirmDelete) {
      localStorage.clear();
      navigate('/signin');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  return (
    <div className=" text-[#e2e2e3] min-h-screen w-full flex justify-center p-6">
      <div className="w-full max-w-[560px] flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold">Profile</h1>
            <p className="text-[13px] text-[#8c909f]">
              Manage your account details
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 text-sm px-4 py-2 border border-[#424753] rounded hover:bg-[#1a1c1d]"
          >
            <Pencil className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Card */}
        <div className="bg-[#121415] border border-[#424753] rounded-lg p-6 flex flex-col gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

          {/* Profile Image */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={profilePic}
                alt="profile"
                className="w-24 h-24 rounded-full object-cover border border-[#424753]"
              />

              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-[#afc6ff] text-[#00275f] p-2 rounded-full cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase text-[#c2c6d6]">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
              <input
                value={name}
                disabled={!isEditing}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1a1c1d] border border-[#424753] rounded pl-9 pr-3 py-2 text-[13px] focus:border-[#afc6ff] outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase text-[#c2c6d6]">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
              <input
                value={email}
                disabled={!isEditing}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1c1d] border border-[#424753] rounded pl-9 pr-3 py-2 text-[13px] focus:border-[#afc6ff] outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase text-[#c2c6d6]">
              Bio
            </label>
            <textarea
              value={bio}
              disabled={!isEditing}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-[#1a1c1d] border border-[#424753] rounded p-3 text-[13px] focus:border-[#afc6ff] outline-none resize-none disabled:opacity-60"
            />
          </div>

          {/* Save Button */}
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[#afc6ff] text-[#00275f] py-2.5 rounded font-medium flex items-center justify-center gap-2 hover:bg-[#528dff]"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          )}

          {/* Divider */}
          <div className="h-px bg-[#424753]" />

          {/* Actions */}
          <div className="flex flex-col gap-3">

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full border border-[#424753] py-2.5 rounded text-[13px] hover:bg-[#1a1c1d]"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 w-full bg-red-600 py-2.5 rounded text-[13px] hover:bg-red-700"
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