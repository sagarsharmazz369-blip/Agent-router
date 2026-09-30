import React, { useState, useEffect } from 'react';
import { User, Bot, Shield, CheckCircle2, AlertTriangle, ShieldX, Wrench, FileClock, ArrowDown } from 'lucide-react';

export const WorkflowVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    { title: 'User Prompt', desc: '"Draft report and notify founder"', icon: User, color: 'text-zinc-300' },
    { title: 'AI Agent Request', desc: 'Agent decides to call SEND_MESSAGE', icon: Bot, color: 'text-emerald-400' },
    { title: 'AgentGate Guard', desc: 'Intercepts tool invocation', icon: Shield, color: 'text-emerald-300' },
    { title: 'Policy Engine Check', desc: 'Evaluates risk and permissions', icon: Shield, color: 'text-cyan-400' },
    { title: 'ALLOW / ASK / BLOCK', desc: 'Deterministic evaluation result', icon: AlertTriangle, color: 'text-amber-400' },
    { title: 'Tool Execution', desc: 'Safe sandbox simulated execution', icon: Wrench, color: 'text-purple-400' },
    { title: 'Audit Log Created', desc: 'Permanent immutable event recorded', icon: FileClock, color: 'text-emerald-400' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            Live Architecture Pipeline
          </span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          Cycle: Step {activeStep + 1} of {steps.length}
        </div>
      </div>

      {/* Interactive Horizontal Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 relative z-10">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isCurrent = activeStep === index;
          const isPassed = activeStep > index;

          return (
            <div
              key={index}
              onClick={() => setActiveStep(index)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-zinc-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 scale-102 ring-1 ring-emerald-500/30'
                  : isPassed
                  ? 'bg-zinc-950/80 border-emerald-500/20 text-zinc-400'
                  : 'bg-zinc-950/40 border-zinc-850 text-zinc-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                    0{index + 1}
                  </span>
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isCurrent ? s.color : isPassed ? 'text-emerald-500/70' : 'text-zinc-600'
                    }`}
                  />
                </div>
                <div
                  className={`text-xs font-semibold leading-tight ${
                    isCurrent ? 'text-zinc-100' : isPassed ? 'text-zinc-300' : 'text-zinc-500'
                  }`}
                >
                  {s.title}
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed font-sans line-clamp-2">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Decision Branch Visualization */}
      <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-around gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">ALLOW:</span>
          <span className="text-zinc-400">Low-risk internal actions proceed</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="font-semibold">ASK:</span>
          <span className="text-zinc-400">External messaging &amp; writes require operator sign-off</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300">
          <ShieldX className="w-4 h-4 text-rose-400" />
          <span className="font-semibold">BLOCK:</span>
          <span className="text-zinc-400">Critical destructive actions prohibited by default</span>
        </div>
      </div>
    </div>
  );
};
