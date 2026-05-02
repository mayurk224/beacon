import React from 'react';
import {
  AlertTriangle,
  Timer,
  BarChart3,
  User,
  Clock,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const DashBoardHome = () => {
  // Top metrics data
  const topMetrics = [
    {
      id: 1,
      label: 'Active Incidents',
      value: '3',
      change: '+1 from yesterday',
      changeColor: 'text-danger-soft',
      icon: AlertTriangle,
      iconColor: 'text-danger-soft',
      iconFill: true,
      borderClass: '',
      bgClass: '',
      valueColor: 'text-danger-soft',
    },
    {
      id: 2,
      label: 'MTTR (Avg)',
      value: '42m',
      change: '12% improvement',
      changeColor: 'text-brand-strong',
      icon: Timer,
      iconColor: 'text-brand-strong',
      iconFill: false,
      borderClass: '',
      bgClass: '',
      valueColor: 'text-primary',
    },
    {
      id: 3,
      label: 'Total This Month',
      value: '28',
      change: 'Same as last month',
      changeColor: 'text-subtle',
      icon: BarChart3,
      iconColor: 'text-subtle',
      iconFill: false,
      borderClass: '',
      bgClass: '',
      valueColor: 'text-primary',
    },
    {
      id: 4,
      label: 'Critical (P1)',
      value: '1',
      change: 'Action required',
      changeColor: 'text-danger-soft',
      icon: AlertTriangle,
      iconColor: 'text-danger-soft pulse-glow',
      iconFill: true,
      borderClass: 'border-danger-border-strong',
      bgClass: 'bg-danger-bg-subtle',
      valueColor: 'text-danger-soft',
    },
  ];

  // Active incidents data
  const activeIncidents = [
    {
      id: 'INC-001',
      severity: 'P1',
      severityColor: 'text-danger-soft',
      severityBg: 'bg-danger-bg-subtle border-danger-border-strong',
      badgeText: 'Critical',
      badgeBg: 'bg-danger-bg-subtle text-danger-soft border-danger-border-strong',
      title: 'Database Latency in us-east-1',
      assignee: 'Sarah Connor',
      timeAgo: '14m ago',
    },
    {
      id: 'INC-002',
      severity: 'P2',
      severityColor: 'text-brand-strong',
      severityBg: 'bg-brand-muted border-brand/25',
      badgeText: 'Major',
      badgeBg: 'bg-brand-muted text-brand-strong border-brand/25',
      title: 'Payment Gateway Timeout',
      assignee: 'John Doe',
      timeAgo: '52m ago',
    },
    {
      id: 'INC-003',
      severity: 'P3',
      severityColor: 'text-subtle',
      severityBg: 'bg-surface-elevated border-border-primary',
      badgeText: 'Minor',
      badgeBg: 'bg-surface-elevated text-subtle border-border-primary',
      title: 'Internal Admin Slow Loading',
      assignee: 'Mike Ross',
      timeAgo: '2h ago',
    },
  ];

  // System health data
  const systemHealth = [
    { id: 1, name: 'Core API', status: 'operational', uptime: '99.98%' },
    { id: 2, name: 'User Auth', status: 'operational', uptime: '100.0%' },
    { id: 3, name: 'DB Cluster', status: 'degraded', uptime: 'Degraded' },
    { id: 4, name: 'Edge CDN', status: 'operational', uptime: '99.99%' },
    { id: 5, name: 'Billing Engine', status: 'operational', uptime: '99.95%' },
  ];

  // Resolved incidents data
  const resolvedIncidents = [
    {
      id: 'IF-4921',
      title: 'Elasticsearch Index Corruption',
      duration: '2h 15m',
      resolvedAt: 'Oct 24, 14:20',
      responder: 'Alex Rivera',
    },
    {
      id: 'IF-4920',
      title: 'Image Upload API failure',
      duration: '42m',
      resolvedAt: 'Oct 24, 09:12',
      responder: 'Sarah Connor',
    },
    {
      id: 'IF-4918',
      title: 'SSL Certificate Expiration',
      duration: '12m',
      resolvedAt: 'Oct 23, 23:45',
      responder: 'DevOps Bot',
    },
  ];

  // Helper function to render status indicator
  const getStatusIndicator = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-semantic-success';
      case 'degraded':
        return 'bg-semantic-warning';
      case 'down':
        return 'bg-danger-soft';
      default:
        return 'bg-subtle';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-semantic-success';
      case 'degraded':
        return 'text-semantic-warning';
      case 'down':
        return 'text-danger-soft';
      default:
        return 'text-subtle';
    }
  };

  return (
    <div className="text-primary h-full w-full">
      {/* Main Content Shell */}
      <main className="h-full w-full px-4 py-3">
        {/* Dashboard Canvas */}
        <div className="lg:pb-12 pb-6">
          {/* Welcome Header */}
          <div className="mb-6">
            <h2 className="text-[20px] sm:text-[24px] leading-[1.3] tracking-[-0.01em] font-semibold text-primary">
              System Dashboard
            </h2>
            <p className="text-[12px] sm:text-[13px] leading-normal text-secondary mt-1">
              Overview of platform health and incident response performance.
            </p>
          </div>

          {/* Top Metric Bento - Mapped */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
            {topMetrics.map((metric) => (
              <div
                key={metric.id}
                className={`bg-surface-widget border border-border-primary rounded-xl p-3 ${metric.borderClass} ${metric.bgClass}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-subtle text-[11px] leading-none tracking-[0.01em] font-medium uppercase">
                    {metric.label}
                  </span>
                  <metric.icon
                    className={`${metric.iconColor} w-4 h-4`}
                    fill={metric.iconFill ? 'currentColor' : 'none'}
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-[24px] sm:text-[28px] leading-[1.2] tracking-[-0.02em] font-bold ${metric.valueColor}`}
                  >
                    {metric.value}
                  </span>
                  <span className={`text-xs ${metric.changeColor}`}>{metric.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Section: Active List & Health */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Active Incidents List - Mapped */}
            <div className="sm:col-span-2 bg-surface-widget border border-border-primary rounded-xl overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-border-primary flex justify-between items-center">
                <h3 className="text-[16px] sm:text-[18px] leading-[1.4] font-semibold text-primary">
                  Active Incidents
                </h3>
                <a
                  className="text-brand text-[12px] leading-none tracking-[0.01em] font-medium hover:underline"
                  href="#"
                >
                  View All
                </a>
              </div>
              <div className="divide-y divide-border-primary">
                {activeIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 hover:bg-surface-elevated transition-colors flex items-center gap-4"
                  >
                    <div
                      className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${incident.severityBg}`}
                    >
                      <span className={`font-bold ${incident.severityColor}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-primary font-medium truncate">{incident.title}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${incident.badgeBg}`}
                        >
                          {incident.badgeText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-subtle">
                        <span className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3 shrink-0" /> <span className="truncate">{incident.assignee}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" /> {incident.timeAgo}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-surface-inset rounded-lg text-subtle">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status Overview - Mapped */}
            <div className="bg-surface-widget border border-border-primary rounded-xl p-3 sm:p-4">
              <h3 className="text-[16px] sm:text-[18px] leading-[1.4] font-semibold text-primary mb-4">
                System Health
              </h3>
              <div className="space-y-4">
                {systemHealth.map((service) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusIndicator(service.status)}`}
                      ></span>
                      <span className="text-sm font-medium text-primary">{service.name}</span>
                    </div>
                    <span className={`text-xs ${getStatusTextColor(service.status)}`}>
                      {service.uptime}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border-primary">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-subtle uppercase font-medium">
                    On-Call Rotating
                  </span>
                  <span className="text-[10px] text-semantic-warning px-2 py-0.5 bg-semantic-warning/10 border border-semantic-warning/20 rounded-full font-bold">
                    L1 Support
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    alt="Portrait of a smiling professional in a dark shirt with cinematic lighting"
                    className="w-10 h-10 rounded-full border border-border-primary"
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
                  />
                  <div>
                    <p className="text-sm font-medium text-primary">Sarah Connor</p>
                    <p className="text-xs text-subtle">Shift ends in 4h 12m</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Resolved Incidents Table - Mapped */}
          <div className="bg-surface-widget border border-border-primary rounded-xl overflow-hidden w-full">
            <div className="p-3 sm:p-4 border-b border-border-primary">
              <h3 className="text-[16px] sm:text-[18px] leading-[1.4] font-semibold text-primary">
                Resolved Incidents
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-150">
                <thead className="bg-surface-elevated text-subtle text-xs uppercase tracking-wider font-medium">
                  <tr>
                    <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">Incident ID</th>
                    <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">Title</th>
                    <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">Duration</th>
                    <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">Resolved At</th>
                    <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">Responder</th>
                    <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary text-sm text-secondary">
                  {resolvedIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="hover:bg-surface-elevated transition-colors"
                    >
                      <td className="px-3 py-3 sm:px-4 sm:py-4 font-mono text-xs">{incident.id}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 font-medium text-primary">{incident.title}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4">{incident.duration}</td>
                      <td className="px-4 py-4 text-subtle">{incident.resolvedAt}</td>
                      <td className="px-4 py-4">{incident.responder}</td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1.5 text-semantic-success text-xs">
                          <CheckCircle2 className="w-4 h-4" fill="currentColor" />
                          Resolved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Global Health Indicator */}
      <div className="fixed lg:bottom-4 right-4 sm:bottom-8 sm:right-8 flex items-center gap-2 sm:gap-3 bg-surface-elevated border border-border-primary rounded-full pl-2 pr-3 sm:pr-4 py-1.5 sm:py-2 shadow-2xl z-50 bottom-14 md:bottom-16">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-semantic-success/10 flex items-center justify-center">
          <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-semantic-success pulse-glow block"></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] sm:text-[10px] text-subtle leading-none uppercase font-bold">
            Global Status
          </span>
          <span className="text-[10px] sm:text-xs text-primary font-medium">99.98% Healthy</span>
        </div>
      </div>
    </div>
  );
};

export default DashBoardHome;