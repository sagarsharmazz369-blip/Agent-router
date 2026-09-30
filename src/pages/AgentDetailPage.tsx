import React, { useState } from 'react';
import {
  Bot,
  ArrowLeft,
  PlayCircle,
  Pause,
  Play,
  Trash2,
  Copy,
  Layers,
  Shield,
  FileClock,
  Clock,
  Sparkles,
  Check,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  Edit3
} from 'lucide-react';
import { useAgentGate } from '../context/AgentGateContext';
import { SYSTEM_TOOLS, getRiskColor } from '../lib/toolsRegistry';
import { PermissionLevel } from '../types';
import { Badge } from '../components/common/Badge';
import { SimulationBadge } from '../components/common/SimulationBadge';
import { EditAgentModal } from '../components/agents/EditAgentModal';

interface AgentDetailPageProps {
  agentId: string;
  onBack: () => void;
  onTestAction: (agentId: string) => void;
}

export const AgentDetailPage: React.FC<AgentDetailPageProps> = ({
  agentId,
  onBack,
  onTestAction
}) => {
  const {
    agents,
    updateAgent,
    deleteAgent,
    toggleAgentPause,
    duplicateAgent,
    auditLogs
  } = useAgentGate();

  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'tools' | 'activity'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  const agent = agents.find(a => a.id === agentId);

  if (!agent) {
    return (
      <div className="p-12 text-center bg-zinc-900 rounded-2xl border border-zinc-800 space-y-4">
        <Bot className="w-10 h-10 text-zinc-600 mx-auto" />
        <h3 className="text-base font-semibold text-zinc-200">Agent not found</h3>
        <p className="text-xs text-zinc-400">This agent may have been removed or does not exist.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs"
        >
          Return to Agents
        </button>
      </div>
    );
  }

  const isPaused = (agent.status || '').toUpperCase() === 'PAUSED';
  const agentLogs = auditLogs.filter(l => l.agentId === agent.id);

  const handleDuplicate = () => {
    const dup = duplicateAgent(agent.id);
    if (dup) onBack();
  };

  const handlePermissionChange = (toolCode: string, level: PermissionLevel | 'DEFAULT') => {
    const codeUpper = toolCode.toUpperCase();
    const nextPerms = { ...agent.permissions };
    if (level === 'DEFAULT') {
      delete nextPerms[codeUpper];
      delete nextPerms[toolCode];
    } else {
      nextPerms[codeUpper] = level;
    }
    updateAgent({
      ...agent,
      permissions: nextPerms
    });
  };

  const handleToggleToolAssignment = (toolCode: string) => {
    const codeUpper = toolCode.toUpperCase();
    const isAssigned = agent.tools.map(t => t.toUpperCase()).includes(codeUpper);
    let nextTools: string[];
    let nextPerms = { ...agent.permissions };

    if (isAssigned) {
      nextTools = agent.tools.filter(t => t.toUpperCase() !== codeUpper);
      delete nextPerms[codeUpper];
    } else {
      nextTools = [...agent.tools, codeUpper];
      const tool = SYSTEM_TOOLS.find(t => t.code.toUpperCase() === codeUpper);
      nextPerms[codeUpper] = tool?.defaultPermission || 'ASK';
    }

    updateAgent({
      ...agent,
      tools: nextTools,
      permissions: nextPerms
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agents</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onTestAction(agent.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors shadow-xs shadow-emerald-500/20"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Test Action</span>
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => toggleAgentPause(agent.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={handleDuplicate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${agent.name}"?`)) {
                deleteAgent(agent.id);
                onBack();
              }
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100">{agent.name}</h1>
              <Badge type="status" value={agent.status} size="sm" />
              <SimulationBadge subtle />
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">{agent.description}</p>
            <div className="flex items-center gap-4 text-[11px] text-zinc-500 mt-2 font-mono">
              <span>Created: {new Date(agent.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Updated: {new Date(agent.updatedAt || agent.createdAt).toLocaleTimeString()}</span>
              <span>•</span>
              <span>Last Active: {new Date(agent.lastActivityAt || agent.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-850 shrink-0">
          <div className="text-center px-3 py-1 border-r border-zinc-850">
            <div className="text-xs font-bold font-mono text-zinc-200">{agent.tools.length}</div>
            <div className="text-[10px] text-zinc-500 uppercase">Capabilities</div>
          </div>
          <div className="text-center px-3 py-1 border-r border-zinc-850">
            <div className="text-xs font-bold font-mono text-emerald-400">
              {agentLogs.filter(l => l.decision === 'ALLOW' || l.status === 'executed').length}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase">Allowed</div>
          </div>
          <div className="text-center px-3 py-1">
            <div className="text-xs font-bold font-mono text-rose-400">
              {agentLogs.filter(l => l.decision === 'BLOCK' || l.status === 'blocked').length}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase">Blocked</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 flex items-center gap-2">
        {[
          { id: 'overview', label: 'Overview & Matrix', icon: Layers },
          { id: 'permissions', label: 'Policy Matrix', icon: Shield },
          { id: 'tools', label: 'Assigned Capabilities', icon: Bot },
          { id: 'activity', label: 'Action History', icon: FileClock, badge: agentLogs.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                isActive
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Overview & Matrix */}
      {(activeTab === 'overview' || activeTab === 'permissions') && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Explicit Permission Policies
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Change tool policy levels directly. Changes take effect on the next evaluation.
                </p>
              </div>
            </div>

            {agent.tools.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No tools assigned yet. Go to the "Assigned Capabilities" tab to add tools.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden">
                  <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase tracking-wider text-[11px] border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Tool Capability</th>
                      <th className="py-3 px-4">Risk Level</th>
                      <th className="py-3 px-4">Permission</th>
                      <th className="py-3 px-4 text-right">Policy Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {agent.tools.map(toolCode => {
                      const codeUpper = toolCode.toUpperCase();
                      const tool = SYSTEM_TOOLS.find(t => t.code.toUpperCase() === codeUpper);
                      const explicitPerm = agent.permissions[codeUpper] || agent.permissions[toolCode];
                      const defaultDecision: PermissionLevel = tool ? (
                        tool.riskLevel === 'low' ? 'ALLOW' :
                        tool.riskLevel === 'critical' ? 'BLOCK' : 'ASK'
                      ) : 'ASK';
                      const effectiveDecision = explicitPerm || defaultDecision;

                      return (
                        <tr key={toolCode} className="hover:bg-zinc-850/30 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-zinc-200">
                            <div>{tool?.name || toolCode}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{toolCode}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge type="risk" value={tool?.riskLevel || 'low'} size="sm" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Badge type="decision" value={effectiveDecision} size="sm" />
                              {!explicitPerm && (
                                <span className="text-[10px] font-mono text-zinc-500">
                                  (Default)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                              <button
                                type="button"
                                onClick={() => handlePermissionChange(toolCode, 'DEFAULT')}
                                className={`px-2 py-1 text-[10px] font-mono font-medium rounded transition-all border ${
                                  !explicitPerm
                                    ? 'bg-zinc-800 text-zinc-200 border-zinc-600'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
                                }`}
                                title="No explicit override (uses risk-based default)"
                              >
                                DEFAULT
                              </button>
                              {(['ALLOW', 'ASK', 'BLOCK'] as PermissionLevel[]).map(level => {
                                const isSelected = explicitPerm === level;
                                let activeClasses = '';
                                if (level === 'ALLOW') activeClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                                if (level === 'ASK') activeClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                                if (level === 'BLOCK') activeClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                                return (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => handlePermissionChange(toolCode, level)}
                                    className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded transition-all border ${
                                      isSelected
                                        ? activeClasses
                                        : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                                    }`}
                                  >
                                    {level}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Tools Management */}
      {activeTab === 'tools' && (
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-100">Capability Tool Assignment</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Assign or unassign standard tools from this agent's authorized capability registry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SYSTEM_TOOLS.map(tool => {
              const isAssigned = agent.tools.map(t => t.toUpperCase()).includes(tool.code.toUpperCase());
              return (
                <div
                  key={tool.code}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                    isAssigned
                      ? 'bg-zinc-950 border-emerald-500/40'
                      : 'bg-zinc-950/40 border-zinc-850 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-200">{tool.name}</span>
                      <Badge type="risk" value={tool.riskLevel} size="sm" />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleToolAssignment(tool.code)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                      isAssigned
                        ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/60'
                        : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                    }`}
                  >
                    {isAssigned ? 'Remove' : 'Assign'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Action History */}
      {activeTab === 'activity' && (
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-100 pb-3 border-b border-zinc-800">
            Action History for {agent.name}
          </h3>

          {agentLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Agent activity will appear here when this agent runs actions in the simulator.
            </div>
          ) : (
            <div className="space-y-2">
              {agentLogs.map(l => (
                <div
                  key={l.id}
                  className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-300">{l.toolName}</span>
                      <Badge type="decision" value={l.decision} size="sm" />
                      <Badge type="status" value={l.status} size="sm" />
                    </div>
                    <p className="text-zinc-400 font-mono text-[11px] mt-1 truncate">
                      {l.action} {l.target && `→ ${l.target}`}
                    </p>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                    {new Date(l.createdAt || l.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <EditAgentModal
          agent={agent}
          isOpen={true}
          onClose={() => setIsEditing(false)}
          onSave={updated => {
            updateAgent(updated);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
};
