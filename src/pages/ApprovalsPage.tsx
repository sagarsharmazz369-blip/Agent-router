import React, { useState } from 'react';
import { CheckSquare, AlertTriangle, ShieldCheck, XCircle, Search, Filter } from 'lucide-react';
import { useAgentGate } from '../context/AgentGateContext';
import { ActionRequest } from '../types';
import { ApprovalCard } from '../components/approvals/ApprovalCard';
import { ApprovalModal } from '../components/approvals/ApprovalModal';

export const ApprovalsPage: React.FC = () => {
  const { actionRequests, approveAction, rejectAction } = useAgentGate();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'blocked' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ActionRequest | null>(null);
  const [modalMode, setModalMode] = useState<'confirm_approve' | 'confirm_reject' | 'details' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const counts = {
    pending: actionRequests.filter(r => r.status === 'pending').length,
    approved: actionRequests.filter(r => r.status === 'approved' || r.status === 'executed').length,
    rejected: actionRequests.filter(r => r.status === 'rejected').length,
    blocked: actionRequests.filter(r => r.status === 'blocked').length,
    all: actionRequests.length
  };

  const filteredRequests = actionRequests.filter(r => {
    // Tab match
    let matchesTab = true;
    if (activeTab === 'pending') matchesTab = r.status === 'pending';
    else if (activeTab === 'approved') matchesTab = r.status === 'approved' || r.status === 'executed';
    else if (activeTab === 'rejected') matchesTab = r.status === 'rejected';
    else if (activeTab === 'blocked') matchesTab = r.status === 'blocked';

    // Search match
    const matchesSearch =
      searchTerm === '' ||
      r.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.target && r.target.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const handleOpenApproveModal = (req: ActionRequest) => {
    if (req.status !== 'pending') return;
    setSelectedRequest(req);
    setModalMode('confirm_approve');
  };

  const handleOpenRejectModal = (req: ActionRequest) => {
    if (req.status !== 'pending') return;
    setSelectedRequest(req);
    setModalMode('confirm_reject');
  };

  const handleOpenDetails = (req: ActionRequest) => {
    setSelectedRequest(req);
    setModalMode('details');
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Approval Center
            </h1>
            {counts.pending > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                {counts.pending} Awaiting Review
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Human-in-the-loop review queue for elevated risk and sensitive agent requests.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'pending', label: 'Pending', count: counts.pending, alert: counts.pending > 0 },
            { id: 'approved', label: 'Executed / Approved', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
            { id: 'blocked', label: 'Blocked', count: counts.blocked },
            { id: 'all', label: 'All Requests', count: counts.all }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    tab.alert
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'bg-zinc-950 text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Filter requests..."
            className="w-full pl-8 pr-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3">
          <CheckSquare className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-200">
            {activeTab === 'pending'
              ? 'No agent actions currently require your approval.'
              : `No ${activeTab} requests found.`}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'Autonomous agents are operating within pre-approved parameters. When an agent requests a capability with ASK permission, it will appear here.'
              : 'Try running a test in the Action Simulator to generate new requests.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map(req => (
            <ApprovalCard
              key={req.id}
              request={req}
              onApprove={handleOpenApproveModal}
              onReject={handleOpenRejectModal}
              onViewDetails={handleOpenDetails}
            />
          ))}
        </div>
      )}

      {/* Confirmation & Inspector Modal */}
      <ApprovalModal
        request={selectedRequest}
        mode={modalMode}
        onClose={handleCloseModal}
        onConfirmApprove={requestId => {
          approveAction(requestId);
          handleCloseModal();
        }}
        onConfirmReject={(requestId, reason) => {
          rejectAction(requestId, reason);
          handleCloseModal();
        }}
      />
    </div>
  );
};
