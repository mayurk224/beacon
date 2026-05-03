import React, { useState } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Info,
  Terminal,
  Users,
  Shield,
  List,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Filter
} from 'lucide-react';

const AdminActivity = () => {
  const [selectedFilter, setSelectedFilter] = useState('All Logs');
  const [currentPage, setCurrentPage] = useState(1);

  const filterButtons = [
    'All Logs', 'Auth', 'Database', 'Config', 'Security', 'Billing'
  ];

  const logs = [
    {
      id: 1,
      timestamp: '2023-10-24 14:22:01',
      user: { initials: 'JD', name: 'john.doe@company.com', color: 'bg-semantic-info' },
      action: 'USER_LOGIN_SUCCESS',
      actionType: 'success',
      ip: '192.168.1.104',
      status: 'Success',
      statusColor: 'text-semantic-success',
      statusDot: 'bg-semantic-success',
      isError: false,
    },
    {
      id: 2,
      timestamp: '2023-10-24 14:21:45',
      user: { initials: 'AS', name: 'admin_sarah', color: 'bg-brand' },
      action: 'DB_CONFIG_UPDATE',
      actionType: 'warning',
      ip: '45.22.112.9',
      status: 'Warning',
      statusColor: 'text-semantic-warning',
      statusDot: 'bg-semantic-warning',
      isError: false,
    },
    {
      id: 3,
      timestamp: '2023-10-24 14:18:22',
      user: { initials: 'SY', name: 'system-bot', color: 'bg-secondary' },
      action: 'BACKUP_SCHEDULED',
      actionType: 'info',
      ip: 'local_host',
      status: 'Info',
      statusColor: 'text-semantic-info',
      statusDot: 'bg-semantic-info',
      isError: false,
    },
    {
      id: 4,
      timestamp: '2023-10-24 14:15:10',
      user: { initials: '??', name: 'anonymous_user', color: 'bg-semantic-error' },
      action: 'LOGIN_FAIL_ATTEMPT',
      actionType: 'critical',
      ip: '212.45.1.202',
      status: 'Critical',
      statusColor: 'text-semantic-error',
      statusDot: 'bg-semantic-error',
      isError: true,
    },
    {
      id: 5,
      timestamp: '2023-10-24 14:12:05',
      user: { initials: 'MK', name: 'mike_k', color: 'bg-chip-violet-fg' },
      action: 'SUBSCRIPTION_RENEW',
      actionType: 'success',
      ip: '88.1.92.12',
      status: 'Success',
      statusColor: 'text-semantic-success',
      statusDot: 'bg-semantic-success',
      isError: false,
    },
  ];

  const getActionBadge = (actionType) => {
    switch (actionType) {
      case 'success':
        return 'bg-semantic-success/10 text-semantic-success border-semantic-success/20';
      case 'warning':
        return 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20';
      case 'info':
        return 'bg-semantic-info/10 text-semantic-info border-semantic-info/20';
      case 'critical':
        return 'bg-semantic-error/10 text-semantic-error border-semantic-error/20';
      default:
        return 'bg-semantic-info/10 text-semantic-info border-semantic-info/20';
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-[calc(100vh-64px)] text-primary">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 md:mb-8 gap-4 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-1">Activity Logs</h1>
          <p className="text-xs sm:text-sm text-secondary">
            Audit trail for all administrative and user-level actions across the platform.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="btn-outline">
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="">Refresh</span>
          </button>
          <button className="btn-outline">
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
        <div className="bg-surface-panel rounded-xl border border-border-primary p-4 sm:p-6">
          <span className="text-secondary text-[10px] sm:text-xs uppercase tracking-wider mb-2 block">Total Events (24h)</span>
          <div className="flex items-end justify-between flex-wrap gap-1">
            <span className="text-xl sm:text-2xl font-semibold text-foreground">12,482</span>
            <span className="text-semantic-success text-[10px] sm:text-xs font-mono flex items-center gap-0.5 sm:gap-1">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              +4.2%
            </span>
          </div>
        </div>

        <div className="bg-surface-panel rounded-xl border border-border-primary p-4 sm:p-6">
          <span className="text-secondary text-[10px] sm:text-xs uppercase tracking-wider mb-2 block">Failed Attempts</span>
          <div className="flex items-end justify-between flex-wrap gap-1">
            <span className="text-xl sm:text-2xl font-semibold text-semantic-error">142</span>
            <span className="text-semantic-error text-[10px] sm:text-xs font-mono flex items-center gap-0.5 sm:gap-1">
              <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              -12%
            </span>
          </div>
        </div>

        <div className="bg-surface-panel rounded-xl border border-border-primary p-4 sm:p-6">
          <span className="text-secondary text-[10px] sm:text-xs uppercase tracking-wider mb-2 block">Active Sessions</span>
          <div className="flex items-end justify-between flex-wrap gap-1">
            <span className="text-xl sm:text-2xl font-semibold text-foreground">2,847</span>
            <span className="text-semantic-success text-[10px] sm:text-xs font-mono flex items-center gap-0.5 sm:gap-1">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              +8.1%
            </span>
          </div>
        </div>

        <div className="bg-surface-panel rounded-xl border border-border-primary p-4 sm:p-6">
          <span className="text-secondary text-[10px] sm:text-xs uppercase tracking-wider mb-2 block">Avg Response</span>
          <div className="flex items-end justify-between flex-wrap gap-1">
            <span className="text-xl sm:text-2xl font-semibold text-foreground">124ms</span>
            <span className="text-semantic-success text-[10px] sm:text-xs font-mono flex items-center gap-0.5 sm:gap-1">
              <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              -5ms
            </span>
          </div>
        </div>
      </div>

      {/* Filter Section - Inline, no mobile drawer */}
      <div className="bg-surface-panel rounded-xl border border-border-primary mb-6 md:mb-8">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-primary">Filter by Action</span>
            </div>
            <div className="relative flex-1 max-w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                className="input-secondary pl-9!"
              />
            </div>
          </div>
          
          {/* Filter Buttons - Scrollable on mobile */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-32 overflow-y-auto">
            {filterButtons.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedFilter === filter
                    ? 'bg-brand-strong text-white'
                    : 'bg-surface-elevated border border-border-primary text-secondary hover:text-foreground hover:bg-surface-card'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs Table - Horizontal scroll on small screens */}
      <div className="bg-surface-panel rounded-xl border border-border-primary overflow-hidden ">
        <div className="overflow-x-auto">
          <div className="min-w-200 lg:min-w-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-elevated border-b border-border-primary">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider hidden md:table-cell">
                    IP Address
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider text-right">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-surface-elevated/45 transition-colors group ${
                      log.isError ? 'bg-semantic-error/5' : ''
                    }`}
                  >
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 font-mono text-[11px] sm:text-sm whitespace-nowrap ${
                      log.isError ? 'text-semantic-error' : 'text-secondary'
                    }`}>
                      {log.timestamp}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${log.user.color} flex items-center justify-center text-[8px] sm:text-[10px] text-on-brand font-bold shrink-0`}>
                          {log.user.initials}
                        </div>
                        <span className="text-[11px] sm:text-sm text-foreground truncate max-w-25 sm:max-w-37.5 md:max-w-none">
                          {log.user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[11px] font-mono border whitespace-nowrap ${getActionBadge(log.actionType)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-[11px] sm:text-sm text-secondary hidden md:table-cell">
                      {log.ip}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${log.statusDot}`}></span>
                        <span className={`text-[10px] sm:text-xs font-medium ${log.statusColor} whitespace-nowrap`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <button className="text-secondary hover:text-foreground transition-colors p-1">
                        <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer - Responsive */}
        <div className="bg-surface-elevated px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border-primary">
          <span className="text-[10px] sm:text-xs text-secondary text-center sm:text-left">
            Showing 1 to 5 of <span className="text-foreground">12,482</span> logs
          </span>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <button
              className="p-1 sm:p-1.5 rounded border border-border-primary text-secondary hover:bg-surface-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-brand-strong text-white text-[10px] sm:text-xs font-medium">1</button>
              <button className="w-6 h-6 sm:w-8 sm:h-8 rounded text-secondary hover:bg-surface-card text-[10px] sm:text-xs font-medium">2</button>
              <button className="w-6 h-6 sm:w-8 sm:h-8 rounded text-secondary hover:bg-surface-card text-[10px] sm:text-xs font-medium">3</button>
              <span className="text-secondary text-[10px] sm:text-xs px-0.5 sm:px-1">...</span>
              <button className="w-6 h-6 sm:w-8 sm:h-8 rounded text-secondary hover:bg-surface-card text-[10px] sm:text-xs font-medium">12</button>
            </div>
            <button
              className="p-1 sm:p-1.5 rounded border border-border-primary text-secondary hover:bg-surface-card transition-colors"
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Retention Notice - Responsive */}
      <div className="mt-4 sm:mt-6 md:mt-8 p-4 sm:p-6 bg-surface-card rounded-xl border border-dashed border-border-primary flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="p-1.5 sm:p-2 bg-semantic-info/10 rounded-lg text-semantic-info shrink-0 self-start">
          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Data Retention Notice</h3>
          <p className="text-xs sm:text-sm text-secondary">
            Activity logs are retained for 90 days as per your current Enterprise plan. 
            For longer retention periods or to enable cold storage, please visit the{' '}
            <a className="text-semantic-info hover:underline" href="#">
              Billing Settings
            </a>{' '}
            page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminActivity;