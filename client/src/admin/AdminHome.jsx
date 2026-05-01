import React, { useState, useEffect, useRef } from 'react';
import {
  Line,
  Doughnut,
  Bar
} from 'react-chartjs-2';
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
  Filler
} from 'chart.js';
import {
  Network,
  LayoutDashboard,
  AlertTriangle,
  Server,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  Search,
  Bell,
  HelpCircle,
  ArrowRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Timer,
  Activity,
  Shield,
  Database,
  Cloud,
  GitBranch,
  CheckCircle2,
  Zap,
  Radio,
  Eye,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  HardDrive,
  Cpu,
  Wifi,
  Globe,
  Mail,
  MessageSquare,
  FileText,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Copy,
  MoreHorizontal
} from 'lucide-react';

// Register Chart.js components
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

// ---------- Mock Data & Helpers ----------
const generateSparklineData = (points = 12, trend = 'up', variance = 0.3) => {
  const base = trend === 'up' ? 0.3 : trend === 'down' ? 0.7 : 0.5;
  return Array.from({ length: points }, (_, i) => {
    const progress = i / (points - 1);
    const trendValue = trend === 'up' ? progress : trend === 'down' ? 1 - progress : 0.5;
    return base * 0.3 + trendValue * 0.7 + (Math.random() - 0.5) * variance;
  });
};

// Mock Users Data
const mockUsers = [
  { id: 1, name: 'Alex Johnson', email: 'alex.j@incidentcore.com', role: 'Admin', status: 'active', lastActive: '2 min ago', avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=4F8CFF&color=fff' },
  { id: 2, name: 'Sarah Chen', email: 'sarah.c@incidentcore.com', role: 'Engineer', status: 'active', lastActive: '5 min ago', avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=34D399&color=fff' },
  { id: 3, name: 'Mike Rodriguez', email: 'mike.r@incidentcore.com', role: 'Operator', status: 'away', lastActive: '15 min ago', avatar: 'https://ui-avatars.com/api/?name=Mike+Rodriguez&background=F59E0B&color=fff' },
  { id: 4, name: 'Emily Watson', email: 'emily.w@incidentcore.com', role: 'Engineer', status: 'active', lastActive: '1 hour ago', avatar: 'https://ui-avatars.com/api/?name=Emily+Watson&background=8B5CF6&color=fff' },
  { id: 5, name: 'David Kim', email: 'david.k@incidentcore.com', role: 'Viewer', status: 'offline', lastActive: '3 hours ago', avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=6B7280&color=fff' },
];

// System Metrics
const systemMetrics = {
  cpu: 67,
  memory: 73,
  disk: 45,
  network: 89,
};

const mockIncidentFrequency = {
  labels: ['Day 01', 'Day 05', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
  datasets: [
    {
      label: 'P1 Critical',
      data: [4, 3, 5, 4, 6, 5, 4],
      borderColor: '#4F8CFF',
      backgroundColor: 'rgba(79, 140, 255, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#4F8CFF',
      pointBorderColor: '#0D0D0D',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'P2 Standard',
      data: [6, 8, 7, 9, 8, 10, 8],
      borderColor: '#6B7280',
      backgroundColor: 'rgba(107, 114, 128, 0.05)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#6B7280',
      pointBorderColor: '#0D0D0D',
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  ]
};

const userActivityData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Active Users',
    data: [45, 52, 49, 60, 55, 30, 25],
    backgroundColor: '#4F8CFF',
    borderRadius: 4,
  }]
};

const incidentTypeData = {
  labels: ['Database', 'Network', 'Application', 'Security', 'Other'],
  datasets: [{
    data: [30, 25, 20, 15, 10],
    backgroundColor: ['#4F8CFF', '#34D399', '#F59E0B', '#EF4444', '#6B7280'],
    borderColor: '#0D0D0D',
    borderWidth: 2,
  }]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#1A1A1A',
      titleColor: '#E2E2E3',
      bodyColor: '#9CA3AF',
      borderColor: '#262626',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 4,
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(38, 38, 38, 0.5)', drawBorder: false },
      ticks: { color: '#6B7280', font: { size: 10, family: 'Inter' } },
    },
    y: {
      grid: { color: 'rgba(38, 38, 38, 0.5)', drawBorder: false },
      ticks: { color: '#6B7280', font: { size: 10, family: 'Inter' }, stepSize: 2 },
      beginAtZero: true,
      max: 12,
    }
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1A1A1A',
      titleColor: '#E2E2E3',
      bodyColor: '#9CA3AF',
      borderColor: '#262626',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 4,
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#6B7280', font: { size: 10 } },
    },
    y: {
      grid: { color: 'rgba(38, 38, 38, 0.3)' },
      ticks: { color: '#6B7280', font: { size: 10 } },
      beginAtZero: true,
    }
  }
};

const serviceHealthData = [
  { name: 'Core API Gateway', status: 'operational', icon: Server, latency: '12ms', uptime: '99.99%' },
  { name: 'Main Database Cluster', status: 'operational', icon: Database, latency: '8ms', uptime: '99.95%' },
  { name: 'Auth Service', status: 'latency', icon: Shield, latency: '245ms', uptime: '99.87%' },
  { name: 'Client Frontend', status: 'operational', icon: Cloud, latency: '45ms', uptime: '99.99%' },
];

const liveFeedEvents = [
  {
    id: 1,
    type: 'critical',
    title: 'Incident P1 Triggered',
    time: '12:04:12',
    description: 'DB pool exhaustion detected in us-east-1. High latency observed across core API.',
    responder: '@dev_ops',
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: 'success',
    title: 'Deployment Success',
    time: '11:45:00',
    description: 'Frontend build v2.4.1-rc3 deployed to production environment.',
    commit: 'af93d2',
    icon: CheckCircle2,
  },
  {
    id: 3,
    type: 'info',
    title: 'Health Check',
    time: '11:30:12',
    description: 'Automated system health check completed. All clusters reporting within normal parameters.',
    icon: Activity,
  },
  {
    id: 4,
    type: 'warning',
    title: 'Auth Latency Peak',
    time: '10:55:04',
    description: 'OAuth handshake duration exceeded threshold of 400ms.',
    icon: Timer,
  },
  {
    id: 5,
    type: 'info',
    title: 'Backup Completed',
    time: '10:30:00',
    description: 'Scheduled database backup completed successfully. Size: 2.4GB',
    icon: HardDrive,
  },
  {
    id: 6,
    type: 'success',
    title: 'User Added',
    time: '10:15:00',
    description: 'New team member john.doe@incidentcore.com added to engineering team.',
    icon: UserPlus,
  },
];

// ---------- Sub-components ----------
const Sparkline = ({ data, color = '#4F8CFF', height = 40 }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.offsetWidth;
    const h = height;
    
    ctx.clearRect(0, 0, width, h);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    
    const step = width / (data.length - 1);
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal || 1;
    
    data.forEach((val, i) => {
      const x = i * step;
      const y = h - 5 - ((val - minVal) / range) * (h - 10);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    ctx.lineTo((data.length - 1) * step, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = `${color}15`;
    ctx.fill();
  }, [data, color, height]);
  
  return <canvas ref={canvasRef} className="w-full" style={{ height: `${height}px` }} />;
};

const StatusBadge = ({ status }) => {
  const config = {
    operational: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Operational' },
    latency: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Latency Spike' },
    critical: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Critical' },
    active: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Active' },
    away: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Away' },
    offline: { color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Offline' },
  };
  const { color, bg, label } = config[status] || config.operational;
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded ${bg} ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}></span>
      {label}
    </span>
  );
};

const EventIcon = ({ type }) => {
  const colors = {
    critical: 'bg-red-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-[#4F8CFF]',
  };
  return <div className={`w-2 h-2 rounded-full ${colors[type] || 'bg-gray-600'} border border-black absolute -left-1 top-1.5 z-10`} />;
};

const ProgressBar = ({ value, color = '#4F8CFF' }) => (
  <div className="w-full bg-[#0D0D0D] rounded-full h-1.5">
    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }}></div>
  </div>
);

// ---------- Main Dashboard Component ----------
const AdminHome = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeIncidents] = useState(12);
  const [criticalAlerts] = useState(4);
  const [mttr] = useState('28m');
  const [totalUsers] = useState(48);
  const [activeUsers] = useState(32);
  
  const uptimeSparkline = generateSparklineData(12, 'stable', 0.1);
  const incidentsSparkline = generateSparklineData(12, 'up');
  const criticalSparkline = generateSparklineData(8, 'up', 0.4);
  const mttrSparkline = generateSparklineData(10, 'down');
  const usersSparkline = generateSparklineData(14, 'up', 0.2);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E2E2E3] antialiased">
      <div className="p-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#262626] rounded text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#141414] border border-[#262626] p-4 rounded shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Active Incidents</span>
              <span className="text-[#4F8CFF] text-[10px] bg-[#4F8CFF]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +2%
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-white tracking-tight">{activeIncidents}</span>
              <div className="flex-1 h-10">
                <Sparkline data={incidentsSparkline} color="#4F8CFF" />
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-[#262626] p-4 rounded shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Critical Alerts</span>
              <span className="text-red-400 text-[10px] bg-red-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> High Risk
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-white tracking-tight">0{criticalAlerts}</span>
              <div className="flex-1 h-10">
                <Sparkline data={criticalSparkline} color="#EF4444" />
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-[#262626] p-4 rounded shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Total Users</span>
              <span className="text-emerald-400 text-[10px] bg-emerald-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-white tracking-tight">{totalUsers}</span>
              <div className="flex-1 h-10">
                <Sparkline data={usersSparkline} color="#34D399" />
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-[#262626] p-4 rounded shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">System Uptime</span>
              <span className="text-[#4F8CFF] text-[10px] bg-[#4F8CFF]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Radio className="w-3 h-3" /> Stable
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-white tracking-tight">99.99%</span>
              <div className="flex-1 h-10">
                <Sparkline data={uptimeSparkline} color="#4F8CFF" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Chart + Feed */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Incident Frequency Chart */}
            <div className="bg-[#141414] border border-[#262626] p-6 rounded relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Incident Frequency</h3>
                  <p className="text-xs text-gray-500">Last 30 days performance analysis</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#4F8CFF]"></span> P1 Critical
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span> P2 Standard
                  </span>
                </div>
              </div>
              <div className="h-[300px] w-full relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                  <span className="text-4xl font-black italic tracking-tighter text-white">ANALYTICS ENGINE</span>
                </div>
                <Line data={mockIncidentFrequency} options={chartOptions} />
              </div>
            </div>

            {/* User Activity & Incident Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#141414] border border-[#262626] p-6 rounded">
                <h3 className="text-lg font-semibold text-white mb-4">User Activity</h3>
                <div className="h-[250px]">
                  <Bar data={userActivityData} options={barChartOptions} />
                </div>
              </div>
              <div className="bg-[#141414] border border-[#262626] p-6 rounded">
                <h3 className="text-lg font-semibold text-white mb-4">Incident Types</h3>
                <div className="h-[250px] flex items-center justify-center">
                  <Doughnut data={incidentTypeData} options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        position: 'bottom',
                        labels: { color: '#9CA3AF', padding: 16, font: { size: 11 } }
                      } 
                    }
                  }} />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Feed + Quick Stats */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Quick Stats */}
            <div className="bg-[#141414] border border-[#262626] rounded p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-200">Active Users</div>
                      <div className="text-[10px] text-gray-500">Currently online</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white">{activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#4F8CFF]/10 rounded flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-[#4F8CFF]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-200">Open Incidents</div>
                      <div className="text-[10px] text-gray-500">Requiring attention</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white">{activeIncidents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 rounded flex items-center justify-center">
                      <Timer className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-200">Avg Response</div>
                      <div className="text-[10px] text-gray-500">Time to acknowledge</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white">3.2m</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/10 rounded flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-200">Services</div>
                      <div className="text-[10px] text-gray-500">Total monitored</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white">24</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminHome;