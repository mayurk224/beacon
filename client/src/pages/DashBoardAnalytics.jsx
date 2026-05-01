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

  // Key metrics data
  const keyMetrics = [
    {
      id: 1,
      label: 'Avg MTTA',
      value: '3m 14s',
      icon: Timer,
      trend: '12.4% vs last period',
      trendIcon: TrendingDown,
      trendColor: 'text-[#10b981]',
      trendDirection: 'down',
    },
    {
      id: 2,
      label: 'Avg MTTR',
      value: '42m 08s',
      icon: Wrench,
      trend: '4.2% vs last period',
      trendIcon: TrendingUp,
      trendColor: 'text-[#ffb4ab]',
      trendDirection: 'up',
    },
    {
      id: 3,
      label: 'Total Incidents',
      value: '1,204',
      icon: AlertTriangle,
      trend: 'Stable vs last period',
      trendIcon: Minus,
      trendColor: 'text-[#c2c6d6]',
      trendDirection: 'stable',
    },
  ];

  // Resolution by team data
  const teamDistribution = [
    { name: 'Platform', percentage: 54, color: '#528dff' },
    { name: 'Data Eng', percentage: 32, color: '#f59e0b' },
    { name: 'Network', percentage: 14, color: '#333536' },
  ];

  // Service performance data
  const services = [
    {
      id: 'core-auth-api-prd',
      team: 'Platform Sec',
      uptime: '98.45%',
      incidents: 14,
      mtta: '4m 12s',
      mttr: '1h 45m',
      health: 'Degraded',
      healthClass: 'bg-red-500/10 border border-red-500/20 text-red-500',
      statusDot: 'bg-red-500 ring-2 ring-red-500/20 animate-pulse',
      uptimeColor: 'text-red-500',
      mttrColor: 'text-red-500',
    },
    {
      id: 'data-pipeline-worker',
      team: 'Data Eng',
      uptime: '99.10%',
      incidents: 8,
      mtta: '2m 45s',
      mttr: '32m 10s',
      health: 'Warning',
      healthClass: 'bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b]',
      statusDot: 'bg-[#f59e0b]',
      uptimeColor: 'text-[#f59e0b]',
      mttrColor: '',
    },
  ];

  // Chart data for MTTR Trend (Line)
  const mttrChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Core Services',
        data: [58, 52, 45, 38, 42, 36, 30],
        borderColor: '#528dff',
        backgroundColor: 'rgba(82, 141, 255, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#528dff',
        pointBorderColor: '#121415',
        pointBorderWidth: 1,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Edge Nodes',
        data: [72, 68, 65, 70, 58, 52, 48],
        borderColor: '#424753',
        backgroundColor: 'rgba(66, 71, 83, 0.2)',
        borderWidth: 1.5,
        pointRadius: 2,
        pointBackgroundColor: '#424753',
        pointBorderColor: '#121415',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Bar chart data for Severity frequency
  const severityChartData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Incidents',
        data: [842, 215, 98, 47],
        backgroundColor: ['#424753', '#f59e0b', '#ffb4ab', '#ff6b6b'],
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  // Doughnut chart for Team Resolution Distribution
  const teamDoughnutData = {
    labels: teamDistribution.map(t => t.name),
    datasets: [
      {
        data: teamDistribution.map(t => t.percentage),
        backgroundColor: teamDistribution.map(t => t.color),
        borderColor: '#1a1c1d',
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
        backgroundColor: '#0D0D0D',
        titleColor: '#e2e2e3',
        bodyColor: '#c2c6d6',
        borderColor: '#424753',
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
          color: '#c2c6d6',
          font: { family: 'monospace', size: 10 },
          boxWidth: 10,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: '#0D0D0D',
        titleColor: '#e2e2e3',
        bodyColor: '#c2c6d6',
        borderColor: '#424753',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: { color: '#42475320', drawBorder: false },
        ticks: { color: '#c2c6d6', font: { family: 'monospace', size: 10 }, stepSize: 15 },
        title: { display: true, text: 'Minutes (MTTR)', color: '#c2c6d6', font: { size: 10, family: 'monospace' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#c2c6d6', font: { family: 'monospace', size: 10 } },
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
        backgroundColor: '#0D0D0D',
        titleColor: '#e2e2e3',
        bodyColor: '#c2c6d6',
        borderColor: '#424753',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: { color: '#42475320' },
        ticks: { color: '#c2c6d6', font: { family: 'monospace', size: 10 } },
        title: { display: true, text: 'Number of Incidents', color: '#c2c6d6', font: { size: 10, family: 'monospace' } },
      },
      x: {
        ticks: { color: '#c2c6d6', font: { family: 'monospace', size: 10 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className=" text-[#e2e2e3] min-h-screen w-full antialiased font-sans">
  
      {/* Main Content */}
      <div className="p-6 overflow-y-auto">
        {/* Page Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-[24px] leading-[32px] tracking-[-0.02em] font-semibold text-[#e2e2e3] mb-1">
              System Analytics
            </h1>
            <p className="text-[13px] leading-[18px] font-medium text-[#c2c6d6]">
              Global performance metrics and incident resolution trends.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Timeframe Selector */}
            <div className="flex items-center bg-[#1a1c1d] border border-[#424753] rounded overflow-hidden p-0.5">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-4 py-1 font-mono text-[12px] transition-colors rounded-sm ${
                    activeTimeframe === tf
                      ? 'text-[#e2e2e3] bg-[#333536] shadow-sm'
                      : 'text-[#c2c6d6] hover:text-[#e2e2e3] hover:bg-[#333536]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            {/* Export Button */}
            <button className="flex items-center gap-1 px-4 py-1.5 bg-transparent border border-[#424753] text-[#e2e2e3] hover:border-[#528dff] hover:text-[#528dff] transition-colors rounded text-[12px] leading-[16px] font-medium">
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
              className="col-span-12 md:col-span-6 lg:col-span-3 bg-[#1a1c1d] border border-[#424753] rounded-lg p-4 flex flex-col justify-between h-28 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#528dff]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start">
                <span className="text-[12px] leading-[16px] font-medium text-[#c2c6d6] uppercase tracking-wider">
                  {metric.label}
                </span>
                <metric.icon className="text-[#c2c6d6] w-[18px] h-[18px]" />
              </div>
              <div>
                <div className="text-[24px] leading-[32px] tracking-[-0.02em] font-semibold text-[#e2e2e3] leading-none mb-1">
                  {metric.value}
                </div>
                {metric.progressBar ? (
                  <div className="w-full bg-[#333536] h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#528dff] h-full rounded-full"
                      style={{ width: `${metric.progressValue}%` }}
                    ></div>
                  </div>
                ) : (
                  <div
                    className={`text-[12px] leading-[16px] font-mono flex items-center gap-1 ${metric.trendColor}`}
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
          <div className="col-span-12 lg:col-span-8 bg-[#1a1c1d] border border-[#424753] rounded-lg p-4 min-h-[360px] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-[#e2e2e3]">
                Resolution Trends (MTTR)
              </h2>
            </div>
            <div className="flex-1 w-full h-[280px] relative">
              <Line data={mttrChartData} options={lineOptions} />
            </div>
          </div>

          {/* Incident Frequency (Bar Chart) & Team Resolution (Doughnut) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Bar Chart - Severity Frequency */}
            <div className="bg-[#1a1c1d] border border-[#424753] rounded-lg p-4 flex-1 flex flex-col min-h-[200px]">
              <h2 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-[#e2e2e3] mb-2">
                Frequency by Severity
              </h2>
              <div className="flex-1 w-full h-[180px]">
                <Bar data={severityChartData} options={barOptions} />
              </div>
            </div>

            {/* Team Distribution Doughnut Chart */}
            <div className="bg-[#1a1c1d] border border-[#424753] rounded-lg p-4 flex-1 flex flex-col min-h-[200px]">
              <h2 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-[#e2e2e3] mb-2">
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
                      <div className="flex items-center gap-1 text-[#e2e2e3]">
                        <span className={`w-2 h-2 rounded-full inline-block`} style={{ backgroundColor: team.color }}></span>
                        {team.name}
                      </div>
                      <span className="text-[#c2c6d6]">{team.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service Performance Matrix */}
          <div className="col-span-12 bg-[#1a1c1d] border border-[#424753] rounded-lg flex flex-col overflow-hidden mb-8">
            {/* Grid Header */}
            <div className="p-4 border-b border-[#424753] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#121415]/50">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-[#e2e2e3]">
                  Service Performance Matrix
                </h2>
                <span className="px-2 py-0.5 bg-[#333536] text-[#c2c6d6] rounded text-[10px] font-mono">
                  42 Services
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Filter className="absolute left-2 top-1.5 w-4 h-4 text-[#c2c6d6]" />
                  <input
                    className="bg-[#0D0D0D] border border-[#424753] rounded px-2 py-1 pl-8 text-[12px] text-[#e2e2e3] focus:border-[#528dff] outline-none font-mono w-52 h-7"
                    placeholder="Filter node, cluster..."
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
                <button className="w-7 h-7 border border-[#424753] rounded flex items-center justify-center text-[#c2c6d6] hover:text-[#e2e2e3] hover:bg-[#333536] transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#121415] border-b border-[#424753] font-mono text-[10px] text-[#c2c6d6] uppercase tracking-wider">
                    <th className="p-2 px-4 font-medium cursor-pointer hover:text-[#e2e2e3] group">
                      Service ID{' '}
                      <ArrowDown className="w-3 h-3 inline-block align-middle opacity-0 group-hover:opacity-100" />
                    </th>
                    <th className="p-2 px-4 font-medium cursor-pointer hover:text-[#e2e2e3]">
                      Team
                    </th>
                    <th className="p-2 px-4 font-medium text-right cursor-pointer hover:text-[#e2e2e3]">
                      Uptime (30d)
                    </th>
                    <th className="p-2 px-4 font-medium text-right cursor-pointer hover:text-[#e2e2e3]">
                      Incidents
                    </th>
                    <th className="p-2 px-4 font-medium text-right cursor-pointer hover:text-[#e2e2e3]">
                      MTTA
                    </th>
                    <th className="p-2 px-4 font-medium text-right cursor-pointer hover:text-[#e2e2e3]">
                      MTTR
                    </th>
                    <th className="p-2 px-4 font-medium text-center">Health Status</th>
                    <th className="p-2 px-4 font-medium text-center w-8"></th>
                   </tr>
                </thead>
                <tbody className="font-mono text-[12px] text-[#e2e2e3] divide-y divide-[#424753]/30">
                  {services.map((service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-[#333536]/20 transition-colors group"
                    >
                      <td className="p-2 px-4 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${service.statusDot}`}></span>
                        <span className="font-medium">{service.id}</span>
                      </td>
                      <td className="p-2 px-4 text-[#c2c6d6]">{service.team}</td>
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
                        <button className="opacity-0 group-hover:opacity-100 text-[#c2c6d6] hover:text-[#528dff] transition-all">
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