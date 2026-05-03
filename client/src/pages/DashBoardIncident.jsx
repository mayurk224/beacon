import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const tabs = [
    { id: 'all', label: 'All', count: 24 },
    { id: 'assigned', label: 'Assigned to me', count: 8 },
    { id: 'unassigned', label: 'Unassigned', count: 12 },
    { id: 'resolved', label: 'Resolved', count: 45 },
    { id: 'critical', label: 'Critical (P1)', count: 3 },
  ];

  // State-driven data (API-first). Keep small sample fallbacks so UI renders
  const [statsCards, setStatsCards] = useState([
    { id: 1, label: 'Mean Time to Resolve', value: '42m 12s', icon: Timer, trend: '12% vs last week', trendIcon: TrendingDown, trendColor: 'text-emerald-500' },
    { id: 2, label: 'Open Critical (P1)', value: '03', icon: AlertTriangle, iconColor: 'text-accent-orange', iconFill: true, subtitle: 'Immediate action required', subtitleColor: 'text-muted' },
    { id: 3, label: 'Success Rate', value: '99.98%', icon: CheckCircle2, iconColor: 'text-brand-strong', trend: '0.02% recovery', trendIcon: ArrowUp, trendColor: 'text-emerald-500' },
  ]);

  const [incidents, setIncidents] = useState([
    { id: 'INC-8492', name: 'Database replica latency spike in us-east-1', severity: 'SEV-1', severityColor: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', status: 'Investigating', statusClass: 'bg-red-500/20 text-red-500 border border-red-500/30', assignee: 'J. Doe', assigneeInitials: 'JD', assigneeClass: 'bg-brand-strong text-on-brand', timeAgo: '12m ago', timestamp: '2024-01-15T14:32:00', isResolved: false, isUnassigned: false, assignedToMe: true, description: 'Database replica experiencing high latency spikes affecting read operations', tags: ['database','performance'] },
  ]);

  const [onCallTeam, setOnCallTeam] = useState([
    { id: 1, name: 'Alex Chen', role: 'Primary', roleColor: 'text-emerald-500', initials: 'AC', imageUrl: '', hasShield: true },
    { id: 2, name: 'Sarah Jenkins', role: 'Secondary', roleColor: 'text-muted', initials: 'SJ', imageUrl: '', hasShield: false },
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, title: '#INC-8480 Resolved', description: 'Primary responder J. Doe applied DNS hotfix to production. Recovery confirmed by automated health checks.', timestamp: '10:45 AM Today', status: 'resolved' },
  ]);

  // API base (swap to env var when ready)
  const API_BASE = '/api';

  const mapSeverityToClass = (sev) => {
    switch ((sev || '').toUpperCase()) {
      case 'SEV-1': return 'bg-red-500';
      case 'SEV-2': return 'bg-orange-500';
      case 'SEV-3': return 'bg-yellow-500';
      case 'SEV-4': return 'bg-blue-500';
      default: return 'bg-muted';
    }
  };

  const mapStatusToClass = (status) => {
    if (!status) return 'bg-surface-interactive text-secondary';
    const s = status.toLowerCase();
    if (s.includes('investigat') || s.includes('identif')) return 'bg-red-500/20 text-red-500 border border-red-500/30';
    if (s.includes('monitor')) return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
    if (s.includes('resolv')) return 'bg-green-500/20 text-green-400 border border-green-500/30';
    return 'bg-surface-interactive text-secondary';
  };

  const normalizeIncident = (inc) => ({
    id: inc.id,
    name: inc.name,
    severity: inc.severity || 'SEV-3',
    severityColor: inc.severityColor || mapSeverityToClass(inc.severity),
    status: inc.status || 'Unknown',
    statusClass: inc.statusClass || mapStatusToClass(inc.status),
    assignee: inc.assignee || 'Unassigned',
    assigneeInitials: inc.assigneeInitials || null,
    assigneeClass: inc.assigneeClass || '',
    timeAgo: inc.timeAgo || '',
    timestamp: inc.timestamp || null,
    isResolved: !!inc.isResolved,
    isUnassigned: !!inc.isUnassigned,
    assignedToMe: !!inc.assignedToMe,
    description: inc.description || '',
    tags: inc.tags || [],
  });

  const fetchData = useCallback(async () => {
    try {
      const [incRes, statsRes, oncallRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/incidents`).catch(() => null),
        fetch(`${API_BASE}/stats`).catch(() => null),
        fetch(`${API_BASE}/oncall`).catch(() => null),
        fetch(`${API_BASE}/activities`).catch(() => null),
      ]);

      if (incRes && incRes.ok) {
        const data = await incRes.json();
        setIncidents((data || []).map(normalizeIncident));
      }
      if (statsRes && statsRes.ok) setStatsCards(await statsRes.json());
      if (oncallRes && oncallRes.ok) setOnCallTeam(await oncallRes.json());
      if (activityRes && activityRes.ok) setRecentActivities(await activityRes.json());
    } catch (err) {
      // keep sample data on error
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter incidents based on active tab, search, severity, status
  const getFilteredIncidents = () => {
    let filtered = [...incidents];

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
      case 'all': return incidents.length;
      case 'assigned': return incidents.filter(i => i.assignedToMe).length;
      case 'unassigned': return incidents.filter(i => i.isUnassigned).length;
      case 'resolved': return incidents.filter(i => i.isResolved).length;
      case 'critical': return incidents.filter(i => i.severity === 'SEV-1').length;
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
    return status === 'resolved' ? 'border-semantic-success' : 'border-muted';
  };

  const getActivityInnerDot = (status) => {
    return status === 'resolved' ? 'bg-semantic-success' : 'bg-muted';
  };

  const InviteModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-elevated border border-border-primary rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-primary flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-primary">Invite Team Member</h3>
          <button onClick={() => setShowInviteModal(false)} className="text-subtle hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Email</label>
            <input type="email" className="mt-1 w-full bg-surface border border-border-primary rounded-lg p-2 text-[13px] text-primary" placeholder="colleague@company.com" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Role</label>
            <select className="select">
              <option>Incident Commander</option>
              <option>Communications Lead</option>
              <option>Technical Lead</option>
              <option>Observer</option>
            </select>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border-primary bg-surface-card flex justify-end gap-3">
          <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 border border-border-primary rounded-lg text-[13px] text-primary">Cancel</button>
          <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 bg-brand text-on-brand rounded-lg text-[13px] font-semibold">Send Invite</button>
        </div>
      </div>
    </div>
  );

  const FilterModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-primary rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-primary flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-primary">Filter Incidents</h3>
          <button onClick={() => setShowFilterModal(false)} className="text-subtle hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Severity</label>
            <select className="select">
              <option>All</option>
              <option>SEV-1 Critical</option>
              <option>SEV-2 High</option>
              <option>SEV-3 Medium</option>
              <option>SEV-4 Low</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Status</label>
            <select className="select">
              <option>All</option>
              <option>Investigating</option>
              <option>Identified</option>
              <option>Monitoring</option>
              <option>Resolved</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-subtle uppercase tracking-wider">Time Range</label>
            <select className="select">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>
        </div>
        <div className="px-5  py-4 border-t border-border-primary bg-surface-card flex justify-end gap-3">
          <button onClick={() => setShowFilterModal(false)} className="btn-outline">Reset</button>
          <button onClick={() => setShowFilterModal(false)} className="btn-primary">Apply Filters</button>
        </div>
      </div>
    </div>
  );

  // Mobile filter drawer
  const MobileFilterDrawer = () => (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-surface-elevated border-l border-border-primary shadow-xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary">Filters</h3>
          <button onClick={() => setMobileFiltersOpen(false)} className="text-subtle">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-subtle uppercase tracking-wider block mb-2">Severity</label>
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="select"
            >
              {severityFilterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-subtle uppercase tracking-wider block mb-2">Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select"
            >
              {statusFilterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-subtle uppercase tracking-wider block mb-2">Time Range</label>
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="select"
            >
              {timeRanges.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-subtle uppercase tracking-wider block mb-2">Sort By</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">Severity (High to Low)</option>
            </select>
          </div>
          <button 
            onClick={() => setMobileFiltersOpen(false)}
            className="w-full mt-4 bg-brand text-on-brand rounded-lg py-2.5 font-semibold"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="text-primary min-h-screen w-full antialiased bg-surface">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Page Header & Actions */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-border-primary">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-[22px] sm:text-[24px] leading-[30px] sm:leading-[32px] tracking-[-0.02em] font-semibold text-primary">
                Incidents
              </h1>
              <p className="text-[13px] sm:text-[14px] leading-[18px] sm:leading-[20px] font-medium text-muted mt-1">
                Manage and track active operational incidents.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 border border-border-primary rounded bg-transparent hover:bg-surface-elevated transition-colors text-[13px] font-medium text-primary"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button 
                onClick={() => setShowFilterModal(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-border-primary rounded bg-transparent hover:bg-surface-elevated transition-colors text-[13px] font-medium text-primary"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button 
                onClick={handleRefresh}
                className="btn-outline"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link
                to={'/home/create_incident'}
                className="btn-primary"
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
              <input
                type="text"
                placeholder="Search by title, ID, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9!"
              />
            </div>
          </div>

          {/* Sub-navigation Tabs - Horizontal scroll on mobile */}
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border-muted scrollbar-track-transparent">
            <div className="flex items-center gap-4 sm:gap-6 border-b border-border-primary min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 border-b-2 transition-colors text-[13px] sm:text-[14px] leading-[20px] font-medium flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-brand-strong text-brand-strong'
                      : 'border-transparent text-muted hover:text-secondary'
                  }`}
                >
                  {tab.label}
                  <span className="bg-surface-interactive text-secondary px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono leading-none">
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
              <div key={card.id} className="bg-surface-card border border-border-primary rounded-lg p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted text-[11px] sm:text-[12px] leading-[16px] font-medium uppercase tracking-wider">
                    {card.label}
                  </span>
                  <card.icon
                    className={`${card.iconColor || 'text-muted'} w-5 h-5`}
                    fill={card.iconFill ? 'currentColor' : 'none'}
                  />
                </div>
                <div className="text-[24px] sm:text-[28px] leading-tight font-bold text-primary">
                  {card.value}
                </div>
                {card.trend && (
                  <div className={`${card.trendColor || 'text-emerald-500'} text-[11px] sm:text-xs mt-2 flex items-center`}>
                    <card.trendIcon className="w-3 h-3 mr-1" />
                    {card.trend}
                  </div>
                )}
                {card.subtitle && (
                  <div className={`${card.subtitleColor || 'text-muted'} text-[11px] sm:text-xs mt-2`}>
                    {card.subtitle}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Table Controls - Responsive filters row */}
          <div className="bg-surface-card border border-border-primary rounded-lg overflow-hidden mb-6">
            <div className="p-3 sm:p-4 border-b border-border-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Severity Filter - hidden on mobile, shown in drawer */}
                <div className="hidden lg:block relative">
                  <select 
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="select"
                  >
                    {severityFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none w-4 h-4" />
                </div>

                {/* Status Filter - hidden on mobile */}
                <div className="hidden lg:block relative">
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="select"
                  >
                    {statusFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none w-4 h-4" />
                </div>

                {/* Time Range - visible on tablet+ */}
                <div className="hidden md:block relative">
                  <select 
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="select"
                  >
                    {timeRanges.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none w-4 h-4" />
                </div>

                {/* Sort on mobile - compact */}
                <div className="relative md:hidden">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-surface-elevated border border-border-primary text-xs text-secondary py-1.5 pl-3 pr-8 rounded focus:ring-1 focus:ring-brand-strong outline-none cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="severity">Severity</option>
                  </select>
                  <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none w-3.5 h-3.5" />
                </div>
              </div>

              {/* Sort Controls - desktop */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-xs text-muted font-medium mr-2">Sort by:</span>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="severity">Severity (High to Low)</option>
                  </select>
                  <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Responsive Table - Card layout on mobile, grid on desktop */}
            <div className="block lg:hidden">
              {paginatedIncidents.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-subtle mx-auto mb-3" />
                  <p className="text-tertiary">No incidents found</p>
                </div>
              ) : (
                paginatedIncidents.map((incident) => (
                  <div key={incident.id} className="border-b border-border-primary p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${incident.severityColor.split(' ')[0]}`}></div>
                        <span className="text-xs font-bold text-primary">{incident.severity}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${incident.statusClass}`}>
                          {incident.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-muted">{incident.timeAgo}</div>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-primary">{incident.name}</div>
                      <div className="text-[11px] font-mono text-muted mt-1">{incident.id}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {incident.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-surface-interactive rounded text-subtle">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {incident.isUnassigned ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-surface-interactive border border-border-muted flex items-center justify-center">
                              <UserPlus className="w-3 h-3 text-muted" />
                            </div>
                            <span className="text-[12px] text-muted italic">{incident.assignee}</span>
                          </>
                        ) : (
                          <>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${incident.assigneeClass}`}>
                              {incident.assigneeInitials}
                            </div>
                            <span className="text-[12px] text-secondary">{incident.assignee}</span>
                          </>
                        )}
                      </div>
                      <Link
                        to="/home/incident_details"
                        state={{ incidentId: incident.id }}
                        className="text-brand-strong hover:bg-brand-strong/10 p-1.5 rounded"
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
              <div className="grid grid-cols-[100px_80px_minmax(300px,1fr)_120px_150px_120px_80px] gap-4 px-4 py-3 border-b border-border-primary bg-surface-elevated/50">
                <div className="text-[12px] font-medium text-muted uppercase tracking-wider">Status</div>
                <div className="text-[12px] font-medium text-muted uppercase tracking-wider">Severity</div>
                <div className="text-[12px] font-medium text-muted uppercase tracking-wider">Title</div>
                <div className="text-[12px] font-medium text-muted uppercase tracking-wider">ID</div>
                <div className="text-[12px] font-medium text-muted uppercase tracking-wider">Assigned To</div>
                <div className="text-[12px] font-medium text-muted uppercase tracking-wider">Created</div>
                <div className="text-[12px] font-medium text-muted uppercase tracking-wider text-center">Actions</div>
              </div>
              <div className="flex flex-col">
                {paginatedIncidents.map((incident) => (
                  <div key={incident.id} className="group grid grid-cols-[100px_80px_minmax(300px,1fr)_120px_150px_120px_80px] gap-4 px-4 py-3 border-b border-white/5 items-center hover:bg-surface-elevated transition-colors">
                    <div><span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${incident.statusClass}`}>{incident.status}</span></div>
                    <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${incident.severityColor.split(' ')[0]}`}></div><span className="text-[13px] font-medium">{incident.severity}</span></div>
                    <div><div className="text-[14px] font-medium">{incident.name}</div><div className="flex gap-1 mt-1">{incident.tags.map(tag => <span key={tag} className="text-[9px] px-1 py-0.5 bg-surface-interactive rounded text-subtle">{tag}</span>)}</div></div>
                    <div className="text-[12px] font-mono text-muted">{incident.id}</div>
                    <div className="flex items-center gap-2">
                      {incident.isUnassigned ? <><div className="w-5 h-5 rounded-full bg-surface-interactive flex items-center justify-center"><UserPlus className="w-3 h-3 text-muted" /></div><span className="text-[13px] text-muted italic">{incident.assignee}</span></> : <><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${incident.assigneeClass}`}>{incident.assigneeInitials}</div><span className="text-[13px] text-secondary">{incident.assignee}</span></>}
                    </div>
                    <div className="text-[12px] font-mono text-muted">{incident.timeAgo}</div>
                    <div className="flex items-center justify-center gap-1"><Link to="/home/incident_details" state={{ incidentId: incident.id }} className="inline-flex items-center gap-1 px-2 py-1 rounded text-brand-strong hover:bg-brand-strong/10"><Eye className="w-3.5 h-3.5" /></Link><button className="text-muted hover:text-primary p-1"><MoreVertical className="w-4 h-4" /></button></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination - Responsive */}
            {filteredIncidents.length > 0 && (
              <div className="px-4 py-3 border-t border-border-primary flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-elevated/30 rounded-b-lg">
                <span className="text-[12px] sm:text-[13px] text-muted">
                  Showing {((activePage - 1) * itemsPerPage) + 1} - {Math.min(activePage * itemsPerPage, filteredIncidents.length)} of {filteredIncidents.length}
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded border border-border-primary text-muted hover:bg-surface-elevated disabled:opacity-50" disabled={activePage === 1} onClick={() => setActivePage(Math.max(1, activePage - 1))}><ChevronLeft className="w-4 h-4" /></button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = totalPages <= 5 ? i+1 : (activePage <= 3 ? i+1 : (activePage >= totalPages-2 ? totalPages-4+i : activePage-2+i));
                      return <button key={pageNum} onClick={() => setActivePage(pageNum)} className={`px-3 py-1 rounded text-[12px] transition-colors ${activePage === pageNum ? 'bg-brand text-on-brand' : 'text-muted hover:bg-surface-elevated'}`}>{pageNum}</button>;
                    })}
                  </div>
                  <button className="px-2 py-1 rounded border border-border-primary text-muted hover:bg-surface-elevated disabled:opacity-50" disabled={activePage === totalPages} onClick={() => setActivePage(Math.min(totalPages, activePage + 1))}><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>

          {/* Contextual Section */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-card border border-border-primary rounded-lg p-5 sm:p-6 overflow-x-auto">
              <h2 className="text-[18px] sm:text-[20px] leading-[26px] sm:leading-[28px] font-semibold text-primary mb-4 sm:mb-6 flex items-center">
                <History className="w-5 h-5 mr-2 text-brand-strong" />
                Recent Resolution Activity
              </h2>
              <div className="space-y-5 relative pl-4">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-surface-interactive"></div>
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="relative pl-8 flex items-start">
                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface-card border ${getActivityDotColor(activity.status)} flex items-center justify-center z-10`}><div className={`w-2 h-2 rounded-full ${getActivityInnerDot(activity.status)}`}></div></div>
                    <div><p className={`text-sm font-bold ${activity.status === 'resolved' ? 'text-primary' : 'text-muted'}`}>{activity.title}</p><p className="text-xs text-muted mt-1">{activity.description}</p><span className="text-[10px] text-subtle mt-2 block">{activity.timestamp}</span></div>
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