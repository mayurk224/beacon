import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  ArrowUpCircle,
  BellOff,
  Copy,
  ChevronDown,
  Calendar,
  Server,
  Globe,
  TrendingUp,
  Users,
  Clock,
  FileText,
  Database,
  Activity,
  Shield,
  Zap,
  Hash,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';

const DashBoardAlertDetail = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('unacknowledged');
  const [copied, setCopied] = useState(false);

  const alert = {
    id: 'INC-4928',
    title: 'High 5xx Error Rate',
    severity: 'Critical',
    timestamp: '2 mins ago',
    source: 'AWS ALB',
    service: 'API Gateway',
    description: [
      'The Application Load Balancer is reporting a sustained spike in 5xx HTTP response codes from the upstream API Gateway service. The error rate has exceeded the critical threshold of 5% over a 5-minute rolling window.',
      'Initial automated diagnostics indicate backend instances in availability zone us-east-1a are failing health checks and returning 502 Bad Gateway errors.',
    ],
    rawPayload: {
      version: '1.0',
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      'detail-type': 'CloudWatch Alarm State Change',
      source: 'aws.cloudwatch',
      account: '123456789012',
      time: '2023-10-27T08:15:30Z',
      region: 'us-east-1',
      detail: {
        alarmName: 'ALB-High-5xx-Rate-Prod',
        state: {
          value: 'ALARM',
          reason: 'Threshold Crossed: 1 datapoint [8.5 (27/10/23 08:10:00)] was greater than or equal to the threshold (5.0).',
        },
        configuration: {
          metrics: [
            {
              id: 'm1',
              metricStat: {
                metric: {
                  namespace: 'AWS/ApplicationELB',
                  name: 'HTTPCode_ELB_5XX_Count',
                  dimensions: {
                    LoadBalancer: 'app/prod-api-gw-alb/123456789',
                  },
                },
                period: 60,
                stat: 'Sum',
              },
            },
          ],
        },
      },
    },
  };

  const timeline = [
    {
      id: 1,
      title: 'Alert Triggered',
      time: '08:15:30 UTC',
      description: 'CloudWatch alarm ALB-High-5xx-Rate-Prod transitioned to ALARM state.',
      type: 'error',
    },
    {
      id: 2,
      title: 'Automated Runbook Executed',
      time: '08:15:35 UTC',
      description: 'System initiated runbook Fetch-ALB-Logs.',
      type: 'primary',
    },
    {
      id: 3,
      title: 'Page Sent',
      time: '08:16:00 UTC',
      description: 'Notification sent to Primary On-Call schedule.',
      type: 'default',
    },
  ];

  const getTimelineIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-[#ffb4ab]" />;
      case 'primary':
        return <Zap className="w-3 h-3 text-[#afc6ff]" />;
      default:
        return <Activity className="w-3 h-3 text-[#8c909f]" />;
    }
  };

  const getTimelineColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-[#3f1616] border-[#7f1d1d]';
      case 'primary':
        return 'bg-[#1e3a8a]/20 border-[#1e3a8a]/50';
      default:
        return 'bg-[#1a1c1d] border-[#262626]';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(alert.rawPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'unacknowledged':
        return { label: 'Unacknowledged', color: 'bg-[#ffb4ab]', textColor: 'text-[#ffb4ab]' };
      case 'acknowledged':
        return { label: 'Acknowledged', color: 'bg-[#4ade80]', textColor: 'text-[#4ade80]' };
      case 'resolved':
        return { label: 'Resolved', color: 'bg-[#8c909f]', textColor: 'text-[#8c909f]' };
      default:
        return { label: 'Unknown', color: 'bg-[#8c909f]', textColor: 'text-[#8c909f]' };
    }
  };

  const statusConfig = getStatusConfig();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
    // Alternatively, use: navigate('/home/alerts') for a specific route
  };

  return (
    <div className="bg-[#121415] text-[#e2e2e3] min-h-screen w-full antialiased">
      {/* Main Content */}
      <div className="w-full">
        {/* Page Header Area with Back Button */}
        <div className="px-6 md:px-8 pt-6 pb-4 border-b border-[#424753]">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-[#c2c6d6] hover:text-[#e2e2e3] transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[13px] font-medium">Back to Alerts</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Severity Badge */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#93000a]/10 text-[#ffb4ab] font-mono text-[10px] uppercase font-semibold border border-[#ffb4ab]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
                Critical
              </span>
              
              {/* Alert ID */}
              <span className="font-mono text-[#c2c6d6] text-[12px]">
                #{alert.id}
              </span>
              
              <span className="text-[#c2c6d6] text-[12px]">•</span>
              
              {/* Timestamp */}
              <span className="text-[#c2c6d6] text-[12px] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {alert.timestamp}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-[24px] leading-[32px] tracking-[-0.02em] font-semibold text-[#e2e2e3]">
              {alert.title}
            </h1>
            
            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-[#1e2021] py-1 px-2.5 rounded-sm border border-[#424753]">
                <Server className="w-3.5 h-3.5 text-[#c2c6d6]" />
                <span className="text-[11px] font-medium text-[#c2c6d6] uppercase">Source:</span>
                <span className="text-[13px] leading-[18px] font-medium text-[#e2e2e3]">
                  {alert.source}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1e2021] py-1 px-2.5 rounded-sm border border-[#424753]">
                <Globe className="w-3.5 h-3.5 text-[#c2c6d6]" />
                <span className="text-[11px] font-medium text-[#c2c6d6] uppercase">Service:</span>
                <span className="text-[13px] leading-[18px] font-medium text-[#e2e2e3]">
                  {alert.service}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Description Panel */}
              <section className="bg-[#141414] border border-[#424753] rounded-lg">
                <div className="px-5 py-3 border-b border-[#424753] bg-[#1a1c1d]">
                  <h2 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-[#e2e2e3]">
                    Description
                  </h2>
                </div>
                <div className="p-5 text-[#c2c6d6] text-[13px] leading-[18px] font-medium space-y-3">
                  {alert.description.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </section>

              {/* Raw Payload Panel */}
              <section className="bg-[#141414] border border-[#424753] rounded-lg flex flex-col">
                <div className="px-5 py-3 border-b border-[#424753] bg-[#1a1c1d] flex justify-between items-center">
                  <h2 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-[#e2e2e3] flex items-center gap-2">
                    <FileText className="w-[18px] h-[18px]" />
                    Raw Payload
                  </h2>
                  <button
                    onClick={copyToClipboard}
                    className="text-[#c2c6d6] hover:text-[#e2e2e3] transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-[11px] font-mono">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 bg-[#0c0e0f] overflow-x-auto">
                  <pre className="font-mono text-[11px] leading-[16px] text-[#c2c6d6] whitespace-pre-wrap">
                    {JSON.stringify(alert.rawPayload, null, 2)}
                  </pre>
                </div>
              </section>

              {/* Event Timeline Panel */}
              <section className="bg-[#141414] border border-[#424753] rounded-lg">
                <div className="px-5 py-3 border-b border-[#424753] bg-[#1a1c1d]">
                  <h2 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-[#e2e2e3]">
                    Event Timeline
                  </h2>
                </div>
                <div className="p-5">
                  <div className="relative border-l border-[#424753] ml-3 space-y-5">
                    {timeline.map((item) => (
                      <div key={item.id} className="relative pl-6">
                        <div className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full ${getTimelineColor(item.type)} border flex items-center justify-center`}>
                          {getTimelineIcon(item.type)}
                        </div>
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <span className="text-[14px] leading-[20px] font-medium text-[#e2e2e3]">
                            {item.title}
                          </span>
                          <span className="font-mono text-[11px] text-[#8c909f]">
                            {item.time}
                          </span>
                        </div>
                        <div className="text-[12px] leading-[16px] text-[#c2c6d6]">
                          {item.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Actions & Meta */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Quick Actions */}
              <section className="bg-[#141414] border border-[#424753] rounded-lg p-5 flex flex-col gap-3">
                <button className="w-full flex items-center justify-center gap-2 bg-[#afc6ff] hover:bg-[#528dff] text-[#00275f] py-2.5 px-4 rounded text-[13px] font-semibold transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  Acknowledge Alert
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#333536] border border-[#424753] text-[#afc6ff] py-2 px-3 rounded text-[12px] font-medium transition-colors">
                    <ArrowUpCircle className="w-4 h-4" />
                    Escalate
                  </button>
                  <button className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#333536] border border-[#424753] text-[#e2e2e3] py-2 px-3 rounded text-[12px] font-medium transition-colors">
                    <BellOff className="w-4 h-4" />
                    Mute
                  </button>
                </div>
              </section>

              {/* Status & Assignment */}
              <section className="bg-[#141414] border border-[#424753] rounded-lg">
                <div className="px-5 py-3 border-b border-[#424753] bg-[#1a1c1d]">
                  <h3 className="text-[16px] leading-[24px] tracking-[-0.01em] font-semibold text-[#e2e2e3]">
                    Details
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  {/* Status Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-[#c2c6d6] uppercase tracking-wider">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full appearance-none bg-[#1e2021] border border-[#424753] rounded p-2 text-[13px] text-[#e2e2e3] focus:border-[#afc6ff] focus:outline-none cursor-pointer"
                      >
                        <option value="unacknowledged">Unacknowledged</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c2c6d6] pointer-events-none" />
                    </div>
                  </div>

                  {/* Assigned Responder */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-[#c2c6d6] uppercase tracking-wider">
                      Responder
                    </label>
                    <div className="flex items-center gap-3 p-2 border border-transparent hover:border-[#424753] rounded transition-colors cursor-pointer group">
                      <div className="w-8 h-8 rounded-full bg-[#968ab5] text-[#2d2447] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        <img
                          alt="Alex Chen"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB865BZxJGhIGhfAWK2797XEqoz4nm0WiasyU92sqD4kNDPe4G2HsnD_zQAb8_LuyEzCbdYBNB264dedjNHemHnAkk_5Hn422TVcELQ9SGU2lA6baxRKcBjsVRmRfCfg_GVf60j98_cOEn3w9rGzah658qc4f_d06NSHyvWfgAly54plHUsSB3cDEa4uAoHpn0Bqhvs3YGrKhfqgQuwAIolJaxTBdhDHY_PvxxXq5QI0J_9yVtda-_2ja2sQJklKlXQlvinJb5RC-aA"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] leading-[18px] font-medium text-[#e2e2e3] group-hover:text-[#afc6ff] transition-colors">
                          Alex Chen
                        </span>
                        <span className="font-mono text-[10px] text-[#c2c6d6]">
                          Primary On-Call
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Properties List */}
                  <div className="pt-3 border-t border-[#424753] flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-medium text-[#c2c6d6] uppercase tracking-wider">
                        Priority
                      </span>
                      <span className="text-[13px] leading-[18px] font-medium text-[#e2e2e3] font-semibold">
                        P1
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-medium text-[#c2c6d6] uppercase tracking-wider">
                        Environment
                      </span>
                      <span className="text-[13px] leading-[18px] font-medium text-[#e2e2e3]">
                        Production
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardAlertDetail;