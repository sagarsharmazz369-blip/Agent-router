import React from 'react';
import { ShieldCheck, Lock, EyeOff, Database, Server } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-3 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Security &amp; Privacy Notice
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Our commitments to least-privilege data architecture, simulation safety, and credential isolation.
        </p>
      </div>

      <div className="space-y-5 text-xs text-zinc-300 leading-relaxed">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>Zero Credential Exposure</span>
          </h2>
          <p>
            AgentGate strictly adheres to modern security standards: API keys, database credentials, and service account tokens are never exposed to or embedded within client-side application code.
          </p>
          <p>
            All AI explanation calls are either executed server-side via trusted environments or rendered with deterministic local explanations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Safe Isolated Simulation Sandbox</span>
          </h2>
          <p>
            In the MVP Evaluation Edition, all actions triggered in the Action Simulator are safely simulated within an isolated sandbox.
          </p>
          <p>
            No real emails are dispatched to external recipients, no production databases are mutated, and no filesystem destruction occurs. Every simulated event is clearly labeled with the <strong className="text-cyan-400 font-mono">SIMULATION</strong> tag so operators always know what is real and what is tested.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Operator Data Ownership</span>
          </h2>
          <p>
            All custom agent configurations, policies, and audit logs belong exclusively to your session. You can reset or permanently wipe your local data at any time from the Settings screen with a single click.
          </p>
          <p>
            You can also export your full audit trail in standard JSON or CSV format without vendor lock-in.
          </p>
        </div>
      </div>
    </div>
  );
};
