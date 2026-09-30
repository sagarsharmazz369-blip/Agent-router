import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, Bot, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuditLog } from '../../types';
import { Badge } from '../common/Badge';
import { SimulationBadge } from '../common/SimulationBadge';
import { Modal } from '../common/Modal';
import { getActionExplanation } from '../../services/geminiService';

interface AuditTableProps {
  logs: AuditLog[];
  onExport: (format: 'json' | 'csv') => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({ logs, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'All' | 'Allowed' | 'Approval' | 'Blocked' | 'Rejected' | 'Executed'>('All');
  const [filterAgent, setFilterAgent] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Extract unique agents for filter dropdown
  const uniqueAgents = useMemo(() => {
    return Array.from(new Set(logs.map(l => l.agentName)));
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search
      const matchesSearch =
        searchTerm === '' ||
        log.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.toolCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.target && log.target.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Status Tab filter: All, Allowed, Approval, Blocked, Rejected, Executed
      let matchesStatusTab = true;
      if (statusTab === 'Allowed') {
        matchesStatusTab = log.decision === 'ALLOW' || log.status === 'executed' || log.status === 'approved';
      } else if (statusTab === 'Approval') {
        matchesStatusTab = log.decision === 'ASK' || log.status === 'pending';
      } else if (statusTab === 'Blocked') {
        matchesStatusTab = log.decision === 'BLOCK' || log.status === 'blocked';
      } else if (statusTab === 'Rejected') {
        matchesStatusTab = log.status === 'rejected';
      } else if (statusTab === 'Executed') {
        matchesStatusTab = log.status === 'executed' || log.status === 'approved';
      }

      // Dropdown filters
      const matchesAgent = filterAgent === 'ALL' || log.agentName === filterAgent;
      const matchesRisk = filterRisk === 'ALL' || log.riskLevel.toUpperCase() === filterRisk.toUpperCase();

      return matchesSearch && matchesStatusTab && matchesAgent && matchesRisk;
    });
  }, [logs, searchTerm, statusTab, filterAgent, filterRisk]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenLog = (log: AuditLog) => {
    setSelectedLog(log);
    setAiExplanation(null);
  };

  const handleExplain = async () => {
    if (!selectedLog) return;
    setIsExplaining(true);
    try {
      const expl = await getActionExplanation({
        agentName: selectedLog.agentName,
        toolName: selectedLog.toolName,
        action: selectedLog.action,
        target: selectedLog.target,
        riskLevel: selectedLog.riskLevel,
        decision: selectedLog.decision,
        reason: selectedLog.reason
      });
      setAiExplanation(expl);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs (Phase 7 Requirement: All, Allowed, Approval, Blocked, Rejected, Executed) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
        <div className="flex flex-wrap gap-1">
          {(['All', 'Allowed', 'Approval', 'Blocked', 'Rejected', 'Executed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setStatusTab(tab);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusTab === tab
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onExport('csv')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => onExport('json')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by agent, tool, action, target, or ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Agent Filter */}
          <select
            value={filterAgent}
            onChange={e => {
              setFilterAgent(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 outline-hidden focus:border-emerald-500"
          >
            <option value="ALL">All Agents</option>
            {uniqueAgents.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={filterRisk}
            onChange={e => {
              setFilterRisk(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 outline-hidden focus:border-emerald-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase tracking-wider text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Capability</th>
                <th className="py-3 px-4">Action &amp; Target</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans text-zinc-300">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    Agent activity will appear here. No events match the current filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(log => (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    onClick={() => handleOpenLog(log)}
                  >
                    <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                      {new Date(log.createdAt || log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-zinc-200">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{log.agentName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-300 whitespace-nowrap">
                      {log.toolName}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <span className="text-zinc-200">{log.action}</span>
                      {log.target && (
                        <span className="block text-[11px] text-zinc-500 font-mono truncate">
                          &rarr; {log.target}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge type="risk" value={log.riskLevel} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge type="decision" value={log.decision} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge type="status" value={log.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenLog(log);
                        }}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div>
            Showing{' '}
            <span className="font-semibold text-zinc-200">
              {filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-zinc-200">
              {Math.min(currentPage * pageSize, filteredLogs.length)}
            </span>{' '}
            of <span className="font-semibold text-zinc-200">{filteredLogs.length}</span> events
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40 hover:bg-zinc-800 text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-zinc-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40 hover:bg-zinc-800 text-zinc-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Verification"
          subtitle={`Event ID: ${selectedLog.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Badge type="decision" value={selectedLog.decision} />
                <Badge type="risk" value={selectedLog.riskLevel} />
              </div>
              <SimulationBadge subtle />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">AGENT</span>
                <span className="font-semibold text-zinc-200 truncate block">{selectedLog.agentName}</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">TOOL</span>
                <span className="text-zinc-200 truncate block">{selectedLog.toolName}</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">DECISION</span>
                <Badge type="decision" value={selectedLog.decision} size="sm" />
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">STATUS</span>
                <Badge type="status" value={selectedLog.status} size="sm" />
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">RISK</span>
                <Badge type="risk" value={selectedLog.riskLevel} size="sm" />
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px]">SIMULATION</span>
                <span className="font-bold text-cyan-400">
                  {selectedLog.simulation !== false ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">TIMESTAMP</span>
                <span className="text-zinc-300 text-[11px]">
                  {new Date(selectedLog.createdAt || selectedLog.timestamp).toLocaleTimeString()} ({new Date(selectedLog.createdAt || selectedLog.timestamp).toLocaleDateString()})
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-zinc-500 block mb-1">Target</span>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 font-mono text-xs text-emerald-400">
                {selectedLog.target || 'None / Internal Sandbox'}
              </div>
            </div>

            <div>
              <span className="text-xs text-zinc-500 block mb-1">Requested Action</span>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 font-mono text-xs text-zinc-200 leading-relaxed">
                {selectedLog.action}
              </div>
            </div>

            <div>
              <span className="text-xs text-zinc-500 block mb-1">Policy Reason</span>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 leading-relaxed">
                {selectedLog.reason}
              </div>
            </div>

            {selectedLog.reviewedBy && (
              <div>
                <span className="text-xs text-zinc-500 block mb-1">Reviewed By</span>
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 font-mono">
                  {selectedLog.reviewedBy}
                </div>
              </div>
            )}

            {/* AI Explanation in Audit Log */}
            <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Gemini Policy Explanation</span>
                </div>
                {!aiExplanation && (
                  <button
                    onClick={handleExplain}
                    disabled={isExplaining}
                    className="text-[11px] px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 disabled:opacity-50"
                  >
                    {isExplaining ? 'Explaining...' : 'Explain in Plain English'}
                  </button>
                )}
              </div>
              {aiExplanation && (
                <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                  {aiExplanation}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
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
