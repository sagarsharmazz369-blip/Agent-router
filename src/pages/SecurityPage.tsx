import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldX, CheckCircle2, Bot, ArrowRight, Lock } from 'lucide-react';
import { useAgentGate } from '../context/AgentGateContext';

interface SecurityPageProps {
  onNavigate: (route: string) => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({ onNavigate }) => {
  const { securityPosture, stats } = useAgentGate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Security Posture
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time compliance audit computed strictly from current agent policy definitions and audit events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {securityPosture.hasData ? (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              {securityPosture.coveragePercentage}% Policy Explicit Coverage
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
              No Agent Policies Configured
            </div>
          )}
        </div>
      </div>

      {/* Real Data Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Policy Coverage (configured permissions / total required permissions) */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold">
            Policy Coverage
          </span>
          <div className="flex items-baseline gap-2">
            {securityPosture.hasData ? (
              <span className="text-3xl font-bold font-mono text-zinc-100">
                {securityPosture.coveragePercentage}%
              </span>
            ) : (
              <span className="text-xl font-bold font-mono text-zinc-500">
                No Data
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Calculated as explicit configured permissions / assigned capability tools.
          </p>
        </div>

        {/* Allowed actions */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold">
            Allowed Actions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {stats.allowedActions}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Pre-approved or operator-authorized executions recorded in audit log.
          </p>
        </div>

        {/* Pending approvals */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold">
            Pending Approvals
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-400">
              {stats.pendingApprovals}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Sensitive actions currently halted awaiting human review.
          </p>
        </div>

        {/* Blocked actions */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold">
            Blocked Actions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-rose-400">
              {stats.blockedActions}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Unauthorized, unassigned, or destructive invocations halted.
          </p>
        </div>
      </div>

      {/* Security Health Analysis & Recommendations */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Active Security Findings &amp; Recommendations</span>
        </h3>
        <p className="text-xs text-zinc-400">
          Evaluated dynamically from your actual active agents and permission policies:
        </p>

        <div className="space-y-3 pt-2">
          {securityPosture.recommendations.map(rec => (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                rec.level === 'critical'
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  : rec.level === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : rec.level === 'good'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {rec.level === 'good' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : rec.level === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldX className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">{rec.title}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{rec.message}</p>
                </div>
              </div>

              {rec.actionable && rec.fixAction && (
                <button
                  onClick={() => onNavigate(rec.fixAction!.replace('/', ''))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Principle of Least Privilege Notice */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
        <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Core Security Philosophy: Least-Privilege</span>
        </h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
          AgentGate enforces strict zero-trust boundaries between AI agents and executable tools.
          Even if an LLM is prompted to perform arbitrary actions, AgentGate evaluates the requesting agent,
          the requested tool code, and explicit policy configurations deterministically before executing in the simulation sandbox.
        </p>
      </div>
    </div>
  );
};
