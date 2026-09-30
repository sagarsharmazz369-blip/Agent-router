import React, { useState } from 'react';
import { Wrench, Shield, Globe, FileText, FileEdit, GitBranch, FileCheck, Mail, Database, Layers, Trash2, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SYSTEM_TOOLS, getAgentsUsingTool } from '../lib/toolsRegistry';
import { Tool } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAgentGate } from '../context/AgentGateContext';

interface ToolsPageProps {
  onNavigateToAgent?: (agentId: string) => void;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ onNavigateToAgent }) => {
  const { agents } = useAgentGate();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = ['ALL', 'research', 'files', 'communication', 'data', 'destructive'];

  const filteredTools = SYSTEM_TOOLS.filter(t => {
    return categoryFilter === 'ALL' || t.category === categoryFilter;
  });

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return Globe;
      case 'FileText': return FileText;
      case 'FileEdit': return FileEdit;
      case 'GitBranch': return GitBranch;
      case 'FileCheck': return FileCheck;
      case 'Mail': return Mail;
      case 'Database': return Database;
      case 'Layers': return Layers;
      case 'Trash2': return Trash2;
      default: return Wrench;
    }
  };

  const selectedToolAgents = selectedTool ? getAgentsUsingTool(selectedTool.code, agents) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Tool Registry
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Registered tools and capabilities available for assignment to autonomous agents.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          {SYSTEM_TOOLS.length} Standard Capabilities Registered
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase font-mono tracking-wider transition-colors ${
              categoryFilter === cat
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map(tool => {
          const Icon = getToolIcon(tool.iconName);
          const usingAgents = getAgentsUsingTool(tool.code, agents);

          return (
            <div
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-zinc-100">{tool.name}</h3>
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  <Badge type="risk" value={tool.riskLevel} size="sm" />
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Default Policy:</span>
                <div className="flex items-center gap-2">
                  <Badge type="decision" value={tool.defaultPermission} size="sm" />
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                    {usingAgents.length} agent{usingAgents.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tool Inspection Modal */}
      {selectedTool && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTool(null)}
          title={`Tool Schema: ${selectedTool.name}`}
          subtitle={`Tool Code: ${selectedTool.code}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-zinc-400">
                Category: <strong className="text-zinc-200 uppercase">{selectedTool.category}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Badge type="risk" value={selectedTool.riskLevel} />
                <Badge type="decision" value={selectedTool.defaultPermission} />
              </div>
            </div>

            <div>
              <span className="text-zinc-500 font-semibold uppercase tracking-wider font-mono block mb-1">
                What it does
              </span>
              <p className="text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                {selectedTool.description}
              </p>
            </div>

            {/* Which agents use this tool */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider font-mono">
                  Agents with this capability ({selectedToolAgents.length})
                </span>
              </div>

              {selectedToolAgents.length === 0 ? (
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 text-zinc-500 italic">
                  No active agents currently have this capability assigned.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedToolAgents.map(a => {
                    const explicit = a.permissions[selectedTool.code.toUpperCase()] || selectedTool.defaultPermission;
                    return (
                      <div
                        key={a.id}
                        className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-850 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Bot className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-semibold text-zinc-200 truncate">{a.name}</span>
                          <Badge type="status" value={a.status} size="sm" />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-zinc-500">Policy:</span>
                          <Badge type="decision" value={explicit} size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <span className="text-zinc-500 font-semibold uppercase tracking-wider font-mono block mb-1">
                Parameters Schema
              </span>
              <pre className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 font-mono text-zinc-300 overflow-x-auto text-[11px]">
                {selectedTool.parametersSchema || 'No parameters required'}
              </pre>
            </div>

            <div>
              <span className="text-zinc-500 font-semibold uppercase tracking-wider font-mono block mb-1">
                Simulated Sandbox Output Template
              </span>
              <div className="p-3 bg-zinc-950 rounded-lg border border-emerald-500/30 font-mono text-emerald-400 text-[11px]">
                {selectedTool.simulatedOutputTemplate}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setSelectedTool(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
