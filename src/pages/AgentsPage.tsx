import React, { useState } from 'react';
import { Bot, Plus, Search, Filter } from 'lucide-react';
import { useAgentGate } from '../context/AgentGateContext';
import { AgentCard } from '../components/agents/AgentCard';
import { EditAgentModal } from '../components/agents/EditAgentModal';
import { Agent } from '../types';

interface AgentsPageProps {
  onOpenCreateAgent: () => void;
  onOpenAgentDetails: (agentId: string) => void;
  onTestAction: (agentId: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({
  onOpenCreateAgent,
  onOpenAgentDetails,
  onTestAction
}) => {
  const { agents, deleteAgent, toggleAgentPause, duplicateAgent, updateAgent } = useAgentGate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isPaused = (agent.status || '').toUpperCase() === 'PAUSED';
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !isPaused) ||
      (statusFilter === 'paused' && isPaused);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            AI Agents
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure tools and explicit ALLOW / ASK / BLOCK permission matrices per agent.
          </p>
        </div>

        <button
          onClick={onOpenCreateAgent}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors shadow-xs shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Agent</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search agents by name or description..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-850">
          {(['all', 'active', 'paused'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 text-xs rounded-md capitalize transition-colors font-medium ${
                statusFilter === f
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3">
          <Bot className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-200">
            {searchTerm ? 'No matching agents found' : 'Create your first AI agent.'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchTerm
              ? 'Try modifying your search or filter options.'
              : 'Define autonomous agents, choose which tools they can access, and enforce deterministic permissions.'}
          </p>
          <button
            onClick={onOpenCreateAgent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400"
          >
            <Plus className="w-4 h-4" />
            <span>Create Agent</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onOpenDetails={onOpenAgentDetails}
              onEdit={a => setEditingAgent(a)}
              onTestAction={onTestAction}
              onTogglePause={toggleAgentPause}
              onDuplicate={duplicateAgent}
              onDelete={deleteAgent}
            />
          ))}
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <EditAgentModal
          agent={editingAgent}
          isOpen={true}
          onClose={() => setEditingAgent(null)}
          onSave={updated => {
            updateAgent(updated);
            setEditingAgent(null);
          }}
        />
      )}
    </div>
  );
};
