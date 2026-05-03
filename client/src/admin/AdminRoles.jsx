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
        return { dot: 'bg-semantic-success', text: 'text-semantic-success', bg: 'bg-semantic-success/10' };
      case 'Pending':
        return { dot: 'bg-semantic-warning', text: 'text-semantic-warning', bg: 'bg-semantic-warning/10' };
      case 'Suspended':
        return { dot: 'bg-semantic-error', text: 'text-semantic-error', bg: 'bg-semantic-error/10' };
      default:
        return { dot: 'bg-secondary', text: 'text-secondary', bg: 'bg-surface-elevated' };
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-gradient-to-r from-brand/20 to-brand/10 text-brand border border-brand/30';
      case 'Editor':
        return 'bg-semantic-success/10 text-semantic-success border border-semantic-success/30';
      case 'Viewer':
        return 'bg-surface-elevated text-secondary border border-border-primary';
      case 'Moderator':
        return 'bg-chip-violet-bg text-chip-violet-fg border border-border-muted';
      case 'Contributor':
        return 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/30';
      default:
        return 'bg-surface-elevated text-secondary border border-border-primary';
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
    { key: 'users', label: 'User Management', icon: Users, colorVar: '--brand' },
    { key: 'content', label: 'Content', icon: FileText, colorVar: '--semantic-success' },
    { key: 'analytics', label: 'Analytics', icon: BarChart, colorVar: '--semantic-warning' },
    { key: 'settings', label: 'Settings', icon: Settings, colorVar: '--accent-purple' },
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
        className="fixed inset-0 bg-overlay-scrim z-40 lg:hidden"
        onClick={onClose}
      />
      
      <aside className="fixed right-0 top-0 h-full w-full sm:w-125 bg-surface-card border-l border-border-primary flex flex-col shadow-2xl z-50 transition-transform duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border-primary">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-brand to-accent-purple flex items-center justify-center text-on-brand font-bold text-sm sm:text-lg">
                {user.initials}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">{user.name}</h3>
                <p className="text-[10px] sm:text-xs text-secondary truncate max-w-45 sm:max-w-none">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-secondary hover:text-foreground transition-colors p-1 hover:bg-surface-elevated rounded"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {/* Role & Status Quick Edit */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-surface-elevated border border-border-primary rounded-lg p-2 sm:p-2.5">
              <p className="text-[9px] sm:text-[10px] text-secondary mb-0.5 sm:mb-1">Role</p>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className="w-full bg-transparent text-foreground text-xs sm:text-sm outline-none"
              >
                {roleOptions.map(role => <option key={role}>{role}</option>)}
              </select>
            </div>
            <div className="bg-surface-elevated border border-border-primary rounded-lg p-2 sm:p-2.5">
              <p className="text-[9px] sm:text-[10px] text-secondary mb-0.5 sm:mb-1">Status</p>
              <select
                value={user.status}
                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                className="w-full bg-transparent text-foreground text-xs sm:text-sm outline-none"
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
              <h4 className="text-foreground font-semibold text-sm sm:text-base">Granular Access Permissions</h4>
              <p className="text-[9px] sm:text-[10px] text-secondary mt-0.5">Customize access for each module</p>
            </div>
            <button 
              onClick={() => handleRoleChange(user.id, user.role)}
              className="text-[10px] sm:text-xs text-brand hover:text-brand-soft text-left sm:text-right"
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
                <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 border-b border-border-primary">
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: `color-mix(in srgb, var(${category.colorVar}) 14%, transparent)` }}
                  >
                    <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: `var(${category.colorVar})` }} />
                  </div>
                  <h5 className="text-xs sm:text-sm font-medium text-foreground">{category.label}</h5>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {permissions.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
                    >
                      <span className="text-[11px] sm:text-sm capitalize text-primary">{perm}</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={userAccess?.[perm] || false}
                          onChange={() => handleAccessToggle(user.id, category.key, perm)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 sm:w-9 sm:h-5 bg-border-muted rounded-full peer peer-checked:bg-brand transition-all duration-200 cursor-pointer">
                          <div className={`absolute w-3 h-3 sm:w-4 sm:h-4 bg-surface rounded-full transition-all duration-200 top-0.5 left-0.5 peer-checked:translate-x-3 sm:peer-checked:translate-x-4`}></div>
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
        <div className="p-4 sm:p-5 border-t border-border-primary flex gap-2">
          <button 
            onClick={() => handleDeleteUser(user.id)}
            className="btn-outline flex-1"
          >
            Delete
          </button>
          <button 
            onClick={onClose}
            className="flex-1 btn-primary"
          >
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Save Changes
          </button>
        </div>
      </aside>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen text-primary overflow-hidden">
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-border-primary">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                User Access Management
              </h1>
              <p className="text-xs sm:text-sm text-secondary mt-1">Manage user roles and granular access permissions</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button className="btn-outline max-sm:w-full">
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="btn-primary max-sm:w-full"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-border-primary overflow-x-auto">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 min-w-100 sm:min-w-0">
            <div className="bg-surface-card border border-border-primary rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-secondary">Total Users</p>
              <p className="text-base sm:text-xl font-bold text-foreground">{users.length}</p>
            </div>
            <div className="bg-surface-card border border-border-primary rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-secondary">Admins</p>
              <p className="text-base sm:text-xl font-bold text-brand">{users.filter(u => u.role === 'Administrator').length}</p>
            </div>
            <div className="bg-surface-card border border-border-primary rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-secondary">Editors</p>
              <p className="text-base sm:text-xl font-bold text-semantic-success">{users.filter(u => u.role === 'Editor').length}</p>
            </div>
            <div className="bg-surface-card border border-border-primary rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-secondary">Active</p>
              <p className="text-base sm:text-xl font-bold text-semantic-success">{users.filter(u => u.status === 'Active').length}</p>
            </div>
            <div className="bg-surface-card border border-border-primary rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-xs text-secondary">Pending</p>
              <p className="text-base sm:text-xl font-bold text-semantic-warning">{users.filter(u => u.status === 'Pending').length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-5 md:px-6 py-3 border-b border-border-primary">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                className="input-secondary pl-9!"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0">
              <div className="h-6 sm:h-8 w-px bg-border-primary hidden sm:block"></div>
              <select
                className="bg-surface-card border border-border-primary text-foreground text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg min-w-30 sm:min-w-40 outline-none focus:border-brand cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All Roles</option>
                {roleOptions.map(role => <option key={role}>{role}</option>)}
              </select>
              <select
                className="bg-surface-card border border-border-primary text-foreground text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg min-w-30 sm:min-w-40 outline-none focus:border-brand cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Statuses</option>
                {statusOptions.map(status => <option key={status}>{status}</option>)}
              </select>
              <button className="p-2 sm:p-2.5 bg-surface-card border border-border-primary rounded-lg text-secondary hover:text-foreground transition-colors">
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Table - Horizontal scroll on mobile */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-175 lg:min-w-full">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-header/95 backdrop-blur-sm border-b border-border-primary z-10">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider">User</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider hidden md:table-cell">Access</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-surface-elevated transition-colors cursor-pointer group ${
                      selectedUser?.id === user.id ? 'bg-linear-to-r from-brand/5 to-transparent' : ''
                    }`}
                    onClick={() => {
                      setSelectedUser(user);
                    }}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-border-primary object-cover" />
                        ) : (
                          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-brand to-accent-purple flex items-center justify-center text-on-brand text-[10px] sm:text-sm font-semibold">
                            {user.initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-25 sm:max-w-37.5 md:max-w-none">{user.name}</p>
                          <p className="text-[9px] sm:text-xs text-secondary truncate max-w-25 sm:max-w-45">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      {editingUser === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          onBlur={() => setEditingUser(null)}
                          className="bg-surface-elevated border border-border-primary text-foreground text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg outline-none focus:border-brand"
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
                            className="opacity-0 group-hover:opacity-100 text-secondary hover:text-foreground transition-all"
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
                        <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand" />
                        <span className="text-[10px] sm:text-xs text-secondary whitespace-nowrap">
                          {Object.values(user.access).flatMap(cat => Object.values(cat)).filter(v => v).length} perms
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-secondary whitespace-nowrap">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {user.lastActive}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                          className="p-1 sm:p-1.5 hover:bg-surface-elevated rounded transition-colors text-secondary hover:text-foreground"
                          title="Edit Access"
                        >
                          <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                          className="p-1 sm:p-1.5 hover:bg-surface-elevated rounded transition-colors text-secondary hover:text-semantic-error"
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
        <div className="px-4 sm:px-5 md:px-6 py-3 border-t border-border-primary flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] sm:text-xs text-secondary">
          <p className="text-center sm:text-left">Showing <span className="text-foreground">1-{filteredUsers.length}</span> of <span className="text-foreground">{users.length}</span> users</p>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-surface-card border border-border-primary rounded-lg hover:text-foreground disabled:opacity-50 transition-colors text-xs sm:text-sm" disabled>
              Prev
            </button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-brand text-white border border-brand rounded-lg text-xs sm:text-sm">1</button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-surface-card border border-border-primary rounded-lg hover:text-foreground text-xs sm:text-sm">2</button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-surface-card border border-border-primary rounded-lg hover:text-foreground text-xs sm:text-sm">3</button>
            <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-surface-card border border-border-primary rounded-lg hover:text-foreground text-xs sm:text-sm">Next</button>
          </div>
        </div>
      </main>

      {/* Access Permission Drawer */}
      {selectedUser && (
        <AccessDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Add User Modal - Responsive */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-overlay-scrim backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-surface-card border border-border-primary rounded-xl w-full max-w-md p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand/10 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Add New User</h3>
              </div>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-secondary hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-secondary mb-1 sm:mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="input-secondary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-secondary mb-1 sm:mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="input-secondary"
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-secondary mb-1 sm:mb-1.5">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="select min-w-0"
                  >
                    {roleOptions.map(role => <option key={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-secondary mb-1 sm:mb-1.5">Status</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    className="select min-w-0"
                  >
                    {statusOptions.map(status => <option key={status}>{status}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 mt-5 sm:mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="btn-outline flex-1 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="btn-primary flex-1 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-brand to-brand-soft"
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