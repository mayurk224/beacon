import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import {
  Play,
  MoreVertical,
  GitBranch,
  Webhook,
  FileText,
  Trash2,
  Plus,
  Search,
  X,
  Zap,
  Settings,
  HelpCircle,
  User,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Sparkles component
const Sparkles = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

/* -------------------- INITIAL DATA -------------------- */

const initialNodes = [
  {
    id: 'trigger',
    type: 'custom',
    position: { x: 100, y: 150 },
    data: { label: 'Webhook Trigger', icon: Webhook, subtitle: 'POST /hooks/cpu-alert' },
  },
  {
    id: 'condition',
    type: 'custom',
    position: { x: 450, y: 150 },
    data: { label: 'Severity Check', icon: GitBranch, subtitle: 'cpu > 85%' },
  },
  {
    id: 'actionTrue',
    type: 'custom',
    position: { x: 850, y: 80 },
    data: { label: 'Slack Notification', subtitle: '#incident-room' },
  },
  {
    id: 'actionFalse',
    type: 'custom',
    position: { x: 850, y: 220 },
    data: { label: 'Log Event', icon: FileText, subtitle: 'CloudWatch' },
  },
];

const initialEdges = [
  { id: 'e1', source: 'trigger', target: 'condition', type: 'smoothstep' },
  { id: 'e2', source: 'condition', target: 'actionTrue', type: 'smoothstep', style: { stroke: '#4F8CFF' } },
  { id: 'e3', source: 'condition', target: 'actionFalse', type: 'smoothstep', style: { stroke: '#262626', strokeDasharray: '4 4' } },
];

/* -------------------- CUSTOM NODE -------------------- */

const CustomNode = ({ data, selected }) => {
  const Icon = data.icon;

  return (
    <div
      className={`w-[240px] rounded-xl border transition-all cursor-pointer
      ${selected ? 'border-[#4F8CFF] bg-[#4F8CFF]/5 shadow-[0_0_15px_rgba(79,140,255,0.1)]' : 'border-[#262626] bg-[#141414] hover:border-[#3B82F6]/40'}`}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-[#424753] !border-none" />

      <div className="flex items-center gap-2 p-3 border-b border-[#262626]">
        {Icon && <Icon className="w-4 h-4 text-[#4F8CFF]" />}
        <span className="text-[13px] font-medium text-[#e2e2e3]">{data.label}</span>
        <MoreVertical className="w-3 h-3 ml-auto text-[#71717A] cursor-pointer hover:text-[#e2e2e3]" />
      </div>

      <div className="p-3 text-[11px] text-[#A1A1AA] font-mono">
        {data.subtitle}
      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-[#4F8CFF] !border-none" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

/* -------------------- MAIN -------------------- */

export default function DashBoardPlayBook() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState('condition');
  const [searchTerm, setSearchTerm] = useState('');

  const [field, setField] = useState('cpu');
  const [operator, setOperator] = useState('>');
  const [value, setValue] = useState('85');

  const [endpoint, setEndpoint] = useState('/hooks/cpu-alert');
  const [channel, setChannel] = useState('#incident-room');
  const [message, setMessage] = useState('High CPU Alert: {{value}}%');

  const playbooks = [
    { id: 1, name: 'Critical API Recovery', time: '2m ago', active: true, tags: ['Webhooks'] },
    { id: 2, name: 'Database Failover', time: '15m ago', active: false, tags: ['Cloudwatch'] },
    { id: 3, name: 'S3 Bucket Lockdown', time: '1h ago', active: false, tags: ['Manual'] },
    { id: 4, name: 'Auth Token Expiry', time: '4h ago', active: false, tags: ['API'] },
  ];

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    [setEdges]
  );

  const getNodeConfig = () => {
    switch (selectedNodeId) {
      case 'trigger':
        return {
          title: 'Webhook Trigger',
          icon: Webhook,
          fields: (
            <>
              <div className="space-y-2">
                <label className="text-[10px] text-[#71717A] uppercase tracking-wider">Method</label>
                <select className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg px-3 py-2 text-[13px] text-[#e2e2e3] focus:border-[#4F8CFF] focus:outline-none">
                  <option>POST</option>
                  <option>GET</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-[#71717A] uppercase tracking-wider">Endpoint</label>
                <input
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg px-3 py-2 text-[13px] font-mono text-[#e2e2e3] focus:border-[#4F8CFF] focus:outline-none"
                />
              </div>
            </>
          ),
        };
      case 'condition':
        return {
          title: 'Severity Check',
          icon: GitBranch,
          fields: (
            <>
              <div className="space-y-2">
                <label className="text-[10px] text-[#71717A] uppercase tracking-wider">Field</label>
                <input
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg px-3 py-2 text-[13px] font-mono text-[#e2e2e3] focus:border-[#4F8CFF] focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] text-[#71717A] uppercase tracking-wider">Operator</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg px-3 py-2 text-[13px] text-[#e2e2e3] focus:border-[#4F8CFF] focus:outline-none"
                  >
                    <option>&gt;</option>
                    <option>&lt;</option>
                    <option>==</option>
                    <option>&gt;=</option>
                    <option>&lt;=</option>
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] text-[#71717A] uppercase tracking-wider">Value</label>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg px-3 py-2 text-[13px] text-[#e2e2e3] focus:border-[#4F8CFF] focus:outline-none"
                  />
                </div>
              </div>
            </>
          ),
        };
      case 'actionTrue':
        return {
          title: 'Slack Notification',
          icon: Zap,
          fields: (
            <>
              <div className="space-y-2">
                <label className="text-[10px] text-[#71717A] uppercase tracking-wider">Channel</label>
                <input
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg px-3 py-2 text-[13px] font-mono text-[#e2e2e3] focus:border-[#4F8CFF] focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-[#71717A] uppercase tracking-wider">Message Template</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg px-3 py-2 text-[13px] font-mono text-[#e2e2e3] focus:border-[#4F8CFF] focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-[#71717A] uppercase tracking-wider">Urgency</label>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-1.5 border border-[#262626] rounded-lg text-[11px] text-[#71717A] hover:border-[#4F8CFF] hover:text-[#4F8CFF] transition-colors">Low</button>
                  <button className="flex-1 px-3 py-1.5 border border-[#262626] rounded-lg text-[11px] text-[#71717A] hover:border-[#4F8CFF] hover:text-[#4F8CFF] transition-colors">Medium</button>
                  <button className="flex-1 px-3 py-1.5 border border-[#4F8CFF]/50 rounded-lg text-[11px] text-[#4F8CFF] bg-[#4F8CFF]/10">High</button>
                </div>
              </div>
            </>
          ),
        };
      default:
        return {
          title: 'Log Event',
          icon: FileText,
          fields: (
            <div className="space-y-2">
              <label className="text-[10px] text-[#71717A] uppercase tracking-wider">Destination</label>
              <select className="w-full bg-[#0D0D0D] border border-[#262626] rounded-lg px-3 py-2 text-[13px] text-[#e2e2e3] focus:border-[#4F8CFF] focus:outline-none">
                <option>CloudWatch</option>
                <option>S3</option>
                <option>DataDog</option>
              </select>
            </div>
          ),
        };
    }
  };

  const config = getNodeConfig();
  const IconComponent = config.icon;

  const filteredPlaybooks = playbooks.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen overflow-x-auto bg-[#0D0D0D]">
      
      {/* IMPORTANT WRAPPER with min-width */}
      <div className="flex min-w-[1200px] h-full text-[#e2e2e3]">

        {/* LEFT SIDEBAR - Playbooks List */}
        <aside className="w-64 shrink-0 border-r border-[#262626] bg-[#0D0D0D] flex flex-col">
          <div className="p-4 border-b border-[#262626]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold">
                Playbooks
              </h2>
              <Link to="/home/create_incident" className="text-[#71717A] hover:text-[#e2e2e3] transition-colors">
                <Plus className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A]" />
              <input
                placeholder="Search playbooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-lg pl-7 pr-2 py-1.5 text-[12px] text-[#e2e2e3] placeholder:text-[#71717A] focus:border-[#4F8CFF] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredPlaybooks.map((playbook) => (
              <div
                key={playbook.id}
                className={`px-4 py-3 cursor-pointer transition-all ${
                  playbook.active
                    ? 'bg-[#141414] border-l-2 border-[#4F8CFF]'
                    : 'hover:bg-[#141414]'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[13px] font-medium ${playbook.active ? 'text-[#e2e2e3]' : 'text-[#A1A1AA]'}`}>
                    {playbook.name}
                  </span>
                  <MoreVertical className="w-3 h-3 text-[#71717A]" />
                </div>
                <div className="flex gap-2 items-center mb-1">
                  {playbook.tags.map((tag) => (
                    <span key={tag} className="text-[9px] bg-[#4F8CFF]/10 text-[#4F8CFF] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-[#71717A] font-mono">{playbook.time}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER - ReactFlow Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="h-14 border-b border-[#262626] flex items-center justify-between px-6 bg-[#0D0D0D] shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="text-[16px] font-semibold text-[#e2e2e3]">Critical API Recovery</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#4F8CFF]/20 text-[#4F8CFF] border border-[#4F8CFF]/30 uppercase font-bold">
                Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#262626] rounded-lg text-[12px] text-[#A1A1AA] hover:bg-[#141414] hover:text-[#e2e2e3] transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-[#4F8CFF]" />
                Generate with AI
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#262626] rounded-lg text-[12px] text-[#A1A1AA] hover:bg-[#141414] hover:text-[#e2e2e3] transition-colors">
                <Play className="w-3.5 h-3.5" />
                Test
              </button>
              <button className="px-4 py-1.5 bg-[#4F8CFF] text-white rounded-lg text-[12px] font-semibold hover:bg-[#3B70D1] transition-colors">
                Deploy
              </button>
            </div>
          </div>

          {/* Flow Canvas */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              fitView
              className="bg-[#121415]"
            >
              <Background color="#1f1f1f" gap={24} size={1} />
              <Controls className="!bg-[#141414] !border-[#262626] [&>button]:!bg-[#141414] [&>button]:!border-[#262626] [&>button]:!text-[#A1A1AA]" />
              <MiniMap className="!bg-[#141414] !border-[#262626]" nodeColor="#4F8CFF" />
            </ReactFlow>
          </div>
        </div>

        {/* RIGHT INSPECTOR - Node Configuration */}
        <aside className="w-80 shrink-0 border-l border-[#262626] bg-[#141414] flex flex-col">
          <div className="p-4 border-b border-[#262626]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="w-5 h-5 text-[#4F8CFF]" />}
                <h3 className="text-[15px] font-semibold text-[#e2e2e3]">{config.title}</h3>
              </div>
              <button className="text-[#71717A] hover:text-[#e2e2e3] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-[#71717A] uppercase tracking-wider mt-1">
              Node ID: {selectedNodeId}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {config.fields}
          </div>

          <div className="p-4 border-t border-[#262626] space-y-3">
            <button className="w-full flex items-center justify-center gap-2 py-2 border border-[#262626] rounded-lg text-[12px] text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#e2e2e3] transition-colors">
              <Play className="w-3.5 h-3.5" />
              Test this step
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2 border border-red-500/30 rounded-lg text-[12px] text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Remove node
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}