import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  AlertTriangle,
  Bot,
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Agent, PermissionLevel, AgentStatus } from '../../types';
import { SYSTEM_TOOLS, getRiskColor } from '../../lib/toolsRegistry';
import { Badge } from '../common/Badge';
import { getPolicyRecommendations } from '../../services/geminiService';

interface CreateAgentWizardProps {
  onClose: () => void;
  onCreate: (agentData: {
    name: string;
    description: string;
    status: AgentStatus;
    icon: string;
    tools: string[];
    permissions: Record<string, PermissionLevel>;
  }) => void;
}

export const CreateAgentWizard: React.FC<CreateAgentWizardProps> = ({ onClose, onCreate }) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>(['WEB_SEARCH', 'READ_FILE']);
  const [permissions, setPermissions] = useState<Record<string, PermissionLevel>>({
    WEB_SEARCH: 'ALLOW',
    READ_FILE: 'ALLOW'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!name.trim()) newErrors.name = 'Agent name is required.';
      else if (name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters.';
    }
    if (currentStep === 2) {
      if (!description.trim()) newErrors.description = 'Please explain the agent purpose.';
      else if (description.trim().length < 10) newErrors.description = 'Provide at least 10 characters to clarify intent.';
    }
    if (currentStep === 3) {
      if (selectedTools.length === 0) newErrors.tools = 'Select at least one tool for the agent.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const toggleTool = (toolCode: string) => {
    setSelectedTools(prev => {
      const exists = prev.includes(toolCode);
      if (exists) {
        const next = prev.filter(c => c !== toolCode);
        const nextPerms = { ...permissions };
        delete nextPerms[toolCode];
        setPermissions(nextPerms);
        return next;
      } else {
        const tool = SYSTEM_TOOLS.find(t => t.code === toolCode);
        const next = [...prev, toolCode];
        setPermissions({
          ...permissions,
          [toolCode]: tool?.defaultPermission || 'ASK'
        });
        return next;
      }
    });
  };

  const setToolPermission = (toolCode: string, level: PermissionLevel) => {
    setPermissions(prev => ({
      ...prev,
      [toolCode]: level
    }));
  };

  const handleRequestAiAdvice = async () => {
    setIsLoadingAi(true);
    try {
      const advice = await getPolicyRecommendations(name || 'Custom Agent', description);
      setAiSuggestions(advice);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleFinalSubmit = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    onCreate({
      name: name.trim(),
      description: description.trim(),
      status: 'ACTIVE',
      icon: 'Bot',
      tools: selectedTools,
      permissions
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        {[
          { num: 1, label: 'Name' },
          { num: 2, label: 'Purpose' },
          { num: 3, label: 'Tools' },
          { num: 4, label: 'Policies' },
          { num: 5, label: 'Review' }
        ].map(s => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-all ${
                  isCurrent
                    ? 'bg-emerald-500 text-black shadow-xs shadow-emerald-500/50'
                    : isDone
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isCurrent ? 'text-zinc-100' : isDone ? 'text-zinc-400' : 'text-zinc-600'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Agent Name */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Agent Name <span className="text-emerald-400">*</span>
            </label>
            <p className="text-xs text-zinc-400 mb-2">
              Choose an identifiable title for this autonomous assistant.
            </p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Research Agent, Financial Analyst, GitHub Auditor"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-100 placeholder-zinc-600 text-sm outline-hidden"
              autoFocus
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
            <div className="text-xs font-medium text-zinc-400 mb-2">Preset Ideas:</div>
            <div className="flex flex-wrap gap-2">
              {['Research Agent', 'Coding Assistant', 'Incident Responder', 'Database Auditor'].map(
                preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setName(preset)}
                    className="px-2.5 py-1 text-xs rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                  >
                    + {preset}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Purpose Description */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Agent Purpose &amp; Role <span className="text-emerald-400">*</span>
            </label>
            <p className="text-xs text-zinc-400 mb-2">
              Explain clearly what this agent will do. This helps establish least-privilege boundaries.
            </p>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Scours public GitHub repositories and technical documentation to assemble comparison reports for our engineering leads."
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-100 placeholder-zinc-600 text-sm outline-hidden"
              autoFocus
            />
            {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description}</p>}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-950/20 border border-purple-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-200 font-medium">Need permission recommendations?</span>
            </div>
            <button
              type="button"
              onClick={handleRequestAiAdvice}
              disabled={isLoadingAi || !description.trim()}
              className="px-2.5 py-1 text-xs rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 disabled:opacity-50"
            >
              {isLoadingAi ? 'Consulting...' : 'Ask Security Advice'}
            </button>
          </div>

          {aiSuggestions && (
            <div className="p-3 bg-zinc-950 rounded-lg border border-purple-500/30 text-xs text-zinc-300 whitespace-pre-line leading-relaxed font-mono">
              {aiSuggestions}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Choose Tools */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-200">
                Assign Accessible Tools <span className="text-emerald-400">*</span>
              </label>
              <span className="text-xs font-mono text-zinc-400">
                {selectedTools.length} selected
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 mb-3">
              Only assign tools strictly required for the agent's function (Least Privilege).
            </p>
          </div>

          {errors.tools && <p className="text-xs text-rose-400">{errors.tools}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {SYSTEM_TOOLS.map(tool => {
              const isSelected = selectedTools.includes(tool.code);
              const riskColor = getRiskColor(tool.defaultRisk);
              return (
                <div
                  key={tool.code}
                  onClick={() => toggleTool(tool.code)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all select-none flex items-start gap-3 ${
                    isSelected
                      ? 'bg-zinc-800/90 border-emerald-500/50 shadow-xs'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-zinc-200">{tool.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border uppercase font-mono ${riskColor.bg}`}>
                        {tool.defaultRisk}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 4: Permission Policies */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Configure Permission Policies
            </label>
            <p className="text-xs text-zinc-400 mt-0.5 mb-3">
              Define whether each tool is executed automatically (ALLOW), requires approval (ASK), or is blocked (BLOCK).
            </p>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {selectedTools.map(toolCode => {
              const tool = SYSTEM_TOOLS.find(t => t.code === toolCode);
              if (!tool) return null;
              const currentPerm = permissions[toolCode] || 'ASK';

              return (
                <div
                  key={toolCode}
                  className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">{tool.name}</span>
                      <Badge type="risk" value={tool.defaultRisk} size="sm" />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                      {tool.description}
                    </p>
                  </div>

                  {/* Policy Selector Buttons */}
                  <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 shrink-0">
                    {(['ALLOW', 'ASK', 'BLOCK'] as PermissionLevel[]).map(level => {
                      const isSelected = currentPerm === level;
                      let activeStyle = '';
                      if (level === 'ALLOW') activeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                      if (level === 'ASK') activeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                      if (level === 'BLOCK') activeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setToolPermission(toolCode, level)}
                          className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all border ${
                            isSelected
                              ? activeStyle
                              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5: Review & Confirm */}
      {step === 5 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-100">{name}</h4>
                <p className="text-xs text-zinc-400">{description}</p>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-zinc-300 mb-2">Configured Policy Matrix</div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedTools.map(toolCode => {
                  const tool = SYSTEM_TOOLS.find(t => t.code === toolCode);
                  const perm = permissions[toolCode] || 'ASK';
                  return (
                    <div
                      key={toolCode}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-zinc-900 border border-zinc-850"
                    >
                      <span className="font-mono text-zinc-300">{tool?.name || toolCode}</span>
                      <div className="flex items-center gap-2">
                        <Badge type="risk" value={tool?.defaultRisk || 'low'} size="sm" />
                        <Badge type="decision" value={perm} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>AgentGate will enforce this deterministic policy model immediately upon creation.</span>
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors shadow-xs shadow-emerald-500/30"
            >
              <Check className="w-4 h-4" />
              <span>Create Agent</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
