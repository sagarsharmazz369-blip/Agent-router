import React, { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  PlayCircle,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  FileClock,
  Plus,
  Eye,
  Sparkles
} from 'lucide-react';
import { useAgentGate } from '../context/AgentGateContext';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { SimulationBadge } from '../components/common/SimulationBadge';
import { Modal } from '../components/common/Modal';
import { AuditLog } from '../types';
import { getActionExplanation } from '../services/geminiService';

interface DashboardPageProps {
  onNavigate: (route: string, param?: string) => void;
  onOpenCreateAgent: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenCreateAgent
}) => {
  const { stats, securityPosture, actionRequests, agents, auditLogs } = useAgentGate();

  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const pendingRequests = actionRequests.filter(r => r.status === 'pending');
  // Newest events first
  const recentLogs = auditLogs.slice(0, 6);

  const handleInspect = (log: AuditLog) => {
    setInspectLog(log);
    setAiExplanation(null);
  };

  const handleExplain = async () => {
    if (!inspectLog) return;
    setIsExplaining(true);
    try {
      const expl = await getActionExplanation({
        agentName: inspectLog.agentName,
        toolName: inspectLog.toolName,
        action: inspectLog.action,
        target: inspectLog.target,
        riskLevel: inspectLog.riskLevel,
        decision: inspectLog.decision,
        reason: inspectLog.reason
      });
      setAiExplanation(expl);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Control Center
            </h1>
            <SimulationBadge subtle />
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time policy enforcement and activity monitoring for autonomous agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('simulator')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            <span>Simulate Action</span>
          </button>

          <button
            onClick={onOpenCreateAgent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors shadow-xs shadow-emerald-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create Agent</span>
          </button>
        </div>
      </div>

      {/* Top 5 Statistics Cards (Data-driven from real state) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatsCard
          label="Total Agents"
          value={stats.totalAgents}
          subtext="registered"
          icon={Bot}
          color="zinc"
          onClick={() => onNavigate('agents')}
        />
        <StatsCard
          label="Active Agents"
          value={stats.activeAgents}
          subtext="online"
          icon={Bot}
          color="emerald"
          onClick={() => onNavigate('agents')}
        />
        <StatsCard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          subtext="awaiting review"
          icon={AlertTriangle}
          color={stats.pendingApprovals > 0 ? 'amber' : 'zinc'}
          onClick={() => onNavigate('approvals')}
        />
        <StatsCard
          label="Actions Today"
          value={stats.actionsToday}
          subtext="monitored"
          icon={FileClock}
          color="cyan"
          onClick={() => onNavigate('activity')}
        />
        <StatsCard
          label="Blocked Actions"
          value={stats.blockedActions}
          subtext="prevented"
          icon={ShieldX}
          color={stats.blockedActions > 0 ? 'rose' : 'zinc'}
          onClick={() => onNavigate('activity')}
        />
      </div>

      {/* Security Overview & Action Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Activity Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Live Activity Timeline</h3>
              </div>
              <button
                onClick={() => onNavigate('activity')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>View All Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  Agent activity will appear here. Run a test action in the Simulator to generate events.
                </div>
              ) : (
                recentLogs.map((log, idx) => {
                  const isRecent = idx === 0 && (Date.now() - new Date(log.createdAt || log.timestamp).getTime() < 15000);
                  return (
                    <div
                      key={log.id}
                      onClick={() => handleInspect(log)}
                      className={`p-3.5 rounded-lg transition-all duration-300 cursor-pointer flex items-start justify-between gap-3 group ${
                        isRecent
                          ? 'bg-zinc-900 border border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/20'
                          : 'bg-zinc-950/80 border border-zinc-850 hover:border-zinc-750'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-zinc-200">{log.agentName}</span>
                          <span className="text-zinc-600 text-xs">•</span>
                          <span className="font-mono text-xs text-zinc-400">{log.toolName}</span>
                          <Badge type="decision" value={log.decision} size="sm" />
                          <Badge type="status" value={log.status} size="sm" />
                          {isRecent && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-300 mt-1.5 font-mono text-[11px] truncate">
                          {log.action} {log.target && <span className="text-zinc-500">&rarr; {log.target}</span>}
                        </p>
                        <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-2">
                          <span className="font-mono">
                            {new Date(log.createdAt || log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-sm">{log.reason}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge type="risk" value={log.riskLevel} size="sm" />
                        <Eye className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Approvals Quick Alert Card (if any) */}
          {pendingRequests.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-200">
                    {pendingRequests.length} Sensitive Action{pendingRequests.length > 1 ? 's' : ''} Require Human Review
                  </h4>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    Agents are waiting for authorization before executing their tools.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('approvals')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-black transition-colors shrink-0"
              >
                Review Now
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Security Posture & Active Agents (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Security Overview */}
          <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Security Posture</h3>
              </div>
              {securityPosture.hasData ? (
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {securityPosture.coveragePercentage}% Policy Coverage
                </span>
              ) : (
                <span className="text-xs text-zinc-500">No agents yet</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xs text-emerald-400 font-mono font-bold">
                  {stats.allowedActions}
                </div>
                <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold mt-0.5">
                  Allowed
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs text-amber-400 font-mono font-bold">
                  {stats.pendingApprovals}
                </div>
                <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold mt-0.5">
                  Needs Approval
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <div className="text-xs text-rose-400 font-mono font-bold">
                  {stats.blockedActions}
                </div>
                <div className="text-[10px] text-rose-300 uppercase tracking-wider font-semibold mt-0.5">
                  Blocked
                </div>
              </div>
            </div>

            {/* Recommendations preview */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Policy Health:
              </span>
              {securityPosture.recommendations.slice(0, 2).map(rec => (
                <div
                  key={rec.id}
                  className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 text-xs flex items-start gap-2"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      rec.level === 'critical'
                        ? 'bg-rose-400'
                        : rec.level === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-zinc-200 block text-[11px]">{rec.title}</span>
                    <span className="text-zinc-400 text-[10px] leading-relaxed block">{rec.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Agents */}
          <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Registered Agents</h3>
              </div>
              <button
                onClick={() => onNavigate('agents')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2">
              {agents.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  No agents registered yet. Click "+ Create Agent" to begin.
                </div>
              ) : (
                agents.map(a => (
                  <div
                    key={a.id}
                    onClick={() => onNavigate('agent_detail', a.id)}
                    className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-700 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300">
                        <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-200 truncate">{a.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {a.tools.length} capabilities • {a.status}
                        </div>
                      </div>
                    </div>

                    <Badge type="status" value={a.status} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inspector Modal for Event in Timeline */}
      {inspectLog && (
        <Modal
          isOpen={true}
          onClose={() => setInspectLog(null)}
          title="Timeline Event Inspection"
          subtitle={`Event ID: ${inspectLog.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Badge type="decision" value={inspectLog.decision} />
                <Badge type="status" value={inspectLog.status} />
                <Badge type="risk" value={inspectLog.riskLevel} />
              </div>
              <SimulationBadge subtle />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">AGENT</span>
                <span className="font-semibold text-zinc-200 truncate block">{inspectLog.agentName}</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">TOOL</span>
                <span className="text-zinc-200 truncate block">{inspectLog.toolName}</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">DECISION</span>
                <Badge type="decision" value={inspectLog.decision} size="sm" />
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">STATUS</span>
                <Badge type="status" value={inspectLog.status} size="sm" />
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">RISK</span>
                <Badge type="risk" value={inspectLog.riskLevel} size="sm" />
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">SIMULATION</span>
                <span className="font-bold text-cyan-400">
                  {inspectLog.simulation !== false ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">TIMESTAMP</span>
                <span className="text-zinc-300 text-[11px]">
                  {new Date(inspectLog.createdAt || inspectLog.timestamp).toLocaleTimeString()} ({new Date(inspectLog.createdAt || inspectLog.timestamp).toLocaleDateString()})
                </span>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">Action Description</span>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 font-mono text-zinc-200">
                {inspectLog.action}
              </div>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">Reason / Justification</span>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-300">
                {inspectLog.reason}
              </div>
            </div>

            {/* AI Explanation in Timeline Inspector */}
            <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Gemini Security Explanation</span>
                </div>
                {!aiExplanation && (
                  <button
                    onClick={handleExplain}
                    disabled={isExplaining}
                    className="text-[11px] px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 disabled:opacity-50"
                  >
                    {isExplaining ? 'Explaining...' : 'Explain in Plain English'}
                  </button>
                )}
              </div>
              {aiExplanation && (
                <p className="text-zinc-300 leading-relaxed pt-1">
                  {aiExplanation}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
