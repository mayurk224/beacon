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
        return { dot: 'bg-emerald-500', text: 'text-emerald-500' };
      case 'Pending':
        return { dot: 'bg-amber-500', text: 'text-amber-500' };
      case 'Suspended':
        return { dot: 'bg-rose-500', text: 'text-rose-500' };
      default:
        return { dot: 'bg-gray-500', text: 'text-gray-500' };
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-brand/10 text-brand border border-brand/30';
      case 'Editor':
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
      case 'Viewer':
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
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
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">User Management</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">Manage platform users, roles, and administrative permissions.</p>
          </div>
          <div className="flex gap-2">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand text-white text-sm rounded-lg hover:bg-brand transition-colors">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
            <button className="flex sm:hidden items-center justify-center w-9 h-9 bg-brand text-white rounded-lg hover:bg-brand transition-colors">
              <UserPlus className="w-4 h-4" />
            </button>
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Bar - Responsive */}
        <div className="p-3 sm:p-4 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search - Full width on mobile */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                className="bg-surface border border-border-primary text-white text-sm pl-9 pr-4 py-2 w-full rounded-lg outline-none focus:border-brand transition-colors"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters - Scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              <select
                className="bg-surface border border-border-primary text-white text-sm px-2 sm:px-3 py-2 rounded-lg min-w-[120px] sm:min-w-[140px] outline-none focus:border-brand transition-colors"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All Roles</option>
                <option>Administrator</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
              <select
                className="bg-surface border border-border-primary text-white text-sm px-2 sm:px-3 py-2 rounded-lg min-w-[120px] sm:min-w-[140px] outline-none focus:border-brand transition-colors"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>Suspended</option>
                <option>Pending</option>
              </select>
              <button className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700 transition-colors">
                <Filter className="w-3.5 h-3.5" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table - Horizontal scroll on small screens */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[640px] lg:min-w-full">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-header border-b border-zinc-800 z-10">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Last Active</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/50">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-surface-elevated transition-colors cursor-pointer group border-l-2 ${
                      selectedUser?.id === user.id ? 'bg-zinc-900/30 border-l-brand' : 'border-l-transparent'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-zinc-700 object-cover" />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-900 flex items-center justify-center border border-indigo-700 text-[10px] sm:text-xs text-white font-medium">
                            {user.initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-none">{user.name}</p>
                          <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate max-w-[120px] sm:max-w-[180px]">{user.email}</p>
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
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-zinc-400">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-500" />
                        <span className="whitespace-nowrap">{user.lastActive}</span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-zinc-400">
                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-500" />
                        <span className="whitespace-nowrap">{user.joined}</span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                        <button className="p-1 sm:p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white" onClick={(e) => e.stopPropagation()}>
                          <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button className="p-1 sm:p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-rose-400" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button className="p-1 sm:p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white sm:hidden" onClick={(e) => e.stopPropagation()}>
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
        <div className="px-3 sm:px-6 py-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500">
          <p className="text-center sm:text-left">Showing <span className="text-white">1-3</span> of <span className="text-white">422</span> users</p>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <button className="px-2 sm:px-3 py-1 bg-zinc-900 border border-zinc-800 rounded hover:text-white disabled:opacity-50 transition-colors text-xs sm:text-sm" disabled>
              <span className="hidden sm:inline">Previous</span>
              <ChevronLeft className="w-3.5 h-3.5 sm:hidden" />
            </button>
            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-zinc-800 text-white border border-zinc-700 rounded text-xs sm:text-sm">1</button>
            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded hover:text-white transition-colors text-xs sm:text-sm">2</button>
            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded hover:text-white transition-colors text-xs sm:text-sm">3</button>
            <button className="px-2 sm:px-3 py-1 bg-zinc-900 border border-zinc-800 rounded hover:text-white transition-colors text-xs sm:text-sm">
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
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSelectedUser(null)}
          />
          
          <aside className="fixed md:relative right-0 top-0 h-full w-full sm:w-[400px] md:w-[340px] bg-surface-elevated border-l border-border-primary flex flex-col shadow-2xl z-50 md:z-auto animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-border-primary flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-semibold text-white">User Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-zinc-500 hover:text-white transition-colors"
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
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-900 flex items-center justify-center border-2 border-brand text-base sm:text-xl text-white font-medium">
                      {selectedUser.initials}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-surface-elevated rounded-full"></div>
                </div>
                <div className="text-center">
                  <h4 className="text-white text-base sm:text-lg font-semibold">{selectedUser.name}</h4>
                  <p className="text-xs sm:text-sm text-zinc-400">{selectedUser.role}</p>
                </div>
              </div>

              {/* Info Cards - Responsive grid */}
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                  <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                    <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Email
                  </p>
                  <p className="text-xs sm:text-sm text-white break-all">{selectedUser.email}</p>
                </div>

                <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                  <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">
                    Bio
                  </p>
                  <p className="text-xs sm:text-sm text-white">
                    {selectedUser.bio || 'No bio provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Joined
                    </p>
                    <p className="text-[11px] sm:text-xs text-white">{selectedUser.joined}</p>
                  </div>
                  <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Last Active
                    </p>
                    <p className="text-[11px] sm:text-xs text-white">{selectedUser.lastActive}</p>
                  </div>
                </div>

                <div className="bg-surface border border-border-primary p-2.5 sm:p-3 rounded">
                  <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
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
              <button className="w-full bg-brand text-white py-2 rounded text-sm font-semibold hover:bg-brand transition-colors">
                Edit User
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="w-full bg-transparent border border-rose-500/30 text-rose-500 py-2 rounded text-sm font-semibold hover:bg-rose-500/10 transition-colors"
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