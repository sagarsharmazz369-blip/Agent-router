import React from 'react';
import { Shield, Bot, CheckCircle2, AlertTriangle, ShieldX, FileClock, UserCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-3 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Understanding AgentGate
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          A beginner's guide to AI agent security, tool permissions, and human-in-the-loop control.
        </p>
      </div>

      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
        {/* Section 1 */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>1. What is AgentGate?</span>
          </h2>
          <p>
            AgentGate is a security control layer that sits directly between an autonomous AI agent and the external tools or capabilities it wants to execute.
          </p>
          <p>
            When an agent decides to browse the web, write to a database, send an email, or delete a file, it must submit an <em>Action Request</em> to AgentGate first. AgentGate evaluates the request against strict policy rules before any tool is ever triggered.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span>2. Why Do AI Agents Need Permissions?</span>
          </h2>
          <p>
            Unlike traditional software that follows rigid conditional branches written by programmers, Large Language Model (LLM) agents generate dynamic actions based on natural language prompts.
          </p>
          <p>
            If an agent encounters a malicious prompt injection, a confusing hallucination, or flawed reasoning, it might attempt to purge database tables, spam external contacts, or leak sensitive API tokens. AgentGate prevents this by enforcing the <strong>Principle of Least Privilege</strong>: an agent can only access tools specifically granted to it, and sensitive operations are paused for human operator review.
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>3. How ALLOW / ASK / BLOCK Works</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-zinc-950 rounded-xl border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold font-mono text-sm block">ALLOW</span>
              <p className="text-zinc-400 text-[11px]">
                Safe read-only actions (like web search or reading local docs) proceed automatically so your agents remain productive without unnecessary delays.
              </p>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-amber-500/30 space-y-1">
              <span className="text-amber-300 font-bold font-mono text-sm block">ASK</span>
              <p className="text-zinc-400 text-[11px]">
                Actions with external impact (sending messages, rewriting files, database writes) pause at security boundaries until a human reviews the intent.
              </p>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-rose-500/30 space-y-1">
              <span className="text-rose-400 font-bold font-mono text-sm block">BLOCK</span>
              <p className="text-zinc-400 text-[11px]">
                Irreversible or destructive actions (such as DELETE_DATA) are stopped immediately. No execution takes place under any circumstance.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <FileClock className="w-5 h-5 text-emerald-400" />
            <span>4. What is an Audit Log?</span>
          </h2>
          <p>
            An audit log is an immutable chronological record of every single action requested by every agent in your organization. Each log includes the requesting agent, tool code, stated reason, target system, risk level, policy decision, and timestamp.
          </p>
          <p>
            This ensures complete transparency: you can always answer "What did this agent do?", "Who approved it?", and "Why was this action blocked?".
          </p>
        </div>

        {/* Section 5 */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>5. Why Human Approval Matters</span>
          </h2>
          <p>
            Giving AI agents power to act in the physical or digital world makes them dramatically more capable, but autonomous agents should never hold unchecked authority over critical business operations.
          </p>
          <p className="font-medium text-emerald-300">
            AgentGate puts human intelligence where it matters most: at critical decision boundaries.
          </p>
        </div>
      </div>
    </div>
  );
};
