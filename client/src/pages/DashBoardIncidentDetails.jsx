import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Edit,
  Volume2,
  VolumeX,
  Rocket,
  CheckCircle2,
  FileText,
  Clock,
  MessageSquare,
  User,
  Users,
  Plus,
  Hash,
  Video,
  ExternalLink,
  Search,
  Activity,
  Send,
  Filter,
  Terminal,
  Calendar,
  RefreshCw,
  Download,
  Copy,
  Trash2,
  MoreVertical,
  Bell,
  BellOff,
  Check,
  X,
} from 'lucide-react';

const DashBoardIncidentDetails = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [title, setTitle] = useState('API Gateway Latency Spike in US-East-1');
  const [isEditing, setIsEditing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const incident = {
    id: 'INC-4092',
    status: 'Investigating',
    statusColor: 'bg-error',
    startedAt: '2023-10-24 14:32 UTC',
    updatedAt: '5m ago',
    severity: 'SEV-2',
  };

  const description = `Automated alert triggered indicating p99 latency for the core API Gateway cluster in us-east-1 has exceeded the 500ms threshold, currently fluctuating around 850ms.

Initial assessment shows high CPU utilization on downstream auth microservices. No recent deployments in the last 4 hours. Suspected bad actor or sudden traffic spike affecting specific tenant endpoints.`;

  const timeline = [
    {
      id: 1,
      title: 'Incident Declared',
      time: '14:32:00 UTC',
      description: 'System automatically declared INC-4092 based on sustained datadog monitor alerts.',
      type: 'error',
      user: null,
    },
    {
      id: 2,
      title: 'On-call Paged',
      time: '14:32:15 UTC',
      description: 'Page sent to Primary On-Call (Sarah Jenkins) via PagerDuty.',
      type: 'primary',
      hasCard: true,
      user: null,
    },
    {
      id: 3,
      title: 'Acknowledged',
      time: '14:35:10 UTC',
      description: 'Sarah Jenkins acknowledged the incident.',
      type: 'default',
      hasAvatar: true,
      user: { name: 'Sarah Jenkins', role: 'Incident Commander' },
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDxqHdVQQCQntQpucXwb1xD37K9VLC_MqhaXhTn8P-GXdmylxCcKLtgoSdPDmmUVvWqq3Z0cutmMD--yqMC79wcZ-kYSSd3AwiaJEZZXQHXOviQ_FWUyf_hjbBEj0xVIksAeh78ZnxAYZ-S8z43gF0DGDfeiKVYxz6JDRlz9-7-gvrzsXWANxGPKYOb3VnHmG6_fjPayeiMVPkOsaKuuYs6Hb07p1pFJwvxbnN0ZjZC7QsXUrIHlwRo9A_naVy5-wfcFCgxjfPx8Wo',
    },
  ];

  const [notes, setNotes] = useState([
    {
      id: 4,
      title: 'Note Added',
      time: '14:40:22 UTC',
      description: '"Looking at the traces, it seems tenant \'Acme Corp\' is sending 10x their normal request volume hitting the expensive `/v2/analytics/export` endpoint. Investigating rate limiting configuration."',
      type: 'note',
      user: { name: 'Marcus Thorne', role: 'SRE' },
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk8n7-Q7OYkUn6TtVgjWcGmNvoUb4ezXEMBuGTFITAecgzdQMGWAzKMIFGxWy9-_OqAAs_6ZbpGnonfN66VfcpIdtQiy9KPLb38Bn5FogKogUGyQ2sY2tLYrcV3_CEdLmtQEg0ciKFTmX3fgA-UavvOfHrMyGjwmmM0Q02YRFgYbi0NmfCS3GkqWXgQDxK6Q3e8uYlHFwTyDvCgzBQ44z1am10YDVFbKLcn50lZvC0carU42I3Tcq7nrFTWWmSzwk3sAf_nbEGj7oZ',
    },
  ]);

  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'status_change',
      user: 'System',
      action: 'changed status from "Monitoring" to "Investigating"',
      time: '14:32:00 UTC',
      icon: Activity,
    },
    {
      id: 2,
      type: 'assignment',
      user: 'System',
      action: 'assigned to Sarah Jenkins',
      time: '14:32:15 UTC',
      icon: User,
    },
    {
      id: 3,
      type: 'notification',
      user: 'System',
      action: 'sent notification to #incident-room',
      time: '14:32:30 UTC',
      icon: Bell,
    },
    {
      id: 4,
      type: 'note',
      user: 'Marcus Thorne',
      action: 'added a note',
      time: '14:40:22 UTC',
      icon: MessageSquare,
    },
  ]);

  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: '2023-10-24 14:32:00',
      level: 'ERROR',
      source: 'api-gateway',
      message: 'Request timeout: POST /checkout (504)',
    },
    {
      id: 2,
      timestamp: '2023-10-24 14:31:45',
      level: 'WARN',
      source: 'api-gateway',
      message: 'High latency detected: 842ms (threshold: 500ms)',
    },
    {
      id: 3,
      timestamp: '2023-10-24 14:31:30',
      level: 'ERROR',
      source: 'auth-service',
      message: 'Connection pool exhausted',
    },
    {
      id: 4,
      timestamp: '2023-10-24 14:31:15',
      level: 'INFO',
      source: 'cloudwatch',
      message: 'Alarm triggered: API-Gateway-High-Error-Rate',
    },
  ]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newNoteObj = {
        id: notes.length + 1,
        title: 'Note Added',
        time: new Date().toLocaleTimeString() + ' UTC',
        description: newNote,
        type: 'note',
        user: { name: 'Current User', role: 'Engineer' },
      };
      setNotes([...notes, newNoteObj]);
      setActivities([
        {
          id: activities.length + 1,
          type: 'note',
          user: 'Current User',
          action: 'added a note',
          time: new Date().toLocaleTimeString() + ' UTC',
          icon: MessageSquare,
        },
        ...activities,
      ]);
      setNewNote('');
      setShowAddNote(false);
    }
  };

  const getTimelineDotColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-danger-soft';
      case 'primary':
        return 'bg-brand-soft';
      case 'note':
        return '';
      default:
        return 'bg-muted';
    }
  };

  const getTimelineIcon = (type) => {
    if (type === 'note') {
      return <MessageSquare className="w-3 h-3 text-subtle" />;
    }
    return null;
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-danger-soft';
      case 'WARN':
        return 'text-semantic-warning';
      default:
        return 'text-success-bright';
    }
  };

  const getLogLevelBg = (level) => {
    switch (level) {
      case 'ERROR':
        return 'bg-danger-bg-subtle border-danger-soft/30';
      case 'WARN':
        return 'bg-semantic-warning/10 border-semantic-warning/20';
      default:
        return 'bg-success-bright/10 border-success-bright/20';
    }
  };

  return (
    <div className="bg-surface-header text-primary min-h-screen w-full antialiased">
      {/* Main Workspace */}
      <div className="flex flex-col h-full">
        {/* Incident Header Context */}
        <div className="flex-none px-6 py-6 border-b border-border-primary bg-surface-card">
          <div className="flex flex-col gap-3 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-tertiary font-mono text-[11px] mb-1">
              <a href="#" className="hover:text-brand-soft transition-colors">Incidents</a>
              <ChevronRight className="w-3 h-3" />
              <a href="#" className="hover:text-brand-soft transition-colors">Production</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary">{incident.id}</span>
            </div>

            {/* Title and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 flex items-start gap-4">
                <div className="mt-1 flex-none w-10 h-10 rounded bg-semantic-error/10 border border-danger-soft/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-danger-soft" />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-2 group">
                    {isEditing ? (
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
                        className="text-[24px] leading-[32px] tracking-[-0.02em] font-semibold bg-surface-elevated border border-border-muted rounded px-3 py-1 text-primary focus:outline-none focus:border-brand-soft w-full"
                        autoFocus
                      />
                    ) : (
                      <>
                        <h1 className="text-[24px] leading-[32px] tracking-[-0.02em] font-semibold text-primary">
                          {title}
                        </h1>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-subtle hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-tertiary font-mono text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${incident.status === 'Investigating' ? 'bg-danger-soft' : 'bg-success-bright'}`}></span>
                      {incident.status}
                    </span>
                    <span>•</span>
                    <span>Started: {incident.startedAt}</span>
                    <span>•</span>
                    <span>Updated: {incident.updatedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="btn-outline"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button className="btn-outline">
                  <Rocket className="w-4 h-4" />
                  Escalate
                </button>
                <button className="btn-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolve
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mt-4 border-b border-border-primary">
              {['overview', 'logs', 'activity', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-1 py-2 border-b-2 transition-all text-[12px] font-medium capitalize ${
                    activeTab === tab
                      ? 'border-brand-soft text-brand-soft'
                      : 'border-transparent text-tertiary hover:text-primary'
                  }`}
                >
                  {tab}
                  {(tab === 'activity' || tab === 'notes') && (
                    <span className="ml-1.5 bg-surface-interactive text-primary px-1.5 py-0.5 rounded text-[10px]">
                      {tab === 'activity' ? activities.length : notes.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content Layout */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
          {/* Left Canvas: Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-border-primary custom-scrollbar">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description Card */}
                <div className="bg-surface-card border border-border-primary rounded-lg p-5">
                  <h3 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-primary mb-3 flex items-center gap-1.5">
                    <FileText className="w-[18px] h-[18px] text-subtle" />
                    Description
                  </h3>
                  <div className="text-[13px] leading-[18px] text-tertiary space-y-3 whitespace-pre-line">
                    {description}
                  </div>
                </div>

                {/* Timeline Section */}
                <div>
                  <h3 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-primary mb-4 flex items-center gap-1.5">
                    <Clock className="w-[18px] h-[18px] text-subtle" />
                    Event Timeline
                  </h3>
                  <div className="relative border-l border-border-primary ml-[9px] space-y-5 pb-4">
                    {[...timeline, ...notes].sort((a, b) => b.id - a.id).map((item) => (
                      <div key={item.id} className="relative pl-6">
                        <div className={`absolute w-[18px] h-[18px] bg-surface-card border border-border-primary rounded-full -left-[9px] top-0.5 flex items-center justify-center`}>
                          {getTimelineIcon(item.type) || (
                            <div className={`w-1.5 h-1.5 rounded-full ${getTimelineDotColor(item.type)}`}></div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className="text-[12px] font-semibold text-primary">{item.title}</span>
                          <span className="font-mono text-tertiary text-[11px]">{item.time}</span>
                        </div>
                        
                        {item.hasCard ? (
                          <div className="bg-surface-card border border-border-primary rounded p-3 mt-2">
                            <p className="font-mono text-primary text-[12px]">{item.description}</p>
                          </div>
                        ) : item.hasAvatar ? (
                          <div className="flex items-center gap-2 mt-2">
                            <img src={item.avatar} alt="Sarah Jenkins" className="w-5 h-5 rounded-full border border-border-primary" />
                            <span className="text-[12px] text-tertiary">{item.description}</span>
                          </div>
                        ) : item.type === 'note' ? (
                          <div className="bg-surface-elevated border-l-2 border-brand-soft pl-3 py-2 mt-2">
                            <p className="text-[13px] text-primary italic">{item.description}</p>
                            {item.user && (
                              <div className="flex items-center gap-2 mt-2">
                                <img src={item.avatar} className="w-4 h-4 rounded-full" alt="" />
                                <span className="text-[10px] text-subtle">— {item.user.name}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-[13px] text-tertiary mt-1">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LOGS TAB */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                {/* Log Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle" />
                      <input
                        type="text"
                        placeholder="Filter logs..."
                        className="pl-7 pr-3 py-1.5 bg-surface-elevated border border-border-primary rounded-lg text-[12px] text-primary focus:border-brand-soft focus:outline-none w-64"
                      />
                    </div>
                    <button className="p-1.5 border border-border-primary rounded-lg text-subtle hover:text-primary">
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-border-primary rounded-lg text-[11px] text-tertiary hover:bg-surface-elevated transition-colors flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                    <button className="p-1.5 border border-border-primary rounded-lg text-subtle hover:text-primary">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Logs Table */}
                <div className="bg-surface-card border border-border-primary rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-elevated border-b border-border-primary">
                        <tr className="text-[11px] font-mono text-subtle uppercase tracking-wider">
                          <th className="px-4 py-2">Timestamp</th>
                          <th className="px-4 py-2">Level</th>
                          <th className="px-4 py-2">Source</th>
                          <th className="px-4 py-2">Message</th>
                          <th className="px-4 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-primary">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-surface-elevated transition-colors">
                            <td className="px-4 py-2.5 text-[11px] font-mono text-tertiary">{log.timestamp}</td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${getLogLevelBg(log.level)} ${getLogLevelColor(log.level)}`}>
                                {log.level}
                              </span>
                             </td>
                            <td className="px-4 py-2.5 text-[12px] font-mono text-tertiary">{log.source}</td>
                            <td className="px-4 py-2.5 text-[12px] font-mono text-primary">{log.message}</td>
                            <td className="px-4 py-2.5">
                              <button className="text-subtle hover:text-primary">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-primary">Recent Activity</h3>
                  <button className="text-[11px] text-brand-soft hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-surface-card border border-border-primary rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-surface-elevated border border-border-primary flex items-center justify-center">
                        <activity.icon className="w-3.5 h-3.5 text-subtle" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[12px] font-medium text-primary">{activity.user}</span>
                          <span className="text-[12px] text-tertiary">{activity.action}</span>
                        </div>
                        <span className="text-[10px] font-mono text-subtle">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {/* Add Note Button */}
                {!showAddNote ? (
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="w-full py-3 border border-dashed border-border-muted rounded-lg text-[12px] text-subtle hover:text-brand-soft hover:border-brand-soft transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Note
                  </button>
                ) : (
                  <div className="bg-surface-card border border-border-primary rounded-lg p-4">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Write a note..."
                      className="w-full bg-surface border border-border-primary rounded-lg p-3 text-[13px] text-primary focus:border-brand-soft focus:outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => setShowAddNote(false)}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNote}
                        className="btn-primary"
                      >
                        <Send className="w-3 h-3" />
                        Post Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes List */}
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-surface-card border border-border-primary rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-border-primary">
                            <img src={note.avatar} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-[12px] font-medium text-primary">{note.user?.name || 'System'}</span>
                            <span className="text-[10px] text-subtle ml-2">{note.time}</span>
                          </div>
                        </div>
                        <button className="text-subtle hover:text-primary">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[13px] text-tertiary italic pl-8">{note.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Metadata & Actions */}
          <div className="w-full lg:w-[320px] bg-surface-header border-l border-border-primary overflow-y-auto flex-none">
            <div className="p-5 flex flex-col gap-5">
              {/* Severity & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-card border border-border-primary rounded p-3 flex flex-col gap-1.5">
                  <span className="font-mono text-subtle text-[10px] uppercase tracking-wider">Severity</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-danger-soft"></span>
                    <span className="text-[12px] font-medium text-primary">{incident.severity}</span>
                  </div>
                </div>
                <div className="bg-surface-card border border-border-primary rounded p-3 flex flex-col gap-1.5">
                  <span className="font-mono text-subtle text-[10px] uppercase tracking-wider">Status</span>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-brand-soft" />
                    <span className="text-[12px] font-medium text-primary">Investigating</span>
                  </div>
                </div>
              </div>

              {/* Assignments */}
              <div>
                <h4 className="font-mono text-subtle text-[10px] uppercase tracking-wider mb-2">Roles</h4>
                <ul className="flex flex-col gap-2">
                  <li className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-border-muted" />
                      <span className="text-[13px] text-tertiary">Commander</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <img
                        alt="Sarah Jenkins"
                        className="w-5 h-5 rounded-full"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD17J1w4ASm4njjGu7tfazEDG2eQn3Qsf6gZ-qbODCXIzjYuvbWZJwTlz8Ftgn4g2hMQ2pRA6fm4o4KxRISoaaxpOCJEbMW8QI3cuwoJKJE8HxYOWwOgWtB0V7hRxnoZFsakO-_FDYPXienkotBuqK9kzsq_dXVlMKjXm1OPjzfguQFOWSErV6j6i01pMRYSK0yvebk3TZ423Zkict1p0UB1ew-8ibH0ULXkJz-USXI1AP3zL5slcAxCg8UlVGkbdgsyEMddCJdMMAz"
                      />
                      <span className="text-[12px] font-medium text-primary">S. Jenkins</span>
                    </div>
                  </li>
                  <li className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-border-muted" />
                      <span className="text-[13px] text-tertiary">Comms</span>
                    </div>
                    <button className="text-[12px] font-medium text-brand-soft hover:underline">Assign</button>
                  </li>
                </ul>
              </div>

              <div className="w-full h-px bg-surface-interactive"></div>

              {/* Impacted Services */}
              <div>
                <h4 className="font-mono text-subtle text-[10px] uppercase tracking-wider mb-2">Impacted Services</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-surface-elevated border border-border-primary text-tertiary font-mono text-[11px] px-2 py-1 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger-soft"></span>
                    api-gateway
                  </span>
                  <span className="bg-surface-elevated border border-border-primary text-tertiary font-mono text-[11px] px-2 py-1 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger-soft"></span>
                    auth-service
                  </span>
                  <span className="bg-surface-elevated border border-border-primary text-tertiary font-mono text-[11px] px-2 py-1 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                    analytics-worker
                  </span>
                  <button className="bg-transparent border border-dashed border-border-muted text-subtle hover:text-primary font-mono text-[11px] px-2 py-1 rounded flex items-center gap-1 transition-colors">
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardIncidentDetails;