import React from 'react';
import { Check, X, Eye, AlertTriangle, Clock, Target, Bot, Wrench } from 'lucide-react';
import { ActionRequest } from '../../types';
import { Badge } from '../common/Badge';
import { SimulationBadge } from '../common/SimulationBadge';

interface ApprovalCardProps {
  request: ActionRequest;
  onApprove: (request: ActionRequest) => void;
  onReject: (request: ActionRequest) => void;
  onViewDetails: (request: ActionRequest) => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  request,
  onApprove,
  onReject,
  onViewDetails
}) => {
  const isPending = request.status === 'pending';

  return (
    <div
      className={`rounded-xl border transition-all ${
        isPending
          ? 'bg-zinc-900/90 border-amber-500/40 shadow-xs shadow-amber-950/20'
          : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <span className="font-semibold text-zinc-100 text-sm">{request.agentName}</span>
              <span className="text-zinc-500 text-xs mx-1.5">•</span>
              <span className="text-xs text-zinc-400 font-mono">{request.toolName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge type="risk" value={request.riskLevel} size="sm" />
            <Badge type="status" value={request.status} size="sm" />
            <SimulationBadge subtle />
          </div>
        </div>

        {/* Action description & Target */}
        <div className="mt-3 space-y-2">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-0.5">
              Requested Action
            </span>
            <p className="text-xs text-zinc-200 font-mono bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 leading-relaxed">
              {request.action}
            </p>
          </div>

          {request.target && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Target className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500">Target:</span>
              <span className="font-mono text-emerald-400">{request.target}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Requested at {new Date(request.requestedAt).toLocaleTimeString()} ({new Date(request.requestedAt).toLocaleDateString()})</span>
          </div>

          <p className="text-xs text-zinc-400 italic pt-1">
            "{request.reason}"
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-zinc-950/70 border-t border-zinc-800/80 rounded-b-xl flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDetails(request)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        {isPending ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReject(request)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            <button
              onClick={() => onApprove(request)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors shadow-xs shadow-emerald-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-zinc-500 font-mono">
            {request.reviewedBy ? `Reviewed by ${request.reviewedBy}` : 'Completed'}
          </span>
        )}
      </div>
    </div>
  );
};
