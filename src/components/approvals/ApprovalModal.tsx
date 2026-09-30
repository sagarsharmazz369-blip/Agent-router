import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Sparkles, Check, X } from 'lucide-react';
import { ActionRequest } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { SimulationBadge } from '../common/SimulationBadge';
import { getActionExplanation } from '../../services/geminiService';

interface ApprovalModalProps {
  request: ActionRequest | null;
  mode: 'confirm_approve' | 'confirm_reject' | 'details' | null;
  onClose: () => void;
  onConfirmApprove: (requestId: string) => void;
  onConfirmReject: (requestId: string, reason: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  mode,
  onClose,
  onConfirmApprove,
  onConfirmReject
}) => {
  const [rejectReason, setRejectReason] = useState('Safety check: Operator declined external interaction.');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!request || !mode) return null;

  const handleFetchAiExplanation = async () => {
    setIsLoadingAi(true);
    try {
      const expl = await getActionExplanation({
        agentName: request.agentName,
        toolName: request.toolName,
        action: request.action,
        target: request.target,
        riskLevel: request.riskLevel,
        decision: request.decision,
        reason: request.reason
      });
      setAiExplanation(expl);
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (mode === 'confirm_approve') {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Confirm Action Authorization"
        subtitle="Verify the target and risk level before granting permission"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
              <p className="font-semibold mb-1">Human-In-The-Loop Verification Required</p>
              Are you sure you want to approve this action? AgentGate will authorize the agent to execute in the simulation sandbox and log an audit trail under your operator ID.
            </div>
          </div>

          <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Requesting Agent:</span>
              <span className="font-semibold text-zinc-200">{request.agentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tool:</span>
              <span className="font-mono text-zinc-300">{request.toolName} ({request.toolCode})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Target System:</span>
              <span className="font-mono text-emerald-400">{request.target || 'Default Target'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Risk Assessment:</span>
              <Badge type="risk" value={request.riskLevel} size="sm" />
            </div>
            <div className="pt-2 border-t border-zinc-850">
              <span className="text-zinc-500">Agent Stated Intent:</span>
              <p className="text-zinc-300 mt-1 font-mono text-[11px] bg-zinc-900 p-2 rounded">
                "{request.action}"
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirmApprove(request.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors shadow-xs shadow-emerald-500/30"
            >
              <Check className="w-4 h-4" />
              <span>Approve Action</span>
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  if (mode === 'confirm_reject') {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Reject Agent Action"
        subtitle="This action will be blocked and recorded in the audit log"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200 leading-relaxed">
              <p className="font-semibold mb-1">Execution Will Be Halted</p>
              The agent will be informed that human approval was denied. The tool will not be executed.
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Rejection Reason for Audit Log:
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-rose-500 text-xs text-zinc-100 outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirmReject(request.id, rejectReason);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Reject Action</span>
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // mode === 'details'
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Action Request Inspection"
      subtitle={`Request ID: ${request.id}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Badge type="decision" value={request.decision} />
            <Badge type="risk" value={request.riskLevel} />
          </div>
          <SimulationBadge subtle />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850">
            <span className="text-zinc-500 block mb-1">Agent</span>
            <span className="font-semibold text-zinc-200">{request.agentName}</span>
          </div>
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850">
            <span className="text-zinc-500 block mb-1">Tool</span>
            <span className="font-mono text-zinc-200">{request.toolName} ({request.toolCode})</span>
          </div>
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850">
            <span className="text-zinc-500 block mb-1">Target</span>
            <span className="font-mono text-emerald-400">{request.target || 'None'}</span>
          </div>
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850">
            <span className="text-zinc-500 block mb-1">Status</span>
            <Badge type="status" value={request.status} size="sm" />
          </div>
        </div>

        <div>
          <span className="text-xs text-zinc-500 block mb-1">Action Description</span>
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 font-mono text-xs text-zinc-200 leading-relaxed">
            {request.action}
          </div>
        </div>

        <div>
          <span className="text-xs text-zinc-500 block mb-1">Policy Reason</span>
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 text-xs text-zinc-300 leading-relaxed">
            {request.reason}
          </div>
        </div>

        {request.executionResult && (
          <div>
            <span className="text-xs text-emerald-400 font-semibold block mb-1">Simulation Execution Output</span>
            <div className="p-3 bg-zinc-950 rounded-lg border border-emerald-500/30 text-xs font-mono text-emerald-300">
              {request.executionResult.output}
            </div>
          </div>
        )}

        {/* AI Insight Section */}
        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-200">Gemini Security Explanation</span>
            </div>
            {!aiExplanation && (
              <button
                onClick={handleFetchAiExplanation}
                disabled={isLoadingAi}
                className="text-[11px] px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 disabled:opacity-50"
              >
                {isLoadingAi ? 'Explaining...' : 'Explain in Plain English'}
              </button>
            )}
          </div>
          {aiExplanation && (
            <p className="text-xs text-zinc-300 leading-relaxed font-sans pt-1">
              {aiExplanation}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
