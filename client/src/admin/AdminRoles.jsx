import React, { useState } from 'react';
import {
  Filter,
  MoreVertical,
  X,
  Search,
  Download,
  UserPlus,
  Mail,
  Calendar,
  Clock,
  Shield,
  Trash2,
  Edit,
  UserCheck,
  ChevronDown,
  Check,
  AlertCircle,
  Save,
  RefreshCw,
  Eye,
  Lock,
  Users,
  Settings,
  FileText,
  BarChart,
  Menu
} from 'lucide-react';

const AdminRoles = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [editingUser, setEditingUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    status: 'Pending'
  });

  // Users with their roles and access levels
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Julianne Davis',
      email: 'julianne.d@enterprise.io',
      bio: 'Product Manager focused on design systems and scalable UX.',
      role: 'Administrator',
      status: 'Active',
      lastActive: '2023-10-24 14:22',
      joined: 'Sep 12, 2021',
      access: {
        users: { view: true, create: true, edit: true, delete: true },
        content: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, export: true },
        settings: { view: true, edit: true }
      },
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
    },
    {
      id: 2,
      name: 'Marcus King',
      email: 'm.king@corp-net.com',
      bio: 'Content editor managing publishing workflows.',
      role: 'Editor',
      status: 'Pending',
      lastActive: '2023-10-22 09:15',
      joined: 'Oct 01, 2023',
      access: {
        users: { view: false, create: false, edit: false, delete: false },
        content: { view: true, create: true, edit: true, delete: false },
        analytics: { view: true, export: false },
        settings: { view: false, edit: false }
      },
      avatar: null,
      initials: 'MK',
    },
    {
      id: 3,
      name: 'Sarah Loft',
      email: 'sarah@loft-design.uk',
      bio: 'Freelance designer and viewer access user.',
      role: 'Viewer',
      status: 'Suspended',
      lastActive: '2023-08-15 11:30',
      joined: 'Jan 20, 2022',
      access: {
        users: { view: false, create: false, edit: false, delete: false },
        content: { view: true, create: false, edit: false, delete: false },
        analytics: { view: false, export: false },
        settings: { view: false, edit: false }
      },
      avatar: null,
      initials: 'SL',
    },
    {
      id: 4,
      name: 'David Chen',
      email: 'd.chen@tech-solutions.com',
      bio: 'System administrator and security expert.',
      role: 'Administrator',
      status: 'Active',
      lastActive: '2023-10-24 16:45',
      joined: 'Mar 15, 2021',
      access: {
        users: { view: true, create: true, edit: true, delete: true },
        content: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, export: true },
        settings: { view: true, edit: true }
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
    },
    {
      id: 5,
      name: 'Emma Watson',
      email: 'emma@content-studio.com',
      bio: 'Senior content creator and strategist.',
      role: 'Editor',
      status: 'Active',
      lastActive: '2023-10-23 11:20',
      joined: 'Jun 10, 2023',
      access: {
        users: { view: false, create: false, edit: false, delete: false },
        content: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, export: true },
        settings: { view: false, edit: false }
      },
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
    },
  ]);

  const roleOptions = ['Administrator', 'Editor', 'Viewer', 'Moderator', 'Contributor'];
  const statusOptions = ['Active', 'Pending', 'Suspended'];

  // Role-based access presets
  const roleAccessPresets = {
    Administrator: {
      users: { view: true, create: true, edit: true, delete: true },
      content: { view: true, create: true, edit: true, delete: true },
      analytics: { view: true, export: true },
      settings: { view: true, edit: true }
    },
    Editor: {
      users: { view: false, create: false, edit: false, delete: false },
      content: { view: true, create: true, edit: true, delete: true },
      analytics: { view: true, export: true },
      settings: { view: false, edit: false }
    },
    Viewer: {
      users: { view: false, create: false, edit: false, delete: false },
      content: { view: true, create: false, edit: false, delete: false },
      analytics: { view: false, export: false },
      settings: { view: false, edit: false }
    },
    Moderator: {
      users: { view: true, create: false, edit: false, delete: false },
      content: { view: true, create: false, edit: true, delete: true },
      analytics: { view: true, export: false },
      settings: { view: false, edit: false }
    },
    Contributor: {
      users: { view: false, create: false, edit: false, delete: false },
      content: { view: true, create: true, edit: true, delete: false },
      analytics: { view: false, export: false },
      settings: { view: false, edit: false }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { dot: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'Pending':
        return { dot: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'Suspended':
        return { dot: 'bg-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/10' };
      default:
        return { dot: 'bg-gray-500', text: 'text-gray-500', bg: 'bg-gray-500/10' };
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-gradient-to-r from-[#4F8CFF]/20 to-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/30';
      case 'Editor':
        return 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'Viewer':
        return 'bg-gradient-to-r from-zinc-500/20 to-zinc-500/10 text-zinc-400 border border-zinc-500/30';
      case 'Moderator':
        return 'bg-gradient-to-r from-purple-500/20 to-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'Contributor':
        return 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
    }
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            role: newRole,
            access: roleAccessPresets[newRole]
          }
        : user
    ));
    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        role: newRole,
        access: roleAccessPresets[newRole]
      });
    }
  };

  const handleAccessToggle = (userId, category, permission) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const updatedAccess = {
          ...user.access,
          [category]: {
            ...user.access[category],
            [permission]: !user.access[category][permission]
          }
        };
        
        if (selectedUser?.id === userId) {
          setSelectedUser({
            ...selectedUser,
            access: updatedAccess
          });
        }
        
        return { ...user, access: updatedAccess };
      }
      return user;
    }));
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      setSelectedUser(null);
      setMobileDrawerOpen(false);
    }
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const newId = Math.max(...users.map(u => u.id)) + 1;
      const addedUser = {
        id: newId,
        ...newUser,
        bio: 'New team member',
        lastActive: 'Just now',
        joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        access: roleAccessPresets[newUser.role],
        avatar: null,
        initials: newUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };
      setUsers([...users, addedUser]);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'Viewer', status: 'Pending' });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All Statuses' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const accessCategories = [
    { key: 'users', label: 'User Management', icon: Users, color: '#4F8CFF' },
    { key: 'content', label: 'Content', icon: FileText, color: '#10B981' },
    { key: 'analytics', label: 'Analytics', icon: BarChart, color: '#F59E0B' },
    { key: 'settings', label: 'Settings', icon: Settings, color: '#8B5CF6' }
  ];

  const accessPermissions = {
    users: ['view', 'create', 'edit', 'delete'],
    content: ['view', 'create', 'edit', 'delete'],
    analytics: ['view', 'export'],
    settings: ['view', 'edit']
  };

  // Drawer component that can be used both on desktop and mobile
  const AccessDrawer = ({ user, onClose }) => (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/80 z-40 lg:hidden"
        onClick={onClose}
      />
      
      <aside className={`fixed lg:relative right-0 top-0 h-full w-full sm:w-[500px] bg-gradient-to-b from-zinc-900 to-black border-l border-zinc-800 flex flex-col shadow-2xl z-50 lg:z-auto transition-transform duration-300 ${
        mobileDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#4F8CFF] to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                {user.initials}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">{user.name}</h3>
                <p className="text-[10px] sm:text-xs text-zinc-500 truncate max-w-[180px] sm:max-w-none">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {/* Role & Status Quick Edit */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 sm:p-2.5">
              <p className="text-[9px] sm:text-[10px] text-zinc-500 mb-0.5 sm:mb-1">Role</p>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className="w-full bg-transparent text-white text-xs sm:text-sm outline-none"
              >
                {roleOptions.map(role => <option key={role}>{role}</option>)}
              </select>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 sm:p-2.5">
              <p className="text-[9px] sm:text-[10px] text-zinc-500 mb-0.5 sm:mb-1">Status</p>
              <select
                value={user.status}
                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                className="w-full bg-transparent text-white text-xs sm:text-sm outline-none"
              >
                {statusOptions.map(status => <option key={status}>{status}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Access Permissions */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-base">Granular Access Permissions</h4>
              <p className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5">Customize access for each module</p>
            </div>
            <button 
              onClick={() => handleRoleChange(user.id, user.role)}
              className="text-[10px] sm:text-xs text-[#4F8CFF] hover:text-[#6B9FFF] text-left sm:text-right"
            >
              Reset to role defaults
            </button>
          </div>

          {accessCategories.map((category) => {
            const IconComponent = category.icon;
            const permissions = accessPermissions[category.key];
            const userAccess = user.access[category.key];
            
            return (
              <div key={category.key} className="mb-5 sm:mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 border-b border-zinc-800">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-opacity-10 flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                    <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: category.color }} />
                  </div>
                  <h5 className="text-xs sm:text-sm font-medium text-white">{category.label}</h5>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {permissions.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    >
                      <span className="text-[11px] sm:text-sm capitalize text-zinc-300">{perm}</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={userAccess?.[perm] || false}
                          onChange={() => handleAccessToggle(user.id, category.key, perm)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 sm:w-9 sm:h-5 bg-zinc-700 rounded-full peer peer-checked:bg-[#4F8CFF] transition-all duration-200 cursor-pointer">
                          <div className={`absolute w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full transition-all duration-200 top-0.5 left-0.5 peer-checked:translate-x-3 sm:peer-checked:translate-x-4`}></div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 flex gap-2">
          <button 
            onClick={() => handleDeleteUser(user.id)}
            className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            Delete
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-[#4F8CFF] to-[#6B9FFF] text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Save Changes
          </button>
        </div>
      </aside>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen text-[#e2e2e3] overflow-hidden">
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-zinc-800/50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                User Access Management
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">Manage user roles and granular access permissions</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs sm:text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all flex items-center gap-1.5 sm:gap-2">
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Export</span>
              </button>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#4F8CFF] to-[#6B9FFF] rounded-lg text-xs sm:text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#4F8CFF]/25 transition-all flex items-center gap-1.5 sm:gap-2"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-zinc-800/50 overflow-x-auto">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 min-w-[400px] sm:min-w-0">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-zinc-500">Total Users</p>
              <p className="text-base sm:text-xl font-bold text-white">{users.length}</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-zinc-500">Admins</p>
              <p className="text-base sm:text-xl font-bold text-[#4F8CFF]">{users.filter(u => u.role === 'Administrator').length}</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-zinc-500">Editors</p>
              <p className="text-base sm:text-xl font-bold text-emerald-400">{users.filter(u => u.role === 'Editor').length}</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-zinc-500">Active</p>
              <p className="text-base sm:text-xl font-bold text-emerald-500">{users.filter(u => u.status === 'Active').length}</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-zinc-500">Pending</p>
              <p className="text-base sm:text-xl font-bold text-amber-500">{users.filter(u => u.status === 'Pending').length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-5 md:px-6 py-3 border-b border-zinc-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                className="bg-zinc-900/50 border border-zinc-800 text-white text-xs sm:text-sm pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 w-full rounded-lg outline-none focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF] transition-all"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0">
              <div className="h-6 sm:h-8 w-px bg-zinc-800 hidden sm:block"></div>
              <select
                className="bg-zinc-900/50 border border-zinc-800 text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg min-w-[120px] sm:min-w-[160px] outline-none focus:border-[#4F8CFF] cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All Roles</option>
                {roleOptions.map(role => <option key={role}>{role}</option>)}
              </select>
              <select
                className="bg-zinc-900/50 border border-zinc-800 text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg min-w-[120px] sm:min-w-[160px] outline-none focus:border-[#4F8CFF] cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Statuses</option>
                {statusOptions.map(status => <option key={status}>{status}</option>)}
              </select>
              <button className="p-2 sm:p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Table - Horizontal scroll on mobile */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[700px] lg:min-w-full">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 z-10">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Access</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-zinc-900/50 transition-colors cursor-pointer group ${
                      selectedUser?.id === user.id ? 'bg-gradient-to-r from-[#4F8CFF]/5 to-transparent' : ''
                    }`}
                    onClick={() => {
                      setSelectedUser(user);
                      setMobileDrawerOpen(true);
                    }}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-zinc-700 object-cover" />
                        ) : (
                          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#4F8CFF] to-purple-600 flex items-center justify-center text-white text-[10px] sm:text-sm font-semibold">
                            {user.initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{user.name}</p>
                          <p className="text-[9px] sm:text-xs text-zinc-500 truncate max-w-[100px] sm:max-w-[180px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      {editingUser === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          onBlur={() => setEditingUser(null)}
                          className="bg-zinc-800 border border-zinc-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg outline-none focus:border-[#4F8CFF]"
                          autoFocus
                        >
                          {roleOptions.map(role => <option key={role}>{role}</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <span className={`text-[9px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg whitespace-nowrap ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingUser(user.id); }}
                            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-all"
                          >
                            <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getStatusColor(user.status).dot}`}></div>
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className={`text-[9px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border outline-none cursor-pointer transition-all ${getStatusColor(user.status).bg} ${getStatusColor(user.status).text} border-transparent hover:border-current`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {statusOptions.map(status => <option key={status}>{status}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4F8CFF]" />
                        <span className="text-[10px] sm:text-xs text-zinc-400 whitespace-nowrap">
                          {Object.values(user.access).flatMap(cat => Object.values(cat)).filter(v => v).length} perms
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-zinc-500 whitespace-nowrap">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {user.lastActive}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setMobileDrawerOpen(true); }}
                          className="p-1 sm:p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white"
                          title="Edit Access"
                        >
                          <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                          className="p-1 sm:p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-rose-400"
                          title="Delete User"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-5 md:px-6 py-3 border-t border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] sm:text-xs text-zinc-500">
          <p className="text-center sm:text-left">Showing <span className="text-white">1-{filteredUsers.length}</span> of <span className="text-white">{users.length}</span> users</p>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white disabled:opacity-50 transition-colors text-xs sm:text-sm" disabled>
              Prev
            </button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-[#4F8CFF] text-white border border-[#4F8CFF] rounded-lg text-xs sm:text-sm">1</button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white text-xs sm:text-sm">2</button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white text-xs sm:text-sm">3</button>
            <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white text-xs sm:text-sm">Next</button>
          </div>
        </div>
      </main>

      {/* Access Permission Drawer - Desktop always shows, mobile toggles */}
      {selectedUser && (
        <div className={`hidden lg:block ${selectedUser ? 'lg:block' : 'lg:hidden'}`}>
          <AccessDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}

      {/* Mobile Drawer */}
      {selectedUser && mobileDrawerOpen && (
        <AccessDrawer user={selectedUser} onClose={() => setMobileDrawerOpen(false)} />
      )}

      {/* Add User Modal - Responsive */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-xl w-full max-w-md p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#4F8CFF]/10 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4F8CFF]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">Add New User</h3>
              </div>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-zinc-400 mb-1 sm:mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs sm:text-sm outline-none focus:border-[#4F8CFF] transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-zinc-400 mb-1 sm:mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs sm:text-sm outline-none focus:border-[#4F8CFF] transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-zinc-400 mb-1 sm:mb-1.5">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 sm:px-3 py-2 text-white text-xs sm:text-sm outline-none focus:border-[#4F8CFF]"
                  >
                    {roleOptions.map(role => <option key={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-zinc-400 mb-1 sm:mb-1.5">Status</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 sm:px-3 py-2 text-white text-xs sm:text-sm outline-none focus:border-[#4F8CFF]"
                  >
                    {statusOptions.map(status => <option key={status}>{status}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 mt-5 sm:mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs sm:text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#4F8CFF] to-[#6B9FFF] rounded-lg text-xs sm:text-sm font-semibold text-white hover:shadow-lg transition-all"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;