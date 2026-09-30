import React from 'react';
import { Bot, Play, Pause, Trash2, ArrowUpRight, Wrench, PlayCircle, Edit3, Copy } from 'lucide-react';
import { Agent } from '../../types';
import { Badge } from '../common/Badge';

interface AgentCardProps {
  agent: Agent;
  onOpenDetails: (agentId: string) => void;
  onEdit: (agent: Agent) => void;
  onTestAction: (agentId: string) => void;
  onTogglePause: (agentId: string) => void;
  onDuplicate: (agentId: string) => void;
  onDelete: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onOpenDetails,
  onEdit,
  onTestAction,
  onTogglePause,
  onDuplicate,
  onDelete
}) => {
  const isPaused = (agent.status || '').toUpperCase() === 'PAUSED';

  // Count permissions
  const permCounts = {
    allow: 0,
    ask: 0,
    block: 0
  };

  Object.values(agent.permissions || {}).forEach(p => {
    if (p === 'ALLOW') permCounts.allow++;
    if (p === 'ASK') permCounts.ask++;
    if (p === 'BLOCK') permCounts.block++;
  });

  return (
    <div
      className={`rounded-xl border transition-all duration-200 flex flex-col justify-between ${
        isPaused
          ? 'bg-zinc-950/60 border-zinc-800/60 opacity-80'
          : 'bg-zinc-900/80 border-zinc-800/90 hover:border-zinc-700 shadow-xs'
      }`}
    >
      <div className="p-5">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                isPaused
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-base leading-tight">
                {agent.name}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Active {new Date(agent.lastActivityAt || agent.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <Badge type="status" value={agent.status} size="sm" />
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
          {agent.description}
        </p>

        {/* Tools and Permission distribution */}
        <div className="mt-4 pt-3 border-t border-zinc-800/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-zinc-500" />
              <span>Assigned Capabilities</span>
            </div>
            <span className="font-mono text-zinc-200 font-medium">
              {agent.tools.length} tools
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <span
              className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono"
              title="Allowed tools"
            >
              {permCounts.allow} ALLOW
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono"
              title="Ask approval tools"
            >
              {permCounts.ask} ASK
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono"
              title="Blocked tools"
            >
              {permCounts.block} BLOCK
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 bg-zinc-950/60 border-t border-zinc-800/80 rounded-b-xl flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTogglePause(agent.id)}
            title={isPaused ? 'Resume agent' : 'Pause agent'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onEdit(agent)}
            title="Edit Agent"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDuplicate(agent.id)}
            title="Duplicate Agent"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(agent.id)}
            title="Delete Agent"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTestAction(agent.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test</span>
          </button>

          <button
            onClick={() => onOpenDetails(agent.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/90 hover:bg-emerald-500 text-white transition-colors"
          >
            <span>Open</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
