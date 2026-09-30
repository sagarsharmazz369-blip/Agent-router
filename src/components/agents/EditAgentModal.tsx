import React, { useState } from 'react';
import { Agent, PermissionLevel, AgentStatus } from '../../types';
import { SYSTEM_TOOLS, getRiskColor } from '../../lib/toolsRegistry';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Check, X } from 'lucide-react';

interface EditAgentModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Agent) => void;
}

export const EditAgentModal: React.FC<EditAgentModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSave
}) => {
  if (!agent) return null;

  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [status, setStatus] = useState<AgentStatus>(agent.status);
  const [tools, setTools] = useState<string[]>([...agent.tools]);
  const [permissions, setPermissions] = useState<Record<string, PermissionLevel>>({
    ...agent.permissions
  });
  const [error, setError] = useState<string | null>(null);

  const toggleTool = (toolCode: string) => {
    if (tools.includes(toolCode)) {
      setTools(tools.filter(t => t !== toolCode));
      const nextPerms = { ...permissions };
      delete nextPerms[toolCode];
      setPermissions(nextPerms);
    } else {
      setTools([...tools, toolCode]);
      const toolObj = SYSTEM_TOOLS.find(t => t.code === toolCode);
      setPermissions({
        ...permissions,
        [toolCode]: toolObj?.defaultPermission || 'ASK'
      });
    }
  };

  const setPerm = (toolCode: string, level: PermissionLevel | 'DEFAULT') => {
    setPermissions(prev => {
      const next = { ...prev };
      const codeUpper = toolCode.toUpperCase();
      if (level === 'DEFAULT') {
        delete next[codeUpper];
        delete next[toolCode];
      } else {
        next[codeUpper] = level;
      }
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Agent name cannot be empty');
      return;
    }
    if (tools.length === 0) {
      setError('Please assign at least one capability tool');
      return;
    }

    onSave({
      ...agent,
      name: name.trim(),
      description: description.trim(),
      status,
      tools,
      permissions,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Agent: ${agent.name}`}
      subtitle="Modify configuration, status, and permission matrix"
      maxWidth="xl"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-zinc-300 font-medium mb-1">Agent Name</label>
          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setError(null);
            }}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 outline-hidden focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-zinc-300 font-medium mb-1">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 outline-hidden focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-zinc-300 font-medium mb-1">Operational Status</label>
          <div className="flex gap-2">
            {(['ACTIVE', 'PAUSED'] as AgentStatus[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg border font-mono font-medium transition-colors ${
                  status === s
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-xs'
                    : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:text-zinc-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Assigned Tools & Policies */}
        <div>
          <label className="block text-zinc-300 font-medium mb-1">
            Assigned Capabilities &amp; Explicit Policies
          </label>
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {SYSTEM_TOOLS.map(t => {
              const isAssigned = tools.includes(t.code);
              const currentPerm = permissions[t.code] || t.defaultPermission;

              return (
                <div
                  key={t.code}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 ${
                    isAssigned ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-950/40 border-zinc-850 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => toggleTool(t.code)}
                      className="rounded border-zinc-700 bg-zinc-900 text-emerald-500"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-zinc-200">{t.name}</span>
                      <span className="text-zinc-500 font-mono text-[10px] ml-1.5">({t.code})</span>
                    </div>
                  </div>

                  {isAssigned && (
                    <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPerm(t.code, 'DEFAULT')}
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-medium transition-colors ${
                          !permissions[t.code.toUpperCase()] && !permissions[t.code]
                            ? 'bg-zinc-800 text-white border border-zinc-600'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title="No explicit policy override"
                      >
                        DEFAULT
                      </button>
                      {(['ALLOW', 'ASK', 'BLOCK'] as PermissionLevel[]).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPerm(t.code, p)}
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-medium transition-colors ${
                            currentPerm === p && (permissions[t.code.toUpperCase()] || permissions[t.code])
                              ? p === 'ALLOW' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : p === 'ASK' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
