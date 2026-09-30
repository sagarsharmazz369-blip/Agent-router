import React from 'react';
import {
  Shield,
  Bot,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  FileClock,
  Sparkles,
  Lock,
  Eye,
  Sliders,
  Terminal,
  Zap,
  Check
} from 'lucide-react';
import { WorkflowVisualizer } from '../components/landing/WorkflowVisualizer';
import { useAgentGate } from '../context/AgentGateContext';

interface LandingPageProps {
  onStart: () => void;
  onViewDemo: () => void;
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onViewDemo, onNavigate }) => {
  const { loginAsDemo } = useAgentGate();

  const handleDemoClick = () => {
    loginAsDemo();
    onViewDemo();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <nav className="h-18 border-b border-zinc-800/80 px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-black/85 backdrop-blur-md z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            AGENT<span className="text-emerald-400">GATE</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDemoClick}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
          >
            Try Demo
          </button>
          <button
            onClick={onStart}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors shadow-xs shadow-emerald-500/30"
          >
            Launch Console
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 sm:px-12 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>The Open AI Agent Permission &amp; Activity Control Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Give AI agents power.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Keep humans in control.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Control what your AI agents can access, approve sensitive actions, and understand everything they do with deterministic policies and complete audit logs.
        </p>

        {/* Call to Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleDemoClick}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-sm border border-zinc-700 transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            <span>View Demo Environment</span>
          </button>
        </div>

        {/* Interactive Architecture Flow Diagram */}
        <div className="pt-10">
          <WorkflowVisualizer />
        </div>
      </section>

      {/* Why AgentGate Section */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/50 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Why Autonomous Agents Need A Security Gate
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              When AI agents receive access to APIs, databases, files, and email servers, a prompt injection or hallucination can execute unintended actions. AgentGate sits between your agents and your tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">Least-Privilege by Default</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Agents only touch tools explicitly assigned to them. Unassigned tools and unexpected capabilities are rejected instantly before execution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">Human-In-The-Loop Reviews</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Actions with external impact (sending messages, rewriting configs, database updates) pause safely at security boundaries until a human confirms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileClock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">100% Immutable Audit Trail</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every action request, policy decision, approval, and simulation result creates a traceable audit record for compliance and debugging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Permission Model Section */}
      <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
            Deterministic Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            The Three-Tier Permission Model
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Every tool assigned to an agent has a clear, deterministic permission state. No guesswork, no opaque black boxes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ALLOW Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-emerald-400">ALLOW</span>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Safe, read-only, or internal actions run automatically without blocking the agent workflow.
            </p>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 text-xs font-mono text-zinc-300">
              Web Search, File Reader, GitHub Inspector, Report Generation
            </div>
          </div>

          {/* ASK Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-amber-300">ASK</span>
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Medium &amp; high risk actions that affect external humans or mutate data require human sign-off in the Approval Center.
            </p>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 text-xs font-mono text-zinc-300">
              Send Email, Modify File, Write Database Record
            </div>
          </div>

          {/* BLOCK Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-rose-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-rose-400">BLOCK</span>
              <ShieldX className="w-6 h-6 text-rose-400" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dangerous or destructive actions are halted unconditionally by policy. No execution is permitted.
            </p>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 text-xs font-mono text-zinc-300">
              Delete Data, Drop Database, Purge System Backups
            </div>
          </div>
        </div>
      </section>

      {/* Free-First MVP Pricing Section */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/60 px-6 sm:px-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              MVP — 100% Free &amp; Open
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              AgentGate is built with a free-first philosophy. No credit cards, no paid API subscriptions required to test and evaluate the complete permission workflow.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900/90 border border-emerald-500/30 max-w-md mx-auto space-y-6 shadow-xl">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Evaluation Edition
              </span>
              <div className="mt-2 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold text-white font-mono">$0</span>
                <span className="text-zinc-400 text-xs">/ forever</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">No payment required</p>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 text-left">
              {[
                'Full deterministic permission engine (ALLOW / ASK / BLOCK)',
                'Safe isolated action simulation sandbox',
                'Human-in-the-loop Approval Center with risk prompts',
                'Comprehensive audit logging with search & CSV/JSON export',
                'Gemini AI policy and risk explanations',
                'Zero external paid dependencies'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onStart}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors shadow-md shadow-emerald-500/20"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-6 sm:px-12 text-center text-xs text-zinc-500 space-y-2">
        <p className="font-semibold text-zinc-400">
          AgentGate — Give AI agents power. Keep humans in control.
        </p>
        <p>Built for developers, security architects, and AI engineers.</p>
      </footer>
    </div>
  );
};
