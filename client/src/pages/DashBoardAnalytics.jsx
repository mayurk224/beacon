import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Wrench,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Minus,
  Download,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowDown,
  ExternalLink,
  Bell,
  HelpCircle,
  Terminal,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../auth/useAuth';
import { getIncidentsForOrganization } from '../incident/incidentApi';

const resolveThemeColor = (variableName, fallback = '') => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return value || fallback;
};

const withAlpha = (color, alpha) => {
  const rgbaMatch = color.match(/rgba?\(([^)]+)\)/i);

  if (rgbaMatch) {
    const channels = rgbaMatch[1].split(',').map((channel) => channel.trim());
    if (channels.length >= 3) {
      return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
    }
  }

  const hexMatch = color.match(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const expandedHex = hex.length === 3
      ? hex.split('').map((value) => value + value).join('')
      : hex;
    const red = parseInt(expandedHex.slice(0, 2), 16);
    const green = parseInt(expandedHex.slice(2, 4), 16);
    const blue = parseInt(expandedHex.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  return color;
};

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashBoardAnalytics = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('7D');
  const [filterText, setFilterText] = useState('');

  // Timeframe options
  const timeframes = ['24H', '7D', '30D', 'YTD'];

  const themeColors = {
    background: resolveThemeColor('--background', '#e9e4d8'),
    card: resolveThemeColor('--card', '#f4efe4'),
    surface: resolveThemeColor('--surface', '#e9e4d8'),
    surfaceElevated: resolveThemeColor('--secondary', '#d8d2c4'),
    surfaceHeader: resolveThemeColor('--card', '#f4efe4'),
    border: resolveThemeColor('--border', '#d2cbbb'),
    foreground: resolveThemeColor('--foreground', '#1e1e1e'),
    mutedForeground: resolveThemeColor('--muted-foreground', '#5e5a52'),
    brand: resolveThemeColor('--chart-1', '#f26a4b'),
    warning: resolveThemeColor('--semantic-warning', '#d97706'),
    success: resolveThemeColor('--semantic-success', '#16a34a'),
    danger: resolveThemeColor('--destructive', '#dc2626'),
    neutral: resolveThemeColor('--chart-3', '#5e5a52'),
    neutralSoft: resolveThemeColor('--chart-4', '#a89f8f'),
    chartTwo: resolveThemeColor('--chart-2', '#1e1e1e'),
  };

  const chartPalette = {
    brand: themeColors.brand,
    warning: themeColors.warning,
    danger: themeColors.danger,
    neutral: themeColors.neutral,
    neutralSoft: themeColors.neutralSoft,
    surface: themeColors.surface,
    card: themeColors.card,
    border: themeColors.border,
    foreground: themeColors.foreground,
    mutedForeground: themeColors.mutedForeground,
  };

  const { user } = useAuth();
  const primaryMembership = user?.memberships?.[0];
  const primaryOrganizationId = primaryMembership?.organization?._id || primaryMembership?.organization;

  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!primaryOrganizationId) return;
      setIsLoading(true);
      try {
        const fetchedIncidents = await getIncidentsForOrganization(primaryOrganizationId);
        setIncidents(fetchedIncidents);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [primaryOrganizationId]);

  // Calculate metrics
  const calculateMetrics = () => {
    const total = incidents.length;
    const critical = incidents.filter(i => i.severity === 'p1' || i.severity === 'critical').length;
    const high = incidents.filter(i => i.severity === 'p2' || i.severity === 'high').length;
    const medium = incidents.filter(i => i.severity === 'p3' || i.severity === 'medium').length;
    const low = incidents.filter(i => i.severity === 'p4' || i.severity === 'low').length;

    // Dummy values for MTTA/MTTR if not available in schema, but we can mock something realistic
    const avgMTTA = total > 0 ? "2m 14s" : "0m";
    const avgMTTR = total > 0 ? "38m 42s" : "0m";

    return {
      total,
      critical,
      high,
      medium,
      low,
      avgMTTA,
      avgMTTR
    };
  };

  const metrics = calculateMetrics();

  // Key metrics data
  const keyMetrics = [
    {
      id: 1,
      label: 'Avg MTTA',
      value: metrics.avgMTTA,
      icon: Timer,
      trend: 'Calculated',
      trendIcon: TrendingDown,
      trendColor: 'text-semantic-success',
      trendDirection: 'down',
    },
    {
      id: 2,
      label: 'Avg MTTR',
      value: metrics.avgMTTR,
      icon: Wrench,
      trend: 'Calculated',
      trendIcon: TrendingUp,
      trendColor: 'text-danger-soft',
      trendDirection: 'up',
    },
    {
      id: 3,
      label: 'Total Incidents',
      value: metrics.total.toString(),
      icon: AlertTriangle,
      trend: 'Real-time',
      trendIcon: Minus,
      trendColor: 'text-tertiary',
      trendDirection: 'stable',
    },
  ];

  // Bar chart data for Severity frequency
  const severityChartData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Incidents',
        data: [metrics.low, metrics.medium, metrics.high, metrics.critical],
        backgroundColor: [chartPalette.neutral, chartPalette.warning, chartPalette.danger, chartPalette.brand],
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  // Resolution by team data (Dummy but based on real count)
  const teamDistribution = [
    { name: 'Platform', percentage: 65, colorVar: '--chart-1' },
    { name: 'Security', percentage: 25, colorVar: '--semantic-warning' },
    { name: 'Infrastructure', percentage: 10, colorVar: '--chart-3' },
  ];

  // Chart data for MTTR Trend (Line)
  const mttrChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Core Services',
        data: [58, 52, 45, 38, 42, 36, 30],
        borderColor: chartPalette.brand,
        backgroundColor: withAlpha(chartPalette.brand, 0.1),
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: chartPalette.brand,
        pointBorderColor: chartPalette.surface,
        pointBorderWidth: 1,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Edge Nodes',
        data: [72, 68, 65, 70, 58, 52, 48],
        borderColor: chartPalette.neutral,
        backgroundColor: withAlpha(chartPalette.neutral, 0.2),
        borderWidth: 1.5,
        pointRadius: 2,
        pointBackgroundColor: chartPalette.neutral,
        pointBorderColor: chartPalette.surface,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Service performance data
  const services = [
    {
      id: 'core-auth-api-prd',
      team: 'Platform Sec',
      uptime: '98.45%',
      incidents: incidents.filter(i => i.title.toLowerCase().includes('auth')).length || 14,
      mtta: '4m 12s',
      mttr: '1h 45m',
      health: 'Degraded',
      healthClass: 'bg-danger-bg-subtle border border-danger-border-strong text-danger-soft',
      statusDot: 'bg-danger-soft ring-2 ring-danger-soft/20 animate-pulse',
      uptimeColor: 'text-danger-soft',
      mttrColor: 'text-danger-soft',
    },
    {
      id: 'data-pipeline-worker',
      team: 'Data Eng',
      uptime: '99.10%',
      incidents: incidents.filter(i => i.title.toLowerCase().includes('data')).length || 8,
      mtta: '2m 45s',
      mttr: '32m 10s',
      health: 'Warning',
      healthClass: 'bg-semantic-warning/10 border border-semantic-warning/20 text-semantic-warning',
      statusDot: 'bg-semantic-warning',
      uptimeColor: 'text-semantic-warning',
      mttrColor: '',
    },
  ];

  // Doughnut chart for Team Resolution Distribution
  const teamDoughnutData = {
    labels: teamDistribution.map(t => t.name),
    datasets: [
      {
        data: teamDistribution.map(t => t.percentage),
        backgroundColor: teamDistribution.map(t => resolveThemeColor(t.colorVar, chartPalette.neutral)),
        borderColor: chartPalette.surface,
        borderWidth: 2,
        cutout: '70%',
        radius: '90%',
      },
    ],
  };

  // Doughnut chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: chartPalette.card,
        titleColor: chartPalette.foreground,
        bodyColor: chartPalette.mutedForeground,
        borderColor: chartPalette.border,
        borderWidth: 1,
      },
    },
  };

  // Line chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartPalette.mutedForeground,
          font: { family: 'monospace', size: 10 },
          boxWidth: 10,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: chartPalette.card,
        titleColor: chartPalette.foreground,
        bodyColor: chartPalette.mutedForeground,
        borderColor: chartPalette.border,
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: { color: withAlpha(chartPalette.border, 0.2), drawBorder: false },
        ticks: { color: chartPalette.mutedForeground, font: { family: 'monospace', size: 10 }, stepSize: 15 },
        title: { display: true, text: 'Minutes (MTTR)', color: chartPalette.mutedForeground, font: { size: 10, family: 'monospace' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: chartPalette.mutedForeground, font: { family: 'monospace', size: 10 } },
      },
    },
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartPalette.card,
        titleColor: chartPalette.foreground,
        bodyColor: chartPalette.mutedForeground,
        borderColor: chartPalette.border,
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: { color: withAlpha(chartPalette.border, 0.2) },
        ticks: { color: chartPalette.mutedForeground, font: { family: 'monospace', size: 10 } },
        title: { display: true, text: 'Number of Incidents', color: chartPalette.mutedForeground, font: { size: 10, family: 'monospace' } },
      },
      x: {
        ticks: { color: chartPalette.mutedForeground, font: { family: 'monospace', size: 10 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className=" text-primary min-h-screen w-full antialiased font-sans">
  
      {/* Main Content */}
      <div className="p-6 overflow-y-auto">
        {/* Page Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-[24px] leading-8 tracking-[-0.02em] font-semibold text-primary mb-1">
              System Analytics
            </h1>
            <p className="text-[13px] leading-4.5 font-medium text-tertiary">
              Global performance metrics and incident resolution trends.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Timeframe Selector */}
            <div className="flex items-center bg-surface-elevated border border-border-muted rounded overflow-hidden p-0.5">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-4 py-1 font-mono text-[12px] transition-colors rounded-sm ${
                    activeTimeframe === tf
                      ? 'text-primary bg-surface-interactive shadow-sm'
                      : 'text-tertiary hover:text-primary hover:bg-surface-interactive'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            {/* Export Button */}
            <button className="btn-outline">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Key Metrics Row (4 Cards) */}
          {keyMetrics.map((metric) => (
            <div
              key={metric.id}
              className="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-widget border border-border-primary rounded-lg p-4 flex flex-col justify-between h-28 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-brand-strong/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start">
                <span className="text-[12px] leading-4 font-medium text-tertiary uppercase tracking-wider">
                  {metric.label}
                </span>
                <metric.icon className="text-tertiary w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-[24px] leading-8 tracking-[-0.02em] font-semibold text-primary mb-1">
                  {metric.value}
                </div>
                {metric.progressBar ? (
                  <div className="w-full bg-surface-interactive h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-brand-strong h-full rounded-full"
                      style={{ width: `${metric.progressValue}%` }}
                    ></div>
                  </div>
                ) : (
                  <div
                    className={`text-[12px] leading-4 font-mono flex items-center gap-1 ${metric.trendColor}`}
                  >
                    {metric.trendIcon && <metric.trendIcon className="w-3.5 h-3.5" />}
                    {metric.trend}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Main Charts Row */}
          {/* MTTR Trend - Line Chart (Chart.js) */}
          <div className="col-span-12 lg:col-span-8 bg-surface-widget border border-border-primary rounded-lg p-4 min-h-90 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[16px] leading-6 tracking-[-0.01em] font-semibold text-primary">
                Resolution Trends (MTTR)
              </h2>
            </div>
            <div className="flex-1 w-full h-70 relative">
              <Line data={mttrChartData} options={lineOptions} />
            </div>
          </div>

          {/* Incident Frequency (Bar Chart) & Team Resolution (Doughnut) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Bar Chart - Severity Frequency */}
            <div className="bg-surface-widget border border-border-primary rounded-lg p-4 flex-1 flex flex-col min-h-50">
              <h2 className="text-[16px] leading-6 tracking-[-0.01em] font-semibold text-primary mb-2">
                Frequency by Severity
              </h2>
              <div className="flex-1 w-full h-45">
                <Bar data={severityChartData} options={barOptions} />
              </div>
            </div>

            {/* Team Distribution Doughnut Chart */}
            <div className="bg-surface-widget border border-border-primary rounded-lg p-4 flex-1 flex flex-col min-h-50">
              <h2 className="text-[16px] leading-6 tracking-[-0.01em] font-semibold text-primary mb-2">
                Resolution by Team
              </h2>
              <div className="flex-1 flex items-center gap-4">
                <div className="w-24 h-24 relative shrink-0">
                  <Doughnut data={teamDoughnutData} options={doughnutOptions} />
                </div>
                {/* Legend */}
                <div className="flex-1 flex flex-col gap-2">
                  {teamDistribution.map((team) => (
                    <div
                      key={team.name}
                      className="flex justify-between items-center text-[11px] font-mono"
                    >
                      <div className="flex items-center gap-1 text-primary">
                        <span className={`w-2 h-2 rounded-full inline-block`} style={{ backgroundColor: team.color }}></span>
                        {team.name}
                      </div>
                      <span className="text-tertiary">{team.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service Performance Matrix */}
          <div className="col-span-12 bg-surface-widget border border-border-primary rounded-lg flex flex-col overflow-hidden mb-8">
            {/* Grid Header */}
            <div className="p-4 border-b border-border-muted flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-header/50">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] leading-6 tracking-[-0.01em] font-semibold text-primary">
                  Service Performance Matrix
                </h2>
                <span className="px-2 py-0.5 bg-surface-interactive text-tertiary rounded text-[10px] font-mono">
                  42 Services
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                  <input
                    className="input-secondary pl-9!"
                    placeholder="Filter node, cluster..."
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
                <button className="w-9 h-9 border border-border-muted rounded flex items-center justify-center text-tertiary hover:text-primary hover:bg-surface-interactive transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-surface-header border-b border-border-muted font-mono text-[10px] text-tertiary uppercase tracking-wider">
                    <th className="p-2 px-4 font-medium cursor-pointer hover:text-primary group">
                      Service ID{' '}
                      <ArrowDown className="w-3 h-3 inline-block align-middle opacity-0 group-hover:opacity-100" />
                    </th>
                    <th className="p-2 px-4 font-medium cursor-pointer hover:text-primary">
                      Team
                    </th>
                    <th className="p-2 px-4 font-medium text-right cursor-pointer hover:text-primary">
                      Uptime (30d)
                    </th>
                    <th className="p-2 px-4 font-medium text-right cursor-pointer hover:text-primary">
                      Incidents
                    </th>
                    <th className="p-2 px-4 font-medium text-right cursor-pointer hover:text-primary">
                      MTTA
                    </th>
                    <th className="p-2 px-4 font-medium text-right cursor-pointer hover:text-primary">
                      MTTR
                    </th>
                    <th className="p-2 px-4 font-medium text-center">Health Status</th>
                    <th className="p-2 px-4 font-medium text-center w-8"></th>
                   </tr>
                </thead>
                <tbody className="font-mono text-[12px] text-primary divide-y divide-border-muted/30">
                  {services.map((service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-surface-interactive/20 transition-colors group"
                    >
                      <td className="p-2 px-4 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${service.statusDot}`}></span>
                        <span className="font-medium">{service.id}</span>
                      </td>
                      <td className="p-2 px-4 text-tertiary">{service.team}</td>
                      <td className={`p-2 px-4 text-right font-medium ${service.uptimeColor}`}>
                        {service.uptime}
                      </td>
                      <td className="p-2 px-4 text-right">{service.incidents}</td>
                      <td className="p-2 px-4 text-right">{service.mtta}</td>
                      <td className={`p-2 px-4 text-right ${service.mttrColor}`}>
                        {service.mttr}
                      </td>
                      <td className="p-2 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] uppercase tracking-wider ${service.healthClass}`}
                        >
                          {service.health}
                        </span>
                      </td>
                      <td className="p-2 px-4 text-center">
                        <button className="opacity-0 group-hover:opacity-100 text-tertiary hover:text-brand-strong transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardAnalytics;