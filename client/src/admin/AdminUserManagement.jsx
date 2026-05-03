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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminUserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const users = [
    {
      id: 1,
      name: 'Julianne Davis',
      email: 'julianne.d@enterprise.io',
      bio: 'Product Manager focused on design systems and scalable UX.',
      role: 'Administrator',
      status: 'Active',
      lastActive: '2023-10-24 14:22',
      joined: 'Sep 12, 2021',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkYQX7CJzJewj_E6x2FTaEolgT70edejeqb1coHh4k7sMDZ1KkpYOQ10nielFTil7pm_vEM4ecqNqz2tspPsyCv2VmZ1GoaNw9p6jNMGDPEJaC7R8rVjmNgh4LTw2f0Y7mKLTIcfuM9GSLS_vSl5Ritrdf3k6pFR-uA6R7nguWoglUYIlxNrd8q5CKbkNejjDpmeRrHvU4mEXDi7yZa2ULxKiBADx2GqoGDkFGQawFZM1M-rbv7wfqYCj8pLfin8uyjMlxmb6z0-ax',
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
      avatar: null,
      initials: 'SL',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { dot: 'bg-semantic-success', text: 'text-semantic-success' };
      case 'Pending':
        return { dot: 'bg-semantic-warning', text: 'text-semantic-warning' };
      case 'Suspended':
        return { dot: 'bg-semantic-error', text: 'text-semantic-error' };
      default:
        return { dot: 'bg-secondary', text: 'text-secondary' };
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-brand-muted text-brand-strong border border-brand-muted';
      case 'Editor':
        return 'bg-chip-sky-bg text-chip-sky-fg border border-border-muted';
      case 'Viewer':
        return 'bg-chip-violet-bg text-chip-violet-fg border border-border-muted';
      default:
        return 'bg-surface-elevated text-secondary border border-border-muted';
    }
  };

  const handleDeleteUser = (id) => {
    alert(`User with ID ${id} deleted (mock)`);
    setSelectedUser(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden text-primary">
      
      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border-primary flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">User Management</h1>
            <p className="text-xs sm:text-sm text-secondary mt-1">Manage platform users, roles, and administrative permissions.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary max-sm:w-full">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
            <button className="btn-outline max-sm:w-full">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Bar - Responsive */}
        <div className="p-3 sm:p-4 border-b border-border-primary">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search - Full width on mobile */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
              <input
                className="input-secondary pl-9!"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters - Scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              <select
                className="bg-surface border border-border-primary text-foreground text-sm px-2 sm:px-3 py-2 rounded-lg min-w-30 sm:min-w-35 outline-none focus:border-brand transition-colors"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All Roles</option>
                <option>Administrator</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
              <select
                className="bg-surface border border-border-primary text-foreground text-sm px-2 sm:px-3 py-2 rounded-lg min-w-30 sm:min-w-35 outline-none focus:border-brand transition-colors"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>Suspended</option>
                <option>Pending</option>
              </select>
              <button className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border-primary text-secondary text-sm rounded-lg hover:bg-surface-elevated transition-colors">
                <Filter className="w-3.5 h-3.5" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table - Horizontal scroll on small screens */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-160 lg:min-w-full">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-header border-b border-border-primary z-10">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-secondary uppercase tracking-wider">User</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-secondary uppercase tracking-wider hidden sm:table-cell">Role</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-secondary uppercase tracking-wider hidden md:table-cell">Last Active</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-secondary uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-muted">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-surface-elevated transition-colors cursor-pointer group border-l-2 ${
                      selectedUser?.id === user.id ? 'bg-brand-muted border-l-brand' : 'border-l-transparent'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border-primary object-cover" />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-chip-sky-bg flex items-center justify-center border border-border-muted text-[10px] sm:text-xs text-chip-sky-fg font-medium">
                            {user.initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-30 sm:max-w-none">{user.name}</p>
                          <p className="text-[10px] sm:text-[11px] text-secondary truncate max-w-30 sm:max-w-45">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getStatusColor(user.status).dot}`}></div>
                        <span className={`text-[10px] sm:text-xs font-medium ${getStatusColor(user.status).text}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-secondary">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" />
                        <span className="whitespace-nowrap">{user.lastActive}</span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-secondary">
                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" />
                        <span className="whitespace-nowrap">{user.joined}</span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                        <button className="p-1 sm:p-1.5 hover:bg-surface-elevated rounded transition-colors text-secondary hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                          <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button className="p-1 sm:p-1.5 hover:bg-danger-bg-subtle rounded transition-colors text-secondary hover:text-semantic-error" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button className="p-1 sm:p-1.5 hover:bg-surface-elevated rounded transition-colors text-secondary hover:text-foreground sm:hidden" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - Responsive */}
        <div className="px-3 sm:px-6 py-3 border-t border-border-primary flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-secondary">
          <p className="text-center sm:text-left">Showing <span className="text-foreground">1-3</span> of <span className="text-foreground">422</span> users</p>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <button className="px-2 sm:px-3 py-1 bg-surface-card border border-border-primary rounded hover:text-foreground disabled:opacity-50 transition-colors text-xs sm:text-sm" disabled>
              <span className="hidden sm:inline">Previous</span>
              <ChevronLeft className="w-3.5 h-3.5 sm:hidden" />
            </button>
            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-surface-elevated text-foreground border border-border-primary rounded text-xs sm:text-sm">1</button>
            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-surface-card border border-border-primary rounded hover:text-foreground transition-colors text-xs sm:text-sm">2</button>
            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-surface-card border border-border-primary rounded hover:text-foreground transition-colors text-xs sm:text-sm">3</button>
            <button className="px-2 sm:px-3 py-1 bg-surface-card border border-border-primary rounded hover:text-foreground transition-colors text-xs sm:text-sm">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5 sm:hidden" />
            </button>
          </div>
        </div>
      </main>

      {/* Drawer - Full responsive with overlay on mobile */}
      {selectedUser && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-overlay-scrim z-40 md:hidden"
            onClick={() => setSelectedUser(null)}
          />
          
          <aside className="fixed md:relative right-0 top-0 h-full w-full sm:w-100 md:w-85 bg-surface-elevated border-l border-border-primary flex flex-col shadow-2xl z-50 md:z-auto animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-border-primary flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">User Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-secondary hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {selectedUser.avatar ? (
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-brand object-cover" 
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-chip-sky-bg flex items-center justify-center border-2 border-brand text-base sm:text-xl text-chip-sky-fg font-medium">
                      {selectedUser.initials}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-semantic-success border-2 border-surface-elevated rounded-full"></div>
                </div>
                <div className="text-center">
                  <h4 className="text-foreground text-base sm:text-lg font-semibold">{selectedUser.name}</h4>
                  <p className="text-xs sm:text-sm text-secondary">{selectedUser.role}</p>
                </div>
              </div>

              {/* Info Cards - Responsive grid */}
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                  <p className="text-[9px] sm:text-[10px] text-secondary uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                    <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Email
                  </p>
                  <p className="text-xs sm:text-sm text-foreground break-all">{selectedUser.email}</p>
                </div>

                <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                  <p className="text-[9px] sm:text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">
                    Bio
                  </p>
                  <p className="text-xs sm:text-sm text-foreground">
                    {selectedUser.bio || 'No bio provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                    <p className="text-[9px] sm:text-[10px] text-secondary uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Joined
                    </p>
                    <p className="text-[11px] sm:text-xs text-foreground">{selectedUser.joined}</p>
                  </div>
                  <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                    <p className="text-[9px] sm:text-[10px] text-secondary uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Last Active
                    </p>
                    <p className="text-[11px] sm:text-xs text-foreground">{selectedUser.lastActive}</p>
                  </div>
                </div>

                <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                  <p className="text-[9px] sm:text-[10px] text-secondary uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                    <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getStatusColor(selectedUser.status).dot}`}></div>
                    <span className={`text-xs sm:text-sm font-medium ${getStatusColor(selectedUser.status).text}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - Sticky at bottom */}
            <div className="p-4 sm:p-6 border-t border-border-primary flex flex-col gap-2 bg-surface-elevated">
              <button className="w-full bg-brand text-on-brand py-2 rounded text-sm font-semibold hover:bg-brand-hover transition-colors">
                Edit User
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="w-full bg-transparent border border-semantic-error/30 text-semantic-error py-2 rounded text-sm font-semibold hover:bg-semantic-error/10 transition-colors"
              >
                Delete User
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default AdminUserManagement;