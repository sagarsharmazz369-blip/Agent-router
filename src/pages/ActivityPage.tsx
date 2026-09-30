import React from 'react';
import { FileClock, Download, Shield } from 'lucide-react';
import { useAgentGate } from '../context/AgentGateContext';
import { AuditTable } from '../components/activity/AuditTable';
import { SimulationBadge } from '../components/common/SimulationBadge';

export const ActivityPage: React.FC = () => {
  const { auditLogs, exportAuditData } = useAgentGate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Activity &amp; Audit Logs
            </h1>
            <SimulationBadge subtle />
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Complete, immutable trail of every permission check, approval, rejection, and simulated execution.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          {auditLogs.length} Total Audit Records
        </div>
      </div>

      {/* Main Audit Table */}
      <AuditTable logs={auditLogs} onExport={exportAuditData} />
    </div>
  );
};
