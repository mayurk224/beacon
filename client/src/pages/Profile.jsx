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
    <div className=" text-primary min-h-screen w-full flex justify-center p-6">
      <div className="w-full max-w-140 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold">Profile</h1>
            <p className="text-[13px] text-subtle">
              Manage your account details
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-outline"
          >
            <Pencil className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Card */}
        <div className="bg-surface-header border border-border-primary rounded-lg p-6 flex flex-col gap-6">

          {/* Profile Image */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={profilePic}
                alt="profile"
                className="w-24 h-24 rounded-full object-cover border border-border-muted"
              />

              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-brand-soft text-on-brand p-2 rounded-full cursor-pointer">
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
            <label className="text-[11px] uppercase text-tertiary">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
              <input
                value={name}
                disabled={!isEditing}
                onChange={(e) => setName(e.target.value)}
                className="input pl-9!"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase text-tertiary">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
              <input
                value={email}
                disabled={!isEditing}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9!"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase text-tertiary">
              Bio
            </label>
            <textarea
              value={bio}
              disabled={!isEditing}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="input"
            />
          </div>

          {/* Save Button */}
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

          {/* Divider */}
          <div className="h-px bg-border-primary" />

          {/* Actions */}
          <div className="flex flex-col gap-3">

            <button
              onClick={handleLogout}
              className="btn-outline"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            <button
              onClick={handleDelete}
              className="btn-destructive"
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