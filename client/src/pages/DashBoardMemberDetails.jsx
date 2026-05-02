import React, { useState } from 'react';
import {
  User,
  Users,
  Shield,
  History,
  AlertTriangle,
  Play,
  UserCheck,
  LogIn,
  Badge,
  Database,
  ChevronLeft,
  X,
  CheckCircle,
  Filter,
  Download,
  Copy,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashBoardMemberDetails = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activityFilter, setActivityFilter] = useState('all');

  const user = {
    name: 'Sarah Jenkins',
    role: 'Lead Incident Commander',
    status: 'Active',
    email: 's.jenkins@incidentcore.internal',
    slack: '@sjenkins_ic',
    timezone: 'PST (UTC-8)',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvY3tRCj6-SCxbo_xZO-mi352yAcO5A8N3YxxfICgcaTl3wSffe6XM9Wh4VR1yM_uLwLAZUIOzQb16w5TR-y2RMDW_DBYzoTnDGwskzRk-NOTTfz-iWuh7ylsodcHA-xiSr36zfsvV6HTtL51Qbv_XHUq5yJwaofEq7sCMESvKHagmNAnO2kc9GgB7uvmR2hKw3ep7oLafRhf_cGX1HCbEVYKUAMDBlXOz5Gj9Q2wB0SwBKsgIG8YkTCyCch8LvX6_DlQakIGb8LwO',
  };

  const teams = [
    { name: 'Core Infrastructure', role: 'Primary', icon: Database, color: 'text-brand-soft' },
    { name: 'SecOps Response', role: 'Secondary', icon: Shield, color: 'text-chip-sky-fg' },
  ];

  const allActivities = [
    {
      id: 1,
      type: 'incident',
      title: 'Resolved INC-4921',
      time: '14:23 UTC',
      description: 'Database latency spike in eu-west-1 cluster. Executed failover playbook.',
      icon: AlertTriangle,
      iconBg: 'bg-semantic-error/15 border-semantic-error/35',
      iconColor: 'text-danger-soft',
    },
    {
      id: 2,
      type: 'playbook',
      title: 'Initiated Playbook: "DB Failover"',
      time: '14:05 UTC',
      description: 'Manual override triggered during INC-4921.',
      icon: Play,
      iconBg: 'bg-surface-elevated border-border-primary',
      iconColor: 'text-tertiary',
    },
    {
      id: 3,
      type: 'assignment',
      title: 'Assigned as Incident Commander',
      time: '13:58 UTC',
      description: 'Took lead on INC-4921.',
      icon: UserCheck,
      iconBg: 'bg-info-bg-subtle border-info-border',
      iconColor: 'text-brand-soft',
    },
    {
      id: 4,
      type: 'login',
      title: 'Session Started',
      time: '08:00 UTC',
      description: 'Logged in from 192.168.1.45 (VPN).',
      icon: LogIn,
      iconBg: 'bg-surface-elevated border-border-primary',
      iconColor: 'text-tertiary',
    },
    {
      id: 5,
      type: 'incident',
      title: 'Participated in INC-4918',
      time: 'Yesterday, 16:30 UTC',
      description: 'Helped resolve API gateway timeout issue.',
      icon: AlertTriangle,
      iconBg: 'bg-semantic-error/15 border-semantic-error/35',
      iconColor: 'text-danger-soft',
    },
  ];

  const getFilteredActivities = () => {
    if (activityFilter === 'all') return allActivities;
    return allActivities.filter(a => a.type === activityFilter);
  };

  const filteredActivities = getFilteredActivities();

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-surface-header text-primary min-h-screen w-full antialiased">
      {/* Back Button */}
      <div className="px-6 md:px-8 pt-4">
        <Link to="/home/team" className="inline-flex items-center gap-2 text-tertiary hover:text-primary transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Back to Team</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {/* Page Header */}
        <div className="px-6 md:px-8 py-6 border-b border-border-primary bg-surface-header">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-surface-panel border border-border-primary overflow-hidden shrink-0">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              
              {/* User Info */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h1 className="text-[24px] leading-[32px] tracking-[-0.02em] font-semibold text-primary">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-semantic-success/12 text-success-bright border border-semantic-success/30 uppercase tracking-wider">
                    {user.status}
                  </span>
                </div>
                <p className="text-[14px] leading-[20px] font-medium text-tertiary mt-1 flex items-center gap-1.5">
                  <Badge className="w-4 h-4" />
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 md:px-8 border-b border-border-primary">
          <div className="flex items-center gap-6">
            {['overview', 'activity', 'permissions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 border-b-2 transition-all text-[13px] font-medium capitalize ${
                  activeTab === tab
                    ? 'border-brand-soft text-brand-soft'
                    : 'border-transparent text-tertiary hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 md:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information Card */}
              <div className="bg-surface-card border border-border-primary rounded-lg p-5">
                <h3 className="text-[16px] font-semibold text-primary flex items-center gap-2 mb-4">
                  <User className="w-[18px] h-[18px] text-subtle" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="block text-[11px] font-medium text-tertiary uppercase mb-1">Email</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono text-primary">{user.email}</span>
                      <button onClick={() => handleCopyToClipboard(user.email)} className="text-subtle hover:text-primary">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-tertiary uppercase mb-1">Slack</span>
                    <span className="text-[13px] font-mono text-primary">{user.slack}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-tertiary uppercase mb-1">Phone</span>
                    <span className="text-[13px] text-primary">{user.phone}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-tertiary uppercase mb-1">Location</span>
                    <span className="text-[13px] text-primary">{user.location}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-tertiary uppercase mb-1">Timezone</span>
                    <span className="text-[13px] text-primary">{user.timezone}</span>
                  </div>
                </div>
              </div>

              {/* Associated Teams Card */}
              <div className="bg-surface-card border border-border-primary rounded-lg p-5">
                <h3 className="text-[16px] font-semibold text-primary flex items-center gap-2 mb-4">
                  <Users className="w-[18px] h-[18px] text-subtle" />
                  Teams
                </h3>
                <div className="space-y-2">
                  {teams.map((team, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-surface-panel border border-border-primary">
                      <div className="flex items-center gap-2">
                        <team.icon className={`w-4 h-4 ${team.color}`} />
                        <span className="text-[13px] text-primary">{team.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-subtle">{team.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Timeline - Full Width */}
              <div className="lg:col-span-2 bg-surface-card border border-border-primary rounded-lg">
                <div className="p-5 border-b border-border-primary flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-[16px] font-semibold text-primary flex items-center gap-2">
                    <History className="w-[18px] h-[18px] text-subtle" />
                    Recent Activity
                  </h3>
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="bg-surface-elevated border border-border-primary rounded px-2 py-1 text-[11px] text-primary"
                  >
                    <option value="all">All</option>
                    <option value="incident">Incidents</option>
                    <option value="playbook">Playbooks</option>
                    <option value="assignment">Assignments</option>
                    <option value="login">Logins</option>
                  </select>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {filteredActivities.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0`}>
                          <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-[13px] font-medium text-primary">{activity.title}</span>
                            <span className="text-[10px] font-mono text-subtle">{activity.time}</span>
                          </div>
                          <p className="text-[12px] text-tertiary mt-1">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-surface-card border border-border-primary rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-semibold text-primary">All Activity</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-subtle hover:text-primary border border-border-primary rounded-lg">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-subtle hover:text-primary border border-border-primary rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {allActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-4 bg-surface-elevated rounded-lg border border-border-primary">
                    <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                      <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[13px] font-medium text-primary">{activity.title}</span>
                        <span className="text-[10px] font-mono text-subtle">{activity.time}</span>
                      </div>
                      <p className="text-[12px] text-tertiary">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="bg-surface-card border border-border-primary rounded-lg p-6">
              <h3 className="text-[16px] font-semibold text-primary mb-6">Role Permissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-primary">
                      <th className="text-left py-3 text-[11px] font-medium text-subtle uppercase">Permission</th>
                      <th className="text-left py-3 text-[11px] font-medium text-subtle uppercase">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-primary">
                      <td className="py-3 text-[13px]">View Incidents</td>
                      <td className="py-3"><CheckCircle className="w-4 h-4 text-success-bright" /></td>
                    </tr>
                    <tr className="border-b border-border-primary">
                      <td className="py-3 text-[13px]">Create Incidents</td>
                      <td className="py-3"><CheckCircle className="w-4 h-4 text-success-bright" /></td>
                    </tr>
                    <tr className="border-b border-border-primary">
                      <td className="py-3 text-[13px]">Edit Incidents</td>
                      <td className="py-3"><CheckCircle className="w-4 h-4 text-success-bright" /></td>
                    </tr>
                    <tr className="border-b border-border-primary">
                      <td className="py-3 text-[13px]">Delete Incidents</td>
                      <td className="py-3"><X className="w-4 h-4 text-danger-soft" /></td>
                    </tr>
                    <tr className="border-b border-border-primary">
                      <td className="py-3 text-[13px]">Manage Users</td>
                      <td className="py-3"><X className="w-4 h-4 text-danger-soft" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoardMemberDetails;