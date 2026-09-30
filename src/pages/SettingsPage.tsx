import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  Trash2,
  Download,
  Shield,
  User,
  Database,
  CheckCircle2
} from 'lucide-react';
import { useAgentGate } from '../context/AgentGateContext';

export const SettingsPage: React.FC = () => {
  const {
    user,
    theme,
    toggleTheme,
    aiExplanationEnabled,
    toggleAiExplanation,
    resetToDemoData,
    clearAllData,
    exportAuditData,
    auditLogs,
    agents
  } = useAgentGate();

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetToDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure security policies, system appearance, and local evaluation data.
        </p>
      </div>

      {/* Profile Section */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          <span>Operator Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850">
            <span className="text-zinc-500 block">Operator Name</span>
            <span className="font-semibold text-zinc-200 text-sm mt-0.5 block">
              {user?.displayName || 'Anonymous Operator'}
            </span>
          </div>

          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850">
            <span className="text-zinc-500 block">Identifier / Email</span>
            <span className="font-mono text-zinc-200 text-sm mt-0.5 block">
              {user?.email || 'operator@agentgate.security'}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-emerald-400" />}
          <span>Appearance &amp; Display</span>
        </h3>

        <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-850">
          <div>
            <div className="text-xs font-semibold text-zinc-200">Color Theme</div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Switch between cybersecurity dark mode (default) and standard light mode.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            <span className="capitalize">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Security & AI Features */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI Explanation Mode</span>
        </h3>

        <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-850">
          <div>
            <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
              <span>Gemini AI Insights &amp; Plain-English Explanations</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                Optional
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              When enabled, Gemini analyzes action requests and explains the security risk in simple, beginner-friendly terms.
              Important: Gemini cannot override BLOCK policies. The permission engine remains 100% deterministic.
            </p>
          </div>

          <button
            onClick={toggleAiExplanation}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border transition-all ${
              aiExplanationEnabled
                ? 'bg-purple-950 text-purple-300 border-purple-500/50 shadow-xs'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            {aiExplanationEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Audit Data &amp; Sandbox Environment</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export Box */}
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-200">Export Audit Trail</div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Download your complete activity log ({auditLogs.length} events) locally for offline analysis or compliance audits.
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => exportAuditData('csv')}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => exportAuditData('json')}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Reset Box */}
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-200">Reset Demo Data</div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Restore the default demo agents (Research Agent, Coding Agent, Study Agent) and realistic initial logs.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="py-1.5 px-3 rounded-lg text-xs font-medium bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
              {resetSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Restored!</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Clear All Data */}
        <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-400">Clear All Local Data</div>
            <p className="text-[11px] text-zinc-500">
              Wipes all agents, action requests, and logs stored in local session.
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all data?')) {
                clearAllData();
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
};
