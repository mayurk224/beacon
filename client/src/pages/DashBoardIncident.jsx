import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Timer,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowUp,
  Search,
  Wrench,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  History,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  Bolt,
  Shield,
  Filter,
  Plus,
  UserPlus,
  X,
  Clock,
  Users,
  Tag,
  RefreshCw,
  Download,
  Loader2,
} from 'lucide-react';

const DashBoardIncident = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('all');
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [sortBy, setSortBy] = useState('newest');

  // Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Tab data with counts
  const tabs = [
    { id: 'all', label: 'All', count: 24 },
    { id: 'assigned', label: 'Assigned to me', count: 8 },
    { id: 'unassigned', label: 'Unassigned', count: 12 },
    { id: 'resolved', label: 'Resolved', count: 45 },
    { id: 'critical', label: 'Critical (P1)', count: 3 },
  ];

  // Stats data
  const statsCards = [
    {
      id: 1,
      label: 'Mean Time to Resolve',
      value: '42m 12s',
      icon: Timer,
      trend: '12% vs last week',
      trendIcon: TrendingDown,
      trendColor: 'text-emerald-500',
    },
    {
      id: 2,
      label: 'Open Critical (P1)',
      value: '03',
      icon: AlertTriangle,
      iconColor: 'text-[#FF6A00]',
      iconFill: true,
      subtitle: 'Immediate action required',
      subtitleColor: 'text-gray-500',
    },
    {
      id: 3,
      label: 'Success Rate',
      value: '99.98%',
      icon: CheckCircle2,
      iconColor: 'text-[#528dff]',
      trend: '0.02% recovery',
      trendIcon: ArrowUp,
      trendColor: 'text-emerald-500',
    },
  ];

  // All incidents data
  const allIncidents = [
    {
      id: 'INC-8492',
      name: 'Database replica latency spike in us-east-1',
      severity: 'SEV-1',
      severityColor: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      status: 'Investigating',
      statusClass: 'bg-red-500/20 text-red-500 border border-red-500/30',
      assignee: 'J. Doe',
      assigneeInitials: 'JD',
      assigneeClass: 'bg-[#528dff] text-[#00275f]',
      timeAgo: '12m ago',
      timestamp: '2024-01-15T14:32:00',
      isResolved: false,
      isUnassigned: false,
      assignedToMe: true,
      description: 'Database replica experiencing high latency spikes affecting read operations',
      tags: ['database', 'performance'],
    },
    {
      id: 'INC-8491',
      name: 'API Gateway 502 errors on /checkout endpoint',
      severity: 'SEV-2',
      severityColor: 'bg-orange-500',
      status: 'Identified',
      statusClass: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
      assignee: 'A. Kumar',
      assigneeInitials: 'AK',
      assigneeClass: 'bg-[#968ab5] text-[#2d2447]',
      timeAgo: '45m ago',
      timestamp: '2024-01-15T13:15:00',
      isResolved: false,
      isUnassigned: false,
      assignedToMe: false,
      description: 'Checkout endpoint returning 502 errors due to upstream timeout',
      tags: ['api', 'checkout'],
    },
    {
      id: 'INC-8488',
      name: 'Background worker queue buildup (cache-invalidation)',
      severity: 'SEV-3',
      severityColor: 'bg-yellow-500',
      status: 'Monitoring',
      statusClass: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
      assignee: 'Unassigned',
      assigneeInitials: null,
      assigneeClass: '',
      timeAgo: '2h ago',
      timestamp: '2024-01-15T11:00:00',
      isResolved: false,
      isUnassigned: true,
      assignedToMe: false,
      description: 'Cache invalidation queue building up, causing delays',
      tags: ['cache', 'worker'],
    },
    {
      id: 'INC-8485',
      name: 'Minor UI glitch on legacy billing dashboard',
      severity: 'SEV-4',
      severityColor: 'bg-blue-500',
      status: 'Investigating',
      statusClass: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
      assignee: 'M. Rossi',
      assigneeInitials: 'MR',
      assigneeClass: 'bg-[#a7caf3] text-[#063254]',
      timeAgo: '5h ago',
      timestamp: '2024-01-15T08:45:00',
      isResolved: false,
      isUnassigned: false,
      assignedToMe: false,
      description: 'Billing dashboard showing incorrect data for some customers',
      tags: ['ui', 'billing'],
    },
    {
      id: 'INC-8480',
      name: 'Stale DNS records causing connection timeouts',
      severity: 'SEV-3',
      severityColor: 'bg-neutral-500',
      status: 'Resolved',
      statusClass: 'bg-green-500/20 text-green-400 border border-green-500/30',
      assignee: 'J. Doe',
      assigneeInitials: 'JD',
      assigneeClass: 'bg-[#528dff] text-[#00275f]',
      timeAgo: '1d ago',
      timestamp: '2024-01-14T10:00:00',
      isResolved: true,
      isUnassigned: false,
      assignedToMe: false,
      description: 'DNS records not updating properly causing connection issues',
      tags: ['dns', 'networking'],
    },
  ];

  // On-call team data
  const onCallTeam = [
    {
      id: 1,
      name: 'Alex Chen',
      role: 'Primary',
      roleColor: 'text-emerald-500',
      initials: 'AC',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzjOi7ZPwBLnjU9dd-w3IgWsg7TjDMwXGDWE_LjmAPG8xDuEM0MF2j-V1Wc6iGEJTq_FKBa9GDNv8EI0-DpJJd4CT8_TylP6kDvaQ79e4ZxhcRQ-4YgSjs3NY2ALFgeovpCf90OVP4dHm926YxQtacmh_Vx5c_jj9nRNeRjOMRXT4PrQZY7DxcOVoTEO_MMtIVSmro9baSo6aM2XDKa1jssCh1Mkd_bEqmOR113KtxBPtCNmSFY-rA_lQ6hQH2v4Aj4aVqLGwySLox',
      hasShield: true,
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      role: 'Secondary',
      roleColor: 'text-gray-500',
      initials: 'SJ',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2SbvzY079Bmc0RbYFLTsz3eukljNihNVnvCMcUFMxJhb1Qb0LV8m5_fDsSgY7nZ9eN9MnPE_4McjEUlXS_dVYCic5ufMAJzpU2FnjkKf_Lm4fHIqfujAJuN5jShpoeTqvGwipdM3u5oLRh6Rj_lbogL9JXS0PdiWs176d4ISLWuOmU2SBamd_fGPv2XQ6ptD_0bw7u0rt9bwEqF9wlogLwIQ_QwnlJe58XXEpgYnsmPJYK1iLTPCb3L9PDSFYupMJwllr2XCPpJh2',
      hasShield: false,
    },
  ];

  // Recent activity data
  const recentActivities = [
    {
      id: 1,
      title: '#INC-8480 Resolved',
      description: 'Primary responder J. Doe applied DNS hotfix to production. Recovery confirmed by automated health checks.',
      timestamp: '10:45 AM Today',
      status: 'resolved',
    },
    {
      id: 2,
      title: 'Post-mortem Draft Created',
      description: '#INC-8475: Root cause identified as third-party CDN outage. Draft open for review.',
      timestamp: 'Yesterday, 4:20 PM',
      status: 'draft',
    },
  ];

  // Filter incidents based on active tab, search, severity, status
  const getFilteredIncidents = () => {
    let filtered = [...allIncidents];

    // Tab filtering
    switch (activeTab) {
      case 'assigned':
        filtered = filtered.filter(i => i.assignedToMe);
        break;
      case 'unassigned':
        filtered = filtered.filter(i => i.isUnassigned);
        break;
      case 'resolved':
        filtered = filtered.filter(i => i.isResolved);
        break;
      case 'critical':
        filtered = filtered.filter(i => i.severity === 'SEV-1');
        break;
      default:
        filtered = filtered;
    }

    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.assignee.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filtering
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(i => {
        const severityMap = { sev1: 'SEV-1', sev2: 'SEV-2', sev3: 'SEV-3', sev4: 'SEV-4' };
        return i.severity === severityMap[selectedSeverity];
      });
    }

    // Status filtering
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(i => 
        i.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'severity':
        const severityOrder = { 'SEV-1': 1, 'SEV-2': 2, 'SEV-3': 3, 'SEV-4': 4 };
        filtered.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredIncidents = getFilteredIncidents();
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = filteredIncidents.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setActivePage(1);
  }, [activeTab, searchTerm, selectedSeverity, selectedStatus, sortBy]);

  const getTabCount = (tabId) => {
    switch (tabId) {
      case 'all': return allIncidents.length;
      case 'assigned': return allIncidents.filter(i => i.assignedToMe).length;
      case 'unassigned': return allIncidents.filter(i => i.isUnassigned).length;
      case 'resolved': return allIncidents.filter(i => i.isResolved).length;
      case 'critical': return allIncidents.filter(i => i.severity === 'SEV-1').length;
      default: return 0;
    }
  };

  // Time range options
  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ];

  // Severity options for filter
  const severityFilterOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'sev1', label: 'SEV-1 Critical' },
    { value: 'sev2', label: 'SEV-2 High' },
    { value: 'sev3', label: 'SEV-3 Medium' },
    { value: 'sev4', label: 'SEV-4 Low' },
  ];

  // Status options for filter
  const statusFilterOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'identified', label: 'Identified' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Exporting incidents...');
  };

  const getActivityDotColor = (status) => {
    return status === 'resolved' ? 'border-emerald-500' : 'border-gray-600';
  };

  const getActivityInnerDot = (status) => {
    return status === 'resolved' ? 'bg-emerald-500' : 'bg-gray-600';
  };

  const InviteModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#e2e2e3]">Invite Team Member</h3>
          <button onClick={() => setShowInviteModal(false)} className="text-[#8c909f] hover:text-[#e2e2e3]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-medium text-[#8c909f] uppercase tracking-wider">Email</label>
            <input type="email" className="mt-1 w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2 text-[13px] text-[#e2e2e3]" placeholder="colleague@company.com" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#8c909f] uppercase tracking-wider">Role</label>
            <select className="mt-1 w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2 text-[13px] text-[#e2e2e3]">
              <option>Incident Commander</option>
              <option>Communications Lead</option>
              <option>Technical Lead</option>
              <option>Observer</option>
            </select>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#262626] bg-[#141414] flex justify-end gap-3">
          <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 border border-[#262626] rounded-lg text-[13px] text-[#e2e2e3]">Cancel</button>
          <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 bg-[#4F8CFF] text-white rounded-lg text-[13px] font-semibold">Send Invite</button>
        </div>
      </div>
    </div>
  );

  const FilterModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#e2e2e3]">Filter Incidents</h3>
          <button onClick={() => setShowFilterModal(false)} className="text-[#8c909f] hover:text-[#e2e2e3]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-medium text-[#8c909f] uppercase tracking-wider">Severity</label>
            <select className="mt-1 w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2 text-[13px] text-[#e2e2e3]">
              <option>All</option>
              <option>SEV-1 Critical</option>
              <option>SEV-2 High</option>
              <option>SEV-3 Medium</option>
              <option>SEV-4 Low</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#8c909f] uppercase tracking-wider">Status</label>
            <select className="mt-1 w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2 text-[13px] text-[#e2e2e3]">
              <option>All</option>
              <option>Investigating</option>
              <option>Identified</option>
              <option>Monitoring</option>
              <option>Resolved</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#8c909f] uppercase tracking-wider">Time Range</label>
            <select className="mt-1 w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2 text-[13px] text-[#e2e2e3]">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#262626] bg-[#141414] flex justify-end gap-3">
          <button onClick={() => setShowFilterModal(false)} className="px-4 py-2 border border-[#262626] rounded-lg text-[13px] text-[#e2e2e3]">Reset</button>
          <button onClick={() => setShowFilterModal(false)} className="px-4 py-2 bg-[#4F8CFF] text-white rounded-lg text-[13px] font-semibold">Apply Filters</button>
        </div>
      </div>
    </div>
  );

  // Mobile filter drawer
  const MobileFilterDrawer = () => (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-[#1a1a1a] border-l border-[#262626] shadow-xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#e2e2e3]">Filters</h3>
          <button onClick={() => setMobileFiltersOpen(false)} className="text-[#8c909f]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-[#8c909f] uppercase tracking-wider block mb-2">Severity</label>
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2.5 text-[13px] text-[#e2e2e3]"
            >
              {severityFilterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8c909f] uppercase tracking-wider block mb-2">Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2.5 text-[13px] text-[#e2e2e3]"
            >
              {statusFilterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8c909f] uppercase tracking-wider block mb-2">Time Range</label>
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2.5 text-[13px] text-[#e2e2e3]"
            >
              {timeRanges.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8c909f] uppercase tracking-wider block mb-2">Sort By</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg p-2.5 text-[13px] text-[#e2e2e3]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">Severity (High to Low)</option>
            </select>
          </div>
          <button 
            onClick={() => setMobileFiltersOpen(false)}
            className="w-full mt-4 bg-[#4F8CFF] text-white rounded-lg py-2.5 font-semibold"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="text-[#e2e2e3] min-h-screen w-full antialiased bg-[#0a0a0a]">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Page Header & Actions */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-[22px] sm:text-[24px] leading-[30px] sm:leading-[32px] tracking-[-0.02em] font-semibold text-[#e2e2e3]">
                Incidents
              </h1>
              <p className="text-[13px] sm:text-[14px] leading-[18px] sm:leading-[20px] font-medium text-neutral-400 mt-1">
                Manage and track active operational incidents.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 border border-[#262626] rounded bg-transparent hover:bg-[#1A1A1A] transition-colors text-[13px] font-medium text-[#e2e2e3]"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button 
                onClick={() => setShowFilterModal(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-[#262626] rounded bg-transparent hover:bg-[#1A1A1A] transition-colors text-[13px] font-medium text-[#e2e2e3]"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-1.5 border border-[#262626] rounded bg-transparent hover:bg-[#1A1A1A] transition-colors text-[13px] font-medium text-[#e2e2e3]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link
                to={'/home/create_incident'}
                className="flex items-center gap-2 px-3 py-1.5 border border-transparent rounded bg-[#4F8CFF] hover:bg-[#3d70d1] transition-colors text-[13px] font-medium text-white shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Incident</span>
                <span className="sm:hidden">New</span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
              <input
                type="text"
                placeholder="Search by title, ID, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg pl-9 pr-3 py-2 text-[13px] text-[#e2e2e3] placeholder:text-[#8c909f] focus:border-[#528dff] focus:outline-none"
              />
            </div>
          </div>

          {/* Sub-navigation Tabs - Horizontal scroll on mobile */}
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
            <div className="flex items-center gap-4 sm:gap-6 border-b border-neutral-800 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 border-b-2 transition-colors text-[13px] sm:text-[14px] leading-[20px] font-medium flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#528dff] text-[#528dff]'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                  <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono leading-none">
                    {getTabCount(tab.id)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List View Canvas */}
        <div className="p-4 sm:p-6">
          {/* Stats Cards Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {statsCards.map((card) => (
              <div key={card.id} className="bg-[#141414] border border-[#262626] rounded-lg p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-neutral-400 text-[11px] sm:text-[12px] leading-[16px] font-medium uppercase tracking-wider">
                    {card.label}
                  </span>
                  <card.icon
                    className={`${card.iconColor || 'text-neutral-500'} w-5 h-5`}
                    fill={card.iconFill ? 'currentColor' : 'none'}
                  />
                </div>
                <div className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#e2e2e3]">
                  {card.value}
                </div>
                {card.trend && (
                  <div className={`${card.trendColor || 'text-emerald-500'} text-[11px] sm:text-xs mt-2 flex items-center`}>
                    <card.trendIcon className="w-3 h-3 mr-1" />
                    {card.trend}
                  </div>
                )}
                {card.subtitle && (
                  <div className={`${card.subtitleColor || 'text-neutral-500'} text-[11px] sm:text-xs mt-2`}>
                    {card.subtitle}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Table Controls - Responsive filters row */}
          <div className="bg-[#141414] border border-[#262626] rounded-lg overflow-hidden mb-6">
            <div className="p-3 sm:p-4 border-b border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Severity Filter - hidden on mobile, shown in drawer */}
                <div className="hidden lg:block relative">
                  <select 
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="appearance-none bg-[#1A1A1A] border border-[#262626] text-sm text-neutral-300 py-1.5 pl-4 pr-10 rounded focus:ring-1 focus:ring-[#528dff] outline-none cursor-pointer"
                  >
                    {severityFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none w-4 h-4" />
                </div>

                {/* Status Filter - hidden on mobile */}
                <div className="hidden lg:block relative">
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none bg-[#1A1A1A] border border-[#262626] text-sm text-neutral-300 py-1.5 pl-4 pr-10 rounded focus:ring-1 focus:ring-[#528dff] outline-none cursor-pointer"
                  >
                    {statusFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none w-4 h-4" />
                </div>

                {/* Time Range - visible on tablet+ */}
                <div className="hidden md:block relative">
                  <select 
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="appearance-none bg-[#1A1A1A] border border-[#262626] text-sm text-neutral-300 py-1.5 pl-4 pr-10 rounded focus:ring-1 focus:ring-[#528dff] outline-none cursor-pointer"
                  >
                    {timeRanges.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none w-4 h-4" />
                </div>

                {/* Sort on mobile - compact */}
                <div className="relative md:hidden">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#1A1A1A] border border-[#262626] text-xs text-neutral-300 py-1.5 pl-3 pr-8 rounded focus:ring-1 focus:ring-[#528dff] outline-none cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="severity">Severity</option>
                  </select>
                  <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none w-3.5 h-3.5" />
                </div>
              </div>

              {/* Sort Controls - desktop */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-xs text-neutral-500 font-medium mr-2">Sort by:</span>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#1A1A1A] border border-[#262626] text-sm text-neutral-300 py-1.5 pl-4 pr-10 rounded focus:ring-1 focus:ring-[#528dff] outline-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="severity">Severity (High to Low)</option>
                  </select>
                  <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Responsive Table - Card layout on mobile, grid on desktop */}
            <div className="block lg:hidden">
              {paginatedIncidents.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-[#8c909f] mx-auto mb-3" />
                  <p className="text-[#c2c6d6]">No incidents found</p>
                </div>
              ) : (
                paginatedIncidents.map((incident) => (
                  <div key={incident.id} className="border-b border-[#262626] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${incident.severityColor.split(' ')[0]}`}></div>
                        <span className="text-xs font-bold text-[#e2e2e3]">{incident.severity}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${incident.statusClass}`}>
                          {incident.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500">{incident.timeAgo}</div>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#e2e2e3]">{incident.name}</div>
                      <div className="text-[11px] font-mono text-neutral-400 mt-1">{incident.id}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {incident.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#262626] rounded text-[#8c909f]">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {incident.isUnassigned ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center">
                              <UserPlus className="w-3 h-3 text-neutral-400" />
                            </div>
                            <span className="text-[12px] text-neutral-500 italic">{incident.assignee}</span>
                          </>
                        ) : (
                          <>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${incident.assigneeClass}`}>
                              {incident.assigneeInitials}
                            </div>
                            <span className="text-[12px] text-neutral-300">{incident.assignee}</span>
                          </>
                        )}
                      </div>
                      <Link
                        to="/home/incident_details"
                        state={{ incidentId: incident.id }}
                        className="text-[#528dff] hover:bg-[#528dff]/10 p-1.5 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-[100px_80px_minmax(300px,1fr)_120px_150px_120px_80px] gap-4 px-4 py-3 border-b border-[#262626] bg-[#1A1A1A]/50">
                <div className="text-[12px] font-medium text-neutral-400 uppercase tracking-wider">Status</div>
                <div className="text-[12px] font-medium text-neutral-400 uppercase tracking-wider">Severity</div>
                <div className="text-[12px] font-medium text-neutral-400 uppercase tracking-wider">Title</div>
                <div className="text-[12px] font-medium text-neutral-400 uppercase tracking-wider">ID</div>
                <div className="text-[12px] font-medium text-neutral-400 uppercase tracking-wider">Assigned To</div>
                <div className="text-[12px] font-medium text-neutral-400 uppercase tracking-wider">Created</div>
                <div className="text-[12px] font-medium text-neutral-400 uppercase tracking-wider text-center">Actions</div>
              </div>
              <div className="flex flex-col">
                {paginatedIncidents.map((incident) => (
                  <div key={incident.id} className="group grid grid-cols-[100px_80px_minmax(300px,1fr)_120px_150px_120px_80px] gap-4 px-4 py-3 border-b border-white/5 items-center hover:bg-[#1A1A1A] transition-colors">
                    <div><span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${incident.statusClass}`}>{incident.status}</span></div>
                    <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${incident.severityColor.split(' ')[0]}`}></div><span className="text-[13px] font-medium">{incident.severity}</span></div>
                    <div><div className="text-[14px] font-medium">{incident.name}</div><div className="flex gap-1 mt-1">{incident.tags.map(tag => <span key={tag} className="text-[9px] px-1 py-0.5 bg-[#262626] rounded text-[#8c909f]">{tag}</span>)}</div></div>
                    <div className="text-[12px] font-mono text-neutral-400">{incident.id}</div>
                    <div className="flex items-center gap-2">
                      {incident.isUnassigned ? <><div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center"><UserPlus className="w-3 h-3 text-neutral-400" /></div><span className="text-[13px] text-neutral-500 italic">{incident.assignee}</span></> : <><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${incident.assigneeClass}`}>{incident.assigneeInitials}</div><span className="text-[13px] text-neutral-300">{incident.assignee}</span></>}
                    </div>
                    <div className="text-[12px] font-mono text-neutral-400">{incident.timeAgo}</div>
                    <div className="flex items-center justify-center gap-1"><Link to="/home/incident_details" state={{ incidentId: incident.id }} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[#528dff] hover:bg-[#528dff]/10"><Eye className="w-3.5 h-3.5" /></Link><button className="text-neutral-400 hover:text-white p-1"><MoreVertical className="w-4 h-4" /></button></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination - Responsive */}
            {filteredIncidents.length > 0 && (
              <div className="px-4 py-3 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1A1A1A]/30 rounded-b-lg">
                <span className="text-[12px] sm:text-[13px] text-neutral-500">
                  Showing {((activePage - 1) * itemsPerPage) + 1} - {Math.min(activePage * itemsPerPage, filteredIncidents.length)} of {filteredIncidents.length}
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded border border-[#262626] text-neutral-400 hover:bg-[#1A1A1A] disabled:opacity-50" disabled={activePage === 1} onClick={() => setActivePage(Math.max(1, activePage - 1))}><ChevronLeft className="w-4 h-4" /></button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = totalPages <= 5 ? i+1 : (activePage <= 3 ? i+1 : (activePage >= totalPages-2 ? totalPages-4+i : activePage-2+i));
                      return <button key={pageNum} onClick={() => setActivePage(pageNum)} className={`px-2 py-1 rounded text-[12px] transition-colors ${activePage === pageNum ? 'bg-[#4F8CFF] text-white' : 'text-neutral-400 hover:bg-[#1A1A1A]'}`}>{pageNum}</button>;
                    })}
                  </div>
                  <button className="px-2 py-1 rounded border border-[#262626] text-neutral-400 hover:bg-[#1A1A1A] disabled:opacity-50" disabled={activePage === totalPages} onClick={() => setActivePage(Math.min(totalPages, activePage + 1))}><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>

          {/* Contextual Section */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#141414] border border-[#262626] rounded-lg p-5 sm:p-6 overflow-x-auto">
              <h2 className="text-[18px] sm:text-[20px] leading-[26px] sm:leading-[28px] font-semibold text-[#e2e2e3] mb-4 sm:mb-6 flex items-center">
                <History className="w-5 h-5 mr-2 text-[#528dff]" />
                Recent Resolution Activity
              </h2>
              <div className="space-y-5 relative pl-4">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-800"></div>
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="relative pl-8 flex items-start">
                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#141414] border ${getActivityDotColor(activity.status)} flex items-center justify-center z-10`}><div className={`w-2 h-2 rounded-full ${getActivityInnerDot(activity.status)}`}></div></div>
                    <div><p className={`text-sm font-bold ${activity.status === 'resolved' ? 'text-[#e2e2e3]' : 'text-neutral-400'}`}>{activity.title}</p><p className="text-xs text-neutral-500 mt-1">{activity.description}</p><span className="text-[10px] text-neutral-600 mt-2 block">{activity.timestamp}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      {showInviteModal && <InviteModal />}
      {showFilterModal && <FilterModal />}
      {mobileFiltersOpen && <MobileFilterDrawer />}
    </div>
  );
};

export default DashBoardIncident;