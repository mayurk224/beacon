import React, { useState } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Settings,
  UserPlus,
  MoreVertical,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  User,
  Shield,
  Eye,
  Edit2,
  CheckCircle,
  Clock,
  Power,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  Key,
  Trash2,
  UserX,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { getOrganizationById } from '../organization/organizationApi';

const DashBoardTeam = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPermissionsMenu, setShowPermissionsMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const primaryMembership = user?.memberships?.[0];
  const primaryOrganizationId = primaryMembership?.organization?._id || primaryMembership?.organization;

  const [teamMembers, setTeamMembers] = useState([]);

  React.useEffect(() => {
    const loadTeam = async () => {
      if (!primaryOrganizationId) return;
      setIsLoading(true);
      try {
        const data = await getOrganizationById(primaryOrganizationId);
        if (data.members) {
          const members = data.members.map(m => {
            const memberUser = m.user || m;
            const role = m.role || 'Member';
            return {
              id: memberUser._id,
              name: memberUser.name,
              role: role.charAt(0).toUpperCase() + role.slice(1),
              email: memberUser.email,
              userId: memberUser._id.slice(-8).toUpperCase(),
              userRole: role === 'owner' ? 'Admin' : (role === 'admin' ? 'Admin' : 'Editor'),
              status: (Date.now() - new Date(memberUser.lastLoginAt || 0).getTime() < 15 * 60 * 1000) ? 'active' : 'offline',
              avatar: null,
              initial: memberUser.name?.split(' ').map(n => n[0]).join('') || 'U',
              lastActive: memberUser.lastLoginAt,
              department: 'Engineering',
            };
          });
          setTeamMembers(members);
        }
      } catch (error) {
        console.error("Error loading team:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTeam();
  }, [primaryOrganizationId]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { color: 'text-semantic-success', bg: 'bg-semantic-success', label: 'Active', shadow: 'shadow-[0_0_8px_color-mix(in_srgb,var(--semantic-success)_50%,transparent)]' };
      case 'offline':
        return { color: 'text-subtle', bg: 'bg-surface-interactive', label: 'Offline', shadow: '' };
      case 'away':
        return { color: 'text-semantic-warning', bg: 'bg-semantic-warning', label: 'Away', shadow: 'shadow-[0_0_8px_color-mix(in_srgb,var(--semantic-warning)_30%,transparent)]' };
      case 'invited':
        return { color: 'text-semantic-warning', bg: 'bg-semantic-warning', label: 'Invited', shadow: 'shadow-[0_0_8px_color-mix(in_srgb,var(--semantic-warning)_30%,transparent)]' };
      default:
        return { color: 'text-subtle', bg: 'bg-surface-interactive', label: 'Unknown', shadow: '' };
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Admin':
        return 'border border-brand-muted bg-brand-muted text-brand-strong';
      case 'Editor':
        return 'border border-border-primary bg-surface-card text-muted';
      case 'Viewer':
        return 'border border-border-primary bg-transparent text-subtle';
      default:
        return 'border border-border-primary bg-transparent text-subtle';
    }
  };

  // Apply filters
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.userRole && member.userRole.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRoleFilter === 'all' || member.userRole.toLowerCase() === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'all' || member.status === selectedStatusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInvite = () => {
    const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);
    // Secure logging: Redacted emails in log
    console.log(`Inviting ${emails.length} team members with role: ${inviteRole}`);
    setShowInviteModal(false);
    setInviteEmails('');
    setInviteRole('editor');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Exporting team members...');
  };

  const handleChangeRole = (memberId, newRole) => {
    console.log(`Changing role for member ${memberId} to ${newRole}`);
    setShowPermissionsMenu(null);
  };

  const handleRemoveMember = (memberId) => {
    console.log(`Removing member ${memberId}`);
    setShowPermissionsMenu(null);
  };

  const getRoleStats = () => {
    const stats = {
      Admin: teamMembers.filter(m => m.userRole === 'Admin').length,
      Editor: teamMembers.filter(m => m.userRole === 'Editor').length,
      Viewer: teamMembers.filter(m => m.userRole === 'Viewer').length,
    };
    return stats;
  };

  const roleStats = getRoleStats();

  const PermissionsMenu = ({ member, onClose }) => (
    <div className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border-primary rounded-lg shadow-2xl z-50 overflow-hidden">
      <div className="p-2 border-b border-border-primary">
        <div className="px-2 py-1">
          <p className="text-[12px] font-medium text-primary">{member.name}</p>
          <p className="text-[10px] text-subtle">Current role: {member.userRole}</p>
        </div>
      </div>
      <div className="p-2">
        <div className="text-[11px] font-medium text-subtle uppercase tracking-wider px-2 py-1">
          Change Role
        </div>
        <button
          onClick={() => handleChangeRole(member.id, 'Admin')}
          className="w-full flex items-center gap-3 px-2 py-2 rounded text-[13px] text-primary hover:bg-surface-interactive transition-colors"
        >
          <Shield className="w-4 h-4 text-brand-soft" />
          <span>Admin</span>
          {member.userRole === 'Admin' && <CheckCircle className="w-3.5 h-3.5 ml-auto text-success-bright" />}
        </button>
        <button
          onClick={() => handleChangeRole(member.id, 'Editor')}
          className="w-full flex items-center gap-3 px-2 py-2 rounded text-[13px] text-primary hover:bg-surface-interactive transition-colors"
        >
          <Edit2 className="w-4 h-4 text-chip-sky-bg" />
          <span>Editor</span>
          {member.userRole === 'Editor' && <CheckCircle className="w-3.5 h-3.5 ml-auto text-success-bright" />}
        </button>
        <button
          onClick={() => handleChangeRole(member.id, 'Viewer')}
          className="w-full flex items-center gap-3 px-2 py-2 rounded text-[13px] text-primary hover:bg-surface-interactive transition-colors"
        >
          <Eye className="w-4 h-4 text-subtle" />
          <span>Viewer</span>
          {member.userRole === 'Viewer' && <CheckCircle className="w-3.5 h-3.5 ml-auto text-success-bright" />}
        </button>
      </div>
      <div className="p-2 border-t border-border-primary">
        <button
          onClick={() => handleRemoveMember(member.id)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded text-[13px] text-semantic-error hover:bg-semantic-error/10 transition-colors"
        >
          <UserX className="w-4 h-4" />
          <span>Remove from team</span>
        </button>
      </div>
    </div>
  );

  const FilterModal = () => (
    <div className="fixed inset-0 bg-overlay-scrim backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-primary rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-primary flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-primary">Filter Team Members</h3>
          <button onClick={() => setShowFilterModal(false)} className="text-subtle hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Role</label>
            <select 
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="mt-1 w-full bg-surface border border-border-primary rounded-lg p-2 text-[13px] text-primary focus:border-brand-soft focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Status</label>
            <select 
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="mt-1 w-full bg-surface border border-border-primary rounded-lg p-2 text-[13px] text-primary focus:border-brand-soft focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
              <option value="invited">Invited</option>
            </select>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border-primary bg-surface-card flex justify-end gap-3">
          <button 
            onClick={() => {
              setSelectedRoleFilter('all');
              setSelectedStatusFilter('all');
              setShowFilterModal(false);
            }} 
            className="btn-outline"
          >
            Reset
          </button>
          <button 
            onClick={() => setShowFilterModal(false)} 
            className="btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="text-primary min-h-screen w-full">
      {/* Main Content */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] leading-7.5 sm:leading-8 tracking-[-0.02em] font-semibold text-primary mb-1">
              Team Management
            </h1>
            <p className="text-[12px] sm:text-[13px] leading-4.5 font-medium text-tertiary">
              Manage workspace members and role permissions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setShowFilterModal(true)}
              className="btn-outline"
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="max-md:hidden xs:inline">Filter</span>
            </button>
            <button 
              onClick={handleRefresh}
              className="btn-outline"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="max-md:hidden xs:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="max-md:hidden xs:inline">Invite Member</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-surface-card border border-border-primary rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-medium text-subtle uppercase tracking-wider">Total</span>
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-soft" />
            </div>
            <div className="text-[20px] sm:text-[24px] font-bold text-primary">{teamMembers.length}</div>
          </div>
          <div className="bg-surface-card border border-border-primary rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-medium text-subtle uppercase tracking-wider">Admins</span>
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-soft" />
            </div>
            <div className="text-[20px] sm:text-[24px] font-bold text-primary">{roleStats.Admin}</div>
          </div>
          <div className="bg-surface-card border border-border-primary rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-medium text-subtle uppercase tracking-wider">Editors</span>
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-soft" />
            </div>
            <div className="text-[20px] sm:text-[24px] font-bold text-primary">{roleStats.Editor}</div>
          </div>
          <div className="bg-surface-card border border-border-primary rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-medium text-subtle uppercase tracking-wider">Viewers</span>
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-soft" />
            </div>
            <div className="text-[20px] sm:text-[24px] font-bold text-primary">{roleStats.Viewer}</div>
          </div>
        </div>

        {/* Search Bar - Responsive */}
        <div className="mb-5">
          <div className="relative max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9!"
            />
          </div>
        </div>

        {/* Team List Table - Responsive with overflow-x-auto */}
        <div className="bg-surface-card border border-border-primary rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {/* Table - Responsive column widths */}
            <div className="min-w-200 md:min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-[50px_minmax(150px,1fr)_minmax(180px,1fr)_100px_100px_80px] gap-3 sm:gap-4 p-3 sm:p-4 border-b border-border-primary bg-surface-header text-[10px] sm:text-[11px] font-medium text-subtle uppercase tracking-wider">
                <div className="w-8"></div>
                <div>Member</div>
                <div>Email / ID</div>
                <div>Role</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border-primary">
                {paginatedMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-subtle mx-auto mb-3" />
                    <p className="text-tertiary">No team members found</p>
                    <p className="text-subtle text-sm mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  paginatedMembers.map((member) => {
                    const statusConfig = getStatusConfig(member.status);
                    return (
                      <div
                        key={member.id}
                        className={`grid grid-cols-[50px_minmax(150px,1fr)_minmax(180px,1fr)_100px_100px_80px] gap-3 sm:gap-4 p-3 sm:p-4 items-center hover:bg-surface-elevated transition-colors group ${
                          member.status === 'invited' ? 'bg-surface-elevated/50' : ''
                        } relative`}
                      >
                        {/* Avatar */}
                        <Link to={'/home/member_details'} state={{ memberId: member.id }} className="w-8 h-8 rounded-full overflow-hidden border border-border-primary shrink-0">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : member.initial ? (
                            <div className="w-full h-full bg-surface-panel text-brand-soft flex items-center justify-center text-[13px] font-medium">
                              {member.initial}
                            </div>
                          ) : member.status === 'invited' ? (
                            <div className="w-full h-full border border-semantic-warning/50 border-dashed flex items-center justify-center">
                              <Mail className="w-4 h-4 text-semantic-warning" />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-surface-interactive text-tertiary flex items-center justify-center text-[13px] font-medium">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </Link>

                        {/* Member Info */}
                        <Link to={'/home/member_details'} state={{ memberId: member.id }} className="block">
                          <div className={`text-[13px] sm:text-[14px] font-medium text-primary ${member.status === 'invited' ? 'italic' : ''} truncate`}>
                            {member.name}
                          </div>
                          <div className="text-[10px] sm:text-[11px] font-mono text-subtle mt-0.5 truncate">
                            {member.role}
                          </div>
                          {member.status === 'invited' && member.invitedAt && (
                            <div className="text-[9px] sm:text-[10px] font-mono text-semantic-warning/70 mt-0.5">
                              Sent {member.invitedAt}
                            </div>
                          )}
                        </Link>

                        {/* Email / ID */}
                        <Link to={'/home/member_details'} state={{ memberId: member.id }} className="text-[10px] sm:text-[11px] font-mono text-tertiary block truncate">
                          {member.email}
                          {member.userId && (
                            <div className="text-[9px] sm:text-[10px] text-subtle mt-0.5 truncate">
                              ID: {member.userId}
                            </div>
                          )}
                        </Link>

                        {/* Role Badge */}
                        <Link to={'/home/member_details'} state={{ memberId: member.id }}>
                          <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono whitespace-nowrap ${getRoleBadgeStyle(member.userRole)}`}>
                            {member.userRole === 'Admin' && <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />}
                            {member.userRole === 'Editor' && <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />}
                            {member.userRole === 'Viewer' && <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />}
                            <span className="hidden sm:inline">{member.userRole}</span>
                            <span className="sm:hidden">{member.userRole.charAt(0)}</span>
                          </span>
                        </Link>

                        {/* Status */}
                        <Link to={'/home/member_details'} state={{ memberId: member.id }}>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.bg} ${statusConfig.shadow}`}></div>
                            <span className={`text-[10px] sm:text-[11px] font-medium ${statusConfig.color} hidden sm:inline`}>
                              {statusConfig.label}
                            </span>
                            <span className={`text-[10px] font-medium ${statusConfig.color} sm:hidden`}>
                              {statusConfig.label.charAt(0)}
                            </span>
                          </div>
                        </Link>

                        {/* Actions */}
                        <div className="flex justify-end relative">
                          <button
                            onClick={() => setShowPermissionsMenu(showPermissionsMenu === member.id ? null : member.id)}
                            className="p-1 text-subtle hover:text-primary rounded hover:bg-surface-interactive transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {showPermissionsMenu === member.id && (
                            <PermissionsMenu member={member} onClose={() => setShowPermissionsMenu(null)} />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Pagination Footer - Responsive */}
          {filteredMembers.length > 0 && (
            <div className="px-3 sm:px-4 py-3 border-t border-border-primary bg-surface-header flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] sm:text-[11px] font-mono text-subtle">
              <div className="text-center sm:text-left">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:text-primary hover:bg-surface-interactive disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded text-[11px] sm:text-[12px] transition-colors ${
                          currentPage === pageNum
                            ? 'bg-brand text-on-brand'
                            : 'text-subtle hover:bg-surface-elevated hover:text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1 rounded hover:text-primary hover:bg-surface-interactive disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal - Responsive */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-overlay-scrim backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border-primary rounded-xl w-full max-w-md shadow-2xl overflow-hidden mx-4">
            <div className="px-4 sm:px-5 py-4 border-b border-border-primary flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-primary">Invite New Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-subtle hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Email Addresses</label>
                <textarea
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  className="input-secondary resize-none text-start"
                  placeholder="jane@company.com, john@company.com"
                />
                <span className="text-[10px] font-mono text-subtle">Separate multiple emails with commas.</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="input-secondary"
                >
                  <option value="admin">Admin - Full access to all resources</option>
                  <option value="editor">Editor - Can view and modify incidents</option>
                  <option value="viewer">Viewer - Read-only access</option>
                </select>
              </div>
            </div>
            <div className="px-4 sm:px-5 py-4 border-t border-border-primary bg-surface-card flex justify-end gap-3">
              <button onClick={() => setShowInviteModal(false)} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleInvite} className="btn-primary">
                <Send className="w-4 h-4" />
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && <FilterModal />}
    </div>
  );
};

export default DashBoardTeam;