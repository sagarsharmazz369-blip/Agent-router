import React, { useState, useEffect } from 'react';
import {
  Play,
  Bot,
  Wrench,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  Sparkles,
  FlaskConical,
  RefreshCw,
  Info,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { useAgentGate } from '../../context/AgentGateContext';
import { PermissionLevel } from '../../types';
import { SYSTEM_TOOLS, getToolByCode } from '../../lib/toolsRegistry';
import { evaluatePermission } from '../../lib/permissionEngine';
import { Badge } from '../common/Badge';
import { SimulationBadge } from '../common/SimulationBadge';
import { Modal } from '../common/Modal';
import { getActionExplanation } from '../../services/geminiService';

interface ActionPlaygroundProps {
  initialAgentId?: string;
  onNavigateToApprovals?: () => void;
  onNavigateToActivity?: () => void;
}

export const ActionPlayground: React.FC<ActionPlaygroundProps> = ({
  initialAgentId,
  onNavigateToApprovals,
  onNavigateToActivity
}) => {
  const { agents, runActionSimulation, approveAction, rejectAction, updateAgent, toggleAgentPause } = useAgentGate();

  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    initialAgentId || agents[0]?.id || ''
  );
  const [selectedToolCode, setSelectedToolCode] = useState<string>('SEND_MESSAGE');
  const [actionDescription, setActionDescription] = useState<string>(
    'Send competitor research summary report to founder@startup.io'
  );
  const [target, setTarget] = useState<string>('founder@startup.io');
  const [reason, setReason] = useState<string>(
    'Agent completed intelligence gathering on target sector.'
  );

  const [lastResult, setLastResult] = useState<any | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Sync if initialAgentId or agents change
  useEffect(() => {
    if (initialAgentId) {
      setSelectedAgentId(initialAgentId);
    } else if (agents.length > 0 && (!selectedAgentId || !agents.some(a => a.id === selectedAgentId))) {
      setSelectedAgentId(agents[0].id);
    }
  }, [initialAgentId, agents, selectedAgentId]);

  const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Quick preset templates
  const presets = [
    {
      title: 'Send Outbound Email (ASK)',
      agentName: 'Research Agent',
      tool: 'SEND_MESSAGE',
      action: 'Transmit executive brief on seed round to founder@stealth.ai',
      target: 'founder@stealth.ai',
      reason: 'Agent wants to distribute research to an external human recipient.'
    },
    {
      title: 'Delete Production Database (BLOCK)',
      agentName: 'Coding Agent',
      tool: 'DELETE_DATA',
      action: 'Drop obsolete table backup_users_legacy_2025',
      target: 'prod_db.backup_users_legacy_2025',
      reason: 'Automated disk space reclamation script.'
    },
    {
      title: 'Search Academic Benchmarks (ALLOW)',
      agentName: 'Study Agent',
      tool: 'WEB_SEARCH',
      action: 'Query arXiv API for reasoning transformer benchmarks',
      target: 'arXiv Search Endpoint',
      reason: 'Gathering citations for literature survey.'
    },
    {
      title: 'Write Configuration File (ASK)',
      agentName: 'Coding Agent',
      tool: 'WRITE_FILE',
      action: 'Update environment configuration in /config/production.env',
      target: '/config/production.env',
      reason: 'Updating API timeout variables.'
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    const matchedAgent = agents.find(a => a.name.toLowerCase() === p.agentName.toLowerCase());
    if (matchedAgent) setSelectedAgentId(matchedAgent.id);
    setSelectedToolCode(p.tool);
    setActionDescription(p.action);
    setTarget(p.target);
    setReason(p.reason);
    setLastResult(null);
    setAiExplanation(null);
  };

  // Preview deterministic evaluation in real-time
  const previewEvaluation = currentAgent
    ? evaluatePermission({
        agent: currentAgent,
        tool: selectedToolCode,
        requestedAction: actionDescription,
        target,
        userReason: reason
      })
    : null;

  const handleRunSimulation = () => {
    if (!currentAgent) return;
    setAiExplanation(null);

    const result = runActionSimulation({
      agentId: currentAgent.id,
      toolCode: selectedToolCode,
      action: actionDescription,
      target,
      reason
    });

    setLastResult(result);
    setIsResultModalOpen(true);
  };

  const handleExplainDecision = async () => {
    if (!lastResult && !previewEvaluation) return;
    setIsExplaining(true);
    try {
      const tool = getToolByCode(selectedToolCode);
      const expl = await getActionExplanation({
        agentName: currentAgent?.name || 'Agent',
        toolName: tool?.name || selectedToolCode,
        action: actionDescription,
        target,
        riskLevel: previewEvaluation?.riskLevel || 'medium',
        decision: previewEvaluation?.decision || 'ASK',
        reason: previewEvaluation?.reason || ''
      });
      setAiExplanation(expl);
    } finally {
      setIsExplaining(false);
    }
  };

  if (!currentAgent) {
    return (
      <div className="p-12 text-center bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
        <Bot className="w-10 h-10 text-zinc-600 mx-auto" />
        <h3 className="text-base font-semibold text-zinc-200">No agents registered</h3>
        <p className="text-xs text-zinc-400">
          Create an agent first to test simulated tool permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
              Action Simulator
            </h2>
            <SimulationBadge />
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Test how AgentGate enforces policies on agent actions. No real emails are sent, no actual files are touched, and no databases are deleted. Everything executes safely in an isolated simulation sandbox.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-zinc-500 hidden sm:inline">Quick Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.slice(0, 3).map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-[11px] px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-mono transition-colors"
              >
                {p.tool}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Select Agent &amp; Action</span>
            </h3>

            {/* Agent Select */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">
                  Requesting AI Agent
                </label>
                <div className="flex items-center gap-2">
                  <Badge type="status" value={currentAgent.status} size="sm" />
                  <button
                    type="button"
                    onClick={() => {
                      toggleAgentPause(currentAgent.id);
                      setLastResult(null);
                    }}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      currentAgent.status === 'PAUSED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    {currentAgent.status === 'PAUSED' ? 'Resume Agent' : 'Pause Agent'}
                  </button>
                </div>
              </div>
              <select
                value={selectedAgentId}
                onChange={e => {
                  setSelectedAgentId(e.target.value);
                  setLastResult(null);
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 outline-hidden focus:border-emerald-500"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.status}) — {a.tools.length} capabilities
                  </option>
                ))}
              </select>
            </div>

            {/* Tool Select */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Requested Capability Tool
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SYSTEM_TOOLS.map(t => {
                  const isAssigned = currentAgent?.tools.map(code => code.toUpperCase()).includes(t.code.toUpperCase());
                  const isSelected = selectedToolCode.toUpperCase() === t.code.toUpperCase();
                  return (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => {
                        setSelectedToolCode(t.code);
                        setLastResult(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-zinc-800 border-emerald-500/50 shadow-xs'
                          : 'bg-zinc-950/70 border-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-200 truncate">{t.name}</span>
                        <span className={`text-[9px] px-1 rounded uppercase font-mono ${
                          t.riskLevel === 'critical' ? 'text-rose-400 bg-rose-950/50' :
                          t.riskLevel === 'high' ? 'text-orange-400 bg-orange-950/50' :
                          t.riskLevel === 'medium' ? 'text-amber-400 bg-amber-950/50' :
                          'text-emerald-400 bg-emerald-950/50'
                        }`}>
                          {t.riskLevel}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1 flex items-center justify-between">
                        <span>{t.code}</span>
                        {!isAssigned && (
                          <span className="text-rose-400 text-[9px]">Unassigned</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Policy Matrix Selector for Selected Tool on Current Agent */}
            <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[11px] text-zinc-400 block font-mono">
                  Agent Policy for <strong className="text-zinc-200">{selectedToolCode}</strong>:
                </span>
                <span className="text-[11px] font-mono text-zinc-300">
                  {currentAgent.permissions?.[selectedToolCode.toUpperCase()] ? (
                    <span className="text-cyan-400 font-semibold">
                      Explicit: {currentAgent.permissions[selectedToolCode.toUpperCase()]}
                    </span>
                  ) : (
                    <span className="text-zinc-400">
                      No explicit policy (Default Risk: {
                        SYSTEM_TOOLS.find(t => t.code === selectedToolCode)?.riskLevel === 'low' ? 'ALLOW' :
                        SYSTEM_TOOLS.find(t => t.code === selectedToolCode)?.riskLevel === 'critical' ? 'BLOCK' : 'ASK'
                      })
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const nextPerms = { ...currentAgent.permissions };
                    delete nextPerms[selectedToolCode.toUpperCase()];
                    delete nextPerms[selectedToolCode];
                    updateAgent({ ...currentAgent, permissions: nextPerms });
                    setLastResult(null);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-all ${
                    !currentAgent.permissions?.[selectedToolCode.toUpperCase()]
                      ? 'bg-zinc-800 text-white border-zinc-600 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-200'
                  }`}
                  title="Remove explicit policy override (fallback to default risk rule)"
                >
                  DEFAULT
                </button>
                {(['ALLOW', 'ASK', 'BLOCK'] as PermissionLevel[]).map(lvl => {
                  const isCurrent = currentAgent.permissions?.[selectedToolCode.toUpperCase()] === lvl;
                  let activeStyle = '';
                  if (lvl === 'ALLOW') activeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
                  if (lvl === 'ASK') activeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
                  if (lvl === 'BLOCK') activeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';

                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        updateAgent({
                          ...currentAgent,
                          permissions: {
                            ...currentAgent.permissions,
                            [selectedToolCode.toUpperCase()]: lvl
                          }
                        });
                        setLastResult(null);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-all ${
                        isCurrent ? activeStyle : 'border-transparent text-zinc-500 hover:text-zinc-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Action Description (What the agent is attempting to do)
              </label>
              <textarea
                rows={3}
                value={actionDescription}
                onChange={e => {
                  setActionDescription(e.target.value);
                  setLastResult(null);
                }}
                placeholder="e.g. Transmit research summary to startup founder via email"
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Target and Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Target Destination / System
                </label>
                <input
                  type="text"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="e.g. founder@synthwave.io"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Agent Reason / Justification
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Finished intelligence gathering"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Trigger Button (Run Test) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunSimulation}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Test</span>
              </button>
            </div>
          </div>

          {/* Quick Presets Drawer */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono block mb-2">
              Pre-Configured Scenarios
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
                >
                  <div className="text-xs font-semibold text-zinc-200">{p.title}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{p.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Policy Decision Engine & Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Permission Evaluation Card */}
          <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Deterministic Policy Evaluation</span>
              </span>
              {previewEvaluation && (
                <Badge type="decision" value={previewEvaluation.decision} size="sm" />
              )}
            </div>

            {previewEvaluation && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Evaluated Risk:</span>
                  <Badge type="risk" value={previewEvaluation.riskLevel} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Rule Triggered:</span>
                  <span className="font-mono text-zinc-300 text-[11px]">
                    {previewEvaluation.ruleMatched}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 leading-relaxed">
                  <span className="text-zinc-500 font-mono text-[10px] block mb-1">EVALUATION JUSTIFICATION:</span>
                  {previewEvaluation.reason}
                </div>

                {/* Visual Flow diagram */}
                <div className="py-2 px-3 bg-zinc-950/80 rounded-lg border border-zinc-850 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="truncate max-w-[80px]">{currentAgent?.name || 'Agent'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span className="text-emerald-400 font-semibold shrink-0">AgentGate</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span
                    className={`font-bold shrink-0 ${
                      previewEvaluation.decision === 'ALLOW'
                        ? 'text-emerald-400'
                        : previewEvaluation.decision === 'ASK'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {previewEvaluation.decision}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 5 Outcomes Result Card */}
          {lastResult ? (
            <div
              className={`p-5 rounded-xl border space-y-4 animate-in fade-in duration-150 ${
                lastResult.decision === 'ALLOW'
                  ? 'bg-zinc-900 border-emerald-500/40 shadow-xs shadow-emerald-950/30'
                  : lastResult.decision === 'ASK'
                  ? 'bg-zinc-900 border-amber-500/40 shadow-xs shadow-amber-950/30'
                  : 'bg-zinc-900 border-rose-500/40 shadow-xs shadow-rose-950/30'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                {/* Section 5 Exact Headers: ✅ ACTION ALLOWED / ⚠️ APPROVAL REQUIRED / ❌ ACTION BLOCKED */}
                {lastResult.decision === 'ALLOW' && (
                  <span className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✅ ACTION ALLOWED</span>
                  </span>
                )}
                {lastResult.decision === 'ASK' && (
                  <span className="text-sm font-bold text-amber-300 font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>⚠️ APPROVAL REQUIRED</span>
                  </span>
                )}
                {lastResult.decision === 'BLOCK' && (
                  <span className="text-sm font-bold text-rose-400 font-mono flex items-center gap-1.5">
                    <ShieldX className="w-4 h-4 text-rose-400" />
                    <span>❌ ACTION BLOCKED</span>
                  </span>
                )}
                <SimulationBadge subtle />
              </div>

              {/* Exact format from Section 5 */}
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-2.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Agent:</span>
                  <span className="text-zinc-200 font-semibold">{lastResult.request.agentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tool:</span>
                  <span className="text-zinc-200">{lastResult.request.toolName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Decision:</span>
                  <Badge type="decision" value={lastResult.decision} size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Risk:</span>
                  <Badge type="risk" value={lastResult.request.riskLevel} size="sm" />
                </div>

                {/* For ALLOW: Execution: SIMULATION SUCCESSFUL */}
                {lastResult.decision === 'ALLOW' && (
                  <div className="pt-2 border-t border-zinc-850">
                    <div className="flex justify-between items-center text-emerald-400 font-semibold mb-1">
                      <span>Execution:</span>
                      <span className="bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                        SIMULATION SUCCESSFUL
                      </span>
                    </div>
                    {lastResult.request.executionResult && (
                      <p className="text-[11px] text-zinc-300 bg-zinc-900 p-2 rounded border border-zinc-800">
                        {lastResult.request.executionResult.output}
                      </p>
                    )}
                  </div>
                )}

                {/* For ASK: Status: PENDING REVIEW + Queued for operator review in Approval Center */}
                {lastResult.decision === 'ASK' && (
                  <div className="pt-2 border-t border-zinc-850 space-y-2">
                    <div className="flex justify-between items-center text-amber-300 font-semibold">
                      <span>Status:</span>
                      <span className="bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                        PENDING REVIEW
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/80 bg-amber-950/20 p-2 rounded border border-amber-500/20">
                      Queued for operator review in Approval Center
                    </p>
                    {onNavigateToApprovals && (
                      <button
                        type="button"
                        onClick={onNavigateToApprovals}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>[Go to Approval Center]</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* For BLOCK: Reason: Critical risk operations are blocked by system policy */}
                {lastResult.decision === 'BLOCK' && (
                  <div className="pt-2 border-t border-zinc-850">
                    <span className="text-rose-400 font-semibold block mb-1">Reason:</span>
                    <p className="text-[11px] text-rose-300 bg-rose-950/30 p-2 rounded border border-rose-500/20">
                      {lastResult.auditLog?.reason || lastResult.request?.reason || 'Critical risk operations are blocked by system policy'}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick in-place simulated actions */}
              {lastResult.decision === 'ASK' && lastResult.request.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      approveAction(lastResult.request.id);
                      setLastResult({
                        ...lastResult,
                        request: {
                          ...lastResult.request,
                          status: 'executed',
                          executionResult: {
                            success: true,
                            output: 'Simulated execution completed: Manual approval granted in sandbox.',
                            executedAt: new Date().toISOString()
                          }
                        }
                      });
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Test</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      rejectAction(lastResult.request.id, 'Disallowed in simulator playground');
                      setLastResult({
                        ...lastResult,
                        request: { ...lastResult.request, status: 'rejected' }
                      });
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {/* View in Activity button */}
              {onNavigateToActivity && (
                <button
                  type="button"
                  onClick={onNavigateToActivity}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-colors flex items-center justify-center gap-1"
                >
                  <span>View in Activity Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Explain Decision with Gemini */}
              <div className="pt-2 border-t border-zinc-800">
                {!aiExplanation ? (
                  <button
                    type="button"
                    onClick={handleExplainDecision}
                    disabled={isExplaining}
                    className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isExplaining ? 'Generating Explanation...' : 'Explain Decision with Gemini AI'}</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-zinc-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini Policy Explanation</span>
                    </div>
                    <p className="leading-relaxed pt-1 text-[11px] font-sans">{aiExplanation}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-zinc-950/60 border border-zinc-800/80 border-dashed text-center">
              <FlaskConical className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-zinc-400">Simulator Ready</div>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                Configure your agent and click "Run Test" to evaluate the action against the permission engine.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Immediate Visible Result Modal (Section 5) */}
      {isResultModalOpen && lastResult && (
        <Modal
          isOpen={true}
          onClose={() => setIsResultModalOpen(false)}
          title={
            lastResult.decision === 'ALLOW'
              ? '✅ ACTION ALLOWED'
              : lastResult.decision === 'ASK'
              ? '⚠️ APPROVAL REQUIRED'
              : '❌ ACTION BLOCKED'
          }
          subtitle={`Evaluated via Deterministic Permission Engine`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Agent:</span>
                <span className="text-zinc-200 font-semibold">{lastResult.request.agentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tool:</span>
                <span className="text-zinc-200">{lastResult.request.toolName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Decision:</span>
                <Badge type="decision" value={lastResult.decision} size="sm" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Risk:</span>
                <Badge type="risk" value={lastResult.request.riskLevel} size="sm" />
              </div>

              {lastResult.decision === 'ALLOW' && (
                <div className="pt-2 border-t border-zinc-850">
                  <div className="flex justify-between items-center text-emerald-400 font-bold mb-1">
                    <span>Execution:</span>
                    <span>SIMULATION SUCCESSFUL</span>
                  </div>
                  {lastResult.request.executionResult && (
                    <p className="text-[11px] text-zinc-300 bg-zinc-900 p-2 rounded">
                      {lastResult.request.executionResult.output}
                    </p>
                  )}
                </div>
              )}

              {lastResult.decision === 'ASK' && (
                <div className="pt-2 border-t border-zinc-850 space-y-2">
                  <div className="flex justify-between items-center text-amber-300 font-bold">
                    <span>Status:</span>
                    <span>PENDING REVIEW</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 bg-amber-950/30 p-2 rounded border border-amber-500/20">
                    Queued for operator review in Approval Center
                  </p>
                </div>
              )}

              {lastResult.decision === 'BLOCK' && (
                <div className="pt-2 border-t border-zinc-850">
                  <span className="text-rose-400 font-semibold block mb-1">Reason:</span>
                  <p className="text-[11px] text-rose-300 bg-rose-950/30 p-2 rounded">
                    {lastResult.auditLog?.reason || lastResult.request?.reason || 'Critical risk operations are blocked by system policy'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {lastResult.decision === 'ASK' && onNavigateToApprovals && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResultModalOpen(false);
                      onNavigateToApprovals();
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-1.5 transition-colors"
                  >
                    <span>[Go to Approval Center]</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {lastResult.decision === 'ALLOW' && onNavigateToActivity && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResultModalOpen(false);
                      onNavigateToActivity();
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition-colors"
                  >
                    <span>[View in Activity Log]</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
