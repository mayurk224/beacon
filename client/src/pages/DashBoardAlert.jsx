import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bell,
  HelpCircle,
  CheckCheck,
  BellOff,
  Plus,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Circle,
  Filter,
  AlertCircle,
  Eye,
} from 'lucide-react';

const DashBoardAlert = () => {
  const [expandedGroups, setExpandedGroups] = useState({
    apiGateway: true,
    database: false,
    dataPipeline: true,
  });

  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, critical, warning

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const toggleSelectAll = (groupId, isChecked) => {
    const group = alertGroups.find(g => g.id === groupId);
    if (isChecked) {
      const alertIds = group.alerts.map(alert => `${groupId}-${alert.id}`);
      setSelectedAlerts(prev => [...new Set([...prev, ...alertIds])]);
    } else {
      setSelectedAlerts(prev => prev.filter(id => !id.startsWith(`${groupId}-`)));
    }
  };

  const toggleSelectAlert = (groupId, alertId) => {
    const key = `${groupId}-${alertId}`;
    if (selectedAlerts.includes(key)) {
      setSelectedAlerts(prev => prev.filter(id => id !== key));
    } else {
      setSelectedAlerts(prev => [...prev, key]);
    }
  };

  const isAllSelected = (groupId) => {
    const group = alertGroups.find(g => g.id === groupId);
    if (!group || group.alerts.length === 0) return false;
    const allAlertKeys = group.alerts.map(alert => `${groupId}-${alert.id}`);
    return allAlertKeys.every(key => selectedAlerts.includes(key));
  };

  const isSomeSelected = (groupId) => {
    const group = alertGroups.find(g => g.id === groupId);
    if (!group || group.alerts.length === 0) return false;
    const allAlertKeys = group.alerts.map(alert => `${groupId}-${alert.id}`);
    const selectedCount = allAlertKeys.filter(key => selectedAlerts.includes(key)).length;
    return selectedCount > 0 && selectedCount < allAlertKeys.length;
  };

  // Alert groups data with more realistic content
  const alertGroups = [
    {
      id: 'apiGateway',
      name: 'Service: API Gateway',
      statusColor: 'bg-red-500',
      criticalCount: 3,
      warningCount: 1,
      alerts: [
        {
          id: 1,
          source: 'us-east-1a/alb-01',
          name: 'High 5xx Error Rate',
          status: 'CRITICAL',
          statusClass: 'bg-red-950/20 text-red-500 border border-red-500/20',
          statusDot: 'bg-red-500',
          count: '1,204',
          lastSeen: '2m ago',
          description: 'Error rate exceeded 5% threshold',
        },
        {
          id: 2,
          source: 'us-west-2c/alb-02',
          name: 'Latency Threshold Exceeded (P99 > 500ms)',
          status: 'CRITICAL',
          statusClass: 'bg-red-950/10 text-danger-soft border border-danger-soft/20',
          statusDot: 'bg-danger-soft',
          count: '45',
          lastSeen: '5m ago',
          description: 'P99 latency spiked to 850ms',
        },
        {
          id: 3,
          source: 'eu-west-1/alb-03',
          name: 'Connection Pool Exhaustion',
          status: 'WARNING',
          statusClass: 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20',
          statusDot: 'bg-semantic-warning',
          count: '12',
          lastSeen: '12m ago',
          description: '85% of connections in use',
        },
      ],
    },
    {
      id: 'database',
      name: 'Service: Primary DB Cluster',
      statusColor: 'bg-danger-soft',
      criticalCount: 0,
      warningCount: 2,
      alerts: [
        {
          id: 4,
          source: 'postgresql-primary-01',
          name: 'Replication Lag Increasing',
          status: 'WARNING',
          statusClass: 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20',
          statusDot: 'bg-semantic-warning',
          count: '8',
          lastSeen: '8m ago',
          description: 'Replication lag: 15 seconds',
        },
        {
          id: 5,
          source: 'postgresql-replica-02',
          name: 'Connection Saturation',
          status: 'WARNING',
          statusClass: 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20',
          statusDot: 'bg-semantic-warning',
          count: '3',
          lastSeen: '15m ago',
          description: '90% of max connections',
        },
      ],
    },
    {
      id: 'dataPipeline',
      name: 'Service: Data Pipeline',
      statusColor: 'bg-red-500',
      criticalCount: 2,
      warningCount: 1,
      alerts: [
        {
          id: 6,
          source: 'kafka-stream-processor',
          name: 'Consumer Lag Critical',
          status: 'CRITICAL',
          statusClass: 'bg-red-950/20 text-red-500 border border-red-500/20',
          statusDot: 'bg-red-500',
          count: '50K',
          lastSeen: '1m ago',
          description: 'Consumer lag: 50,000 messages',
        },
        {
          id: 7,
          source: 'spark-job-executor',
          name: 'Task Failure Rate High',
          status: 'CRITICAL',
          statusClass: 'bg-red-950/10 text-danger-soft border border-danger-soft/20',
          statusDot: 'bg-danger-soft',
          count: '23',
          lastSeen: '3m ago',
          description: '15% task failure rate',
        },
        {
          id: 8,
          source: 's3-ingestion-bucket',
          name: 'Processing Delay',
          status: 'WARNING',
          statusClass: 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20',
          statusDot: 'bg-semantic-warning',
          count: '2',
          lastSeen: '20m ago',
          description: 'Files pending: 127',
        },
      ],
    },
  ];

  const getFilteredAlerts = (alerts) => {
    if (filterStatus === 'all') return alerts;
    if (filterStatus === 'critical') return alerts.filter(a => a.status === 'CRITICAL');
    if (filterStatus === 'warning') return alerts.filter(a => a.status === 'WARNING');
    return alerts;
  };

  const totalCritical = alertGroups.reduce((sum, g) => sum + g.criticalCount, 0);
  const totalWarning = alertGroups.reduce((sum, g) => sum + g.warningCount, 0);
  const selectedCount = selectedAlerts.length;

  return (
    <div className=" text-primary min-h-screen w-full antialiased">
      {/* Main Content */}
      <div className="p-4 md:p-6 flex flex-col gap-6">
        {/* Page Header & Toolbar - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-700/30 pb-4">
          <div>
            <h1 className="text-[22px] md:text-[24px] leading-[30px] md:leading-[32px] tracking-[-0.02em] font-semibold text-primary mb-1">
              Active Alerts
            </h1>
            <p className="text-tertiary text-[12px] md:text-[13px] leading-[18px] font-medium">
              Showing unacknowledged alerts grouped by service.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-surface-elevated border border-border-muted rounded overflow-hidden">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-surface-interactive text-primary'
                    : 'text-tertiary hover:text-primary'
                }`}
              >
                All ({totalCritical + totalWarning})
              </button>
              <button
                onClick={() => setFilterStatus('critical')}
                className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  filterStatus === 'critical'
                    ? 'bg-surface-interactive text-red-500'
                    : 'text-tertiary hover:text-red-400'
                }`}
              >
                Critical ({totalCritical})
              </button>
              <button
                onClick={() => setFilterStatus('warning')}
                className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  filterStatus === 'warning'
                    ? 'bg-surface-interactive text-semantic-warning'
                    : 'text-tertiary hover:text-semantic-warning'
                }`}
              >
                Warning ({totalWarning})
              </button>
            </div>
            
            {selectedCount > 0 && (
              <span className="text-[11px] font-mono text-tertiary bg-surface-interactive px-2 py-1 rounded">
                {selectedCount} selected
              </span>
            )}
            
            <button className="btn-outline">
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Acknowledge All</span>
            </button>
            <button className="btn-outline">
              <BellOff className="w-4 h-4" />
              <span className="hidden sm:inline">Mute Selected</span>
            </button>
            <button className="btn-primary">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Incident</span>
            </button>
          </div>
        </div>

        {/* Alert Groups - Responsive */}
        {alertGroups.map((group) => {
          const filteredAlerts = getFilteredAlerts(group.alerts);
          const isExpanded = expandedGroups[group.id];
          const groupAllSelected = isAllSelected(group.id);
          const groupSomeSelected = isSomeSelected(group.id);

          return (
            <div
              key={group.id}
              className="bg-surface-header rounded-sm border border-border-primary flex flex-col overflow-hidden"
            >
              {/* Group Header */}
              <div
                onClick={() => toggleGroup(group.id)}
                className="px-3 md:px-4 py-3 bg-surface-card border-b border-border-primary flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-surface-elevated transition-colors"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-[18px] h-[18px] text-tertiary flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-[18px] h-[18px] text-tertiary flex-shrink-0" />
                  )}
                  <div className="flex items-center gap-2">
                    <Circle
                      className={`w-2 h-2 ${group.statusColor} flex-shrink-0`}
                      fill="currentColor"
                    />
                    <h2 className="text-[14px] md:text-[16px] leading-[20px] md:leading-[24px] tracking-[-0.01em] font-semibold text-primary">
                      {group.name}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 text-tertiary text-[11px] md:text-[12px] leading-[16px] font-mono">
                  {group.criticalCount > 0 && (
                    <>
                      <span className="text-red-500">{group.criticalCount} Critical</span>
                      <span className="text-subtle hidden sm:inline">•</span>
                    </>
                  )}
                  <span className="text-semantic-warning">{group.warningCount} Warning</span>
                  <span className="text-subtle hidden md:inline">•</span>
                  <span className="hidden md:inline">{group.alerts.length} Total</span>
                </div>
              </div>

              {/* Table Content */}
              {isExpanded && filteredAlerts.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead>
                      <tr className="border-b border-border-primary bg-surface-header text-[11px] md:text-[12px] leading-[16px] font-medium text-tertiary uppercase tracking-wider">
                        <th className="px-3 md:px-4 py-2 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={groupAllSelected}
                            ref={el => {
                              if (el) el.indeterminate = groupSomeSelected;
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectAll(group.id, e.target.checked);
                            }}
                            className="rounded-sm bg-surface-interactive border-border-muted text-brand-strong focus:ring-brand-strong focus:ring-offset-surface-header"
                          />
                        </th>
                        <th className="px-3 md:px-4 py-2 font-medium">Source</th>
                        <th className="px-3 md:px-4 py-2 font-medium">Alert Name</th>
                        <th className="px-3 md:px-4 py-2 font-medium">Status</th>
                        <th className="px-3 md:px-4 py-2 font-medium text-right">Count</th>
                        <th className="px-3 md:px-4 py-2 font-medium text-right">Last Seen</th>
                        <th className="px-3 md:px-4 py-2 font-medium text-center">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-[12px] md:text-[13px] leading-[18px] font-medium divide-y divide-border-primary">
                      {filteredAlerts.map((alert) => (
                        <tr
                          key={alert.id}
                          className="hover:bg-surface-elevated transition-colors group"
                        >
                          <td className="px-3 md:px-4 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedAlerts.includes(`${group.id}-${alert.id}`)}
                              onChange={() => toggleSelectAlert(group.id, alert.id)}
                              className="rounded-sm bg-surface-interactive border-border-muted text-brand-strong focus:ring-brand-strong focus:ring-offset-surface-header"
                            />
                           </td>
                          <td className="px-3 md:px-4 py-2.5 font-mono text-[11px] md:text-[12px] leading-[16px] text-tertiary break-all md:break-normal">
                            {alert.source}
                           </td>
                          <td className="px-3 md:px-4 py-2.5">
                            <div>
                              <div className="text-primary font-medium text-[12px] md:text-[13px]">
                                {alert.name}
                              </div>
                              <div className="text-subtle text-[10px] md:text-[11px] font-mono mt-0.5 hidden lg:block">
                                {alert.description}
                              </div>
                            </div>
                           </td>
                          <td className="px-3 md:px-4 py-2.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm font-mono text-[10px] md:text-[11px] border whitespace-nowrap ${alert.statusClass}`}
                            >
                              <Circle
                                className={`w-1.5 h-1.5 ${alert.statusDot}`}
                                fill="currentColor"
                              />
                              {alert.status}
                            </span>
                           </td>
                          <td className="px-3 md:px-4 py-2.5 text-right font-mono text-[11px] md:text-[12px] leading-[16px] text-primary">
                            {alert.count}
                           </td>
                          <td className="px-3 md:px-4 py-2.5 text-right font-mono text-[11px] md:text-[12px] leading-[16px] text-tertiary whitespace-nowrap">
                            {alert.lastSeen}
                           </td>
                          <td className="px-3 md:px-4 py-2.5 text-center">
                            <Link
                              to="/home/alert_details"
                              state={{ alertId: alert.id, groupId: group.id }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium text-brand-soft hover:bg-brand-soft/10 transition-all duration-200 group/link"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">View</span>
                            </Link>
                            <button className="ml-1 text-tertiary hover:text-primary p-1">
                              <MoreVertical className="w-[16px] md:w-[18px] h-[16px] md:h-[18px]" />
                            </button>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Empty state */}
              {isExpanded && filteredAlerts.length === 0 && (
                <div className="px-4 py-8 md:py-12 text-center">
                  <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-border-muted mx-auto mb-2" />
                  <p className="text-tertiary text-[12px] md:text-[13px] leading-[18px]">
                    No {filterStatus !== 'all' ? filterStatus : ''} alerts in this group
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* No alerts message */}
        {alertGroups.every(g => getFilteredAlerts(g.alerts).length === 0) && (
          <div className="text-center py-12 md:py-16">
            <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-border-muted" />
            </div>
            <h3 className="text-primary text-[18px] font-semibold mb-2">No active alerts</h3>
            <p className="text-tertiary text-[13px]">
              All systems are operating normally
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoardAlert;