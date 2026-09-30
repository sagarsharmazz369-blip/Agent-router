import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Agent, ActionRequest, AuditLog, UserProfile, SecurityPosture, PermissionLevel, AgentStatus } from '../types';
import { storageService } from '../services/storageService';
import { simulateAction as runSimulator, executeApproval, executeRejection, SimulateActionResult } from '../lib/actionSimulator';
import { SYSTEM_TOOLS } from '../lib/toolsRegistry';
import { useToast } from '../components/common/Toast';

interface AgentGateContextType {
  user: UserProfile | null;
  isDemoMode: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  aiExplanationEnabled: boolean;
  toggleAiExplanation: () => void;

  agents: Agent[];
  actionRequests: ActionRequest[];
  auditLogs: AuditLog[];

  // Agent Management (Phase 2)
  createAgent: (data: {
    name: string;
    description: string;
    tools: string[];
    permissions: Record<string, PermissionLevel>;
    status?: AgentStatus;
  }) => Agent;
  updateAgent: (agent: Agent) => void;
  deleteAgent: (id: string) => void;
  pauseAgent: (id: string) => void;
  resumeAgent: (id: string) => void;
  toggleAgentPause: (id: string) => void;
  duplicateAgent: (id: string) => Agent | null;

  // Action Simulation (Phase 5)
  runActionSimulation: (params: {
    agentId: string;
    toolCode: string;
    action: string;
    target?: string;
    reason?: string;
  }) => SimulateActionResult | null;

  // Approval Center (Phase 6)
  approveAction: (requestId: string, reviewer?: string) => boolean;
  rejectAction: (requestId: string, reason?: string, reviewer?: string) => boolean;

  // Environment & Persistence (Phase 10 & 11)
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportAuditData: (format: 'json' | 'csv') => void;

  loginAsDemo: () => void;
  logout: () => void;

  // Dynamic Statistics (Phase 1, 8, 9, 14)
  securityPosture: SecurityPosture;
  stats: {
    totalAgents: number;
    activeAgents: number;
    pendingApprovals: number;
    actionsToday: number;
    blockedActions: number;
    allowedActions: number;
  };
}

const AgentGateContext = createContext<AgentGateContextType | undefined>(undefined);

export const AgentGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('agentgate_v1_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // User auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    return storageService.getUser();
  });

  const [aiExplanationEnabled, setAiExplanationEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('agentgate_v1_ai_explain') === 'true';
    } catch {
      return false;
    }
  });

  // Load state from clean storage service abstraction
  const [agents, setAgents] = useState<Agent[]>(() => storageService.getAgents());
  const [actionRequests, setActionRequests] = useState<ActionRequest[]>(() => storageService.getActionRequests());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());

  // Apply theme class
  useEffect(() => {
    try {
      localStorage.setItem('agentgate_v1_theme', theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist state changes via storageService
  useEffect(() => {
    storageService.saveUser(user);
  }, [user]);

  useEffect(() => {
    storageService.saveAgents(agents);
  }, [agents]);

  useEffect(() => {
    storageService.saveActionRequests(actionRequests);
  }, [actionRequests]);

  useEffect(() => {
    storageService.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('agentgate_v1_ai_explain', String(aiExplanationEnabled));
    } catch {}
  }, [aiExplanationEnabled]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleAiExplanation = useCallback(() => {
    setAiExplanationEnabled(prev => !prev);
  }, []);

  const loginAsDemo = useCallback(() => {
    const demoUser: UserProfile = {
      id: 'demo_operator_01',
      email: 'operator@agentgate.security',
      displayName: 'Demo Operator',
      isDemo: true
    };
    setUser(demoUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // --- Phase 2: Agent Management ---
  const createAgent = useCallback((data: {
    name: string;
    description: string;
    tools: string[];
    permissions: Record<string, PermissionLevel>;
    status?: AgentStatus;
  }): Agent => {
    const now = new Date().toISOString();
    const newAgent: Agent = {
      id: 'agent_' + Math.random().toString(36).substring(2, 9),
      name: data.name,
      description: data.description,
      status: data.status || 'ACTIVE',
      icon: 'Bot',
      tools: data.tools,
      permissions: data.permissions,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      stats: {
        totalRequests: 0,
        allowed: 0,
        pending: 0,
        blocked: 0
      }
    };

    setAgents(prev => [newAgent, ...prev]);
    toast.success('Agent created successfully', `${newAgent.name} is now registered.`);
    return newAgent;
  }, [toast]);

  const updateAgent = useCallback((updated: Agent) => {
    const now = new Date().toISOString();
    const normalized: Agent = {
      ...updated,
      updatedAt: now
    };
    setAgents(prev => prev.map(a => (a.id === normalized.id ? normalized : a)));
    toast.info('Agent updated', `${normalized.name} settings saved.`);
  }, [toast]);

  const deleteAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    toast.info('Agent deleted', 'Agent removed from registry.');
  }, [toast]);

  const pauseAgent = useCallback((id: string) => {
    const now = new Date().toISOString();
    setAgents(prev =>
      prev.map(a => {
        if (a.id === id) {
          toast.warning('Agent paused', `${a.name} is now PAUSED.`);
          return { ...a, status: 'PAUSED', updatedAt: now };
        }
        return a;
      })
    );
  }, [toast]);

  const resumeAgent = useCallback((id: string) => {
    const now = new Date().toISOString();
    setAgents(prev =>
      prev.map(a => {
        if (a.id === id) {
          toast.success('Agent resumed', `${a.name} is now ACTIVE.`);
          return { ...a, status: 'ACTIVE', updatedAt: now };
        }
        return a;
      })
    );
  }, [toast]);

  const toggleAgentPause = useCallback((id: string) => {
    const now = new Date().toISOString();
    setAgents(prev =>
      prev.map(a => {
        if (a.id === id) {
          const nextStatus: AgentStatus = (a.status || '').toUpperCase() === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          if (nextStatus === 'PAUSED') {
            toast.warning('Agent paused', `${a.name} is now PAUSED.`);
          } else {
            toast.success('Agent resumed', `${a.name} is now ACTIVE.`);
          }
          return { ...a, status: nextStatus, updatedAt: now };
        }
        return a;
      })
    );
  }, [toast]);

  const duplicateAgent = useCallback((id: string): Agent | null => {
    const source = agents.find(a => a.id === id);
    if (!source) return null;

    const now = new Date().toISOString();
    const duplicated: Agent = {
      ...source,
      id: 'agent_' + Math.random().toString(36).substring(2, 9),
      name: `${source.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      stats: {
        totalRequests: 0,
        allowed: 0,
        pending: 0,
        blocked: 0
      }
    };

    setAgents(prev => [duplicated, ...prev]);
    toast.success('Agent duplicated', `Created ${duplicated.name}`);
    return duplicated;
  }, [agents, toast]);

  // --- Phase 5: Action Simulator ---
  const runActionSimulation = useCallback((params: {
    agentId: string;
    toolCode: string;
    action: string;
    target?: string;
    reason?: string;
  }): SimulateActionResult | null => {
    const agent = agents.find(a => a.id === params.agentId);
    if (!agent) return null;

    const result = runSimulator({
      agent,
      toolCode: params.toolCode,
      action: params.action,
      target: params.target,
      reason: params.reason,
      userId: user?.id || 'demo_operator_01'
    });

    const now = new Date().toISOString();

    // Update agent's lastActivityAt and internal counter
    setAgents(prev =>
      prev.map(a => {
        if (a.id === agent.id) {
          const stats = a.stats || { totalRequests: 0, allowed: 0, pending: 0, blocked: 0 };
          return {
            ...a,
            lastActivityAt: now,
            updatedAt: now,
            stats: {
              ...stats,
              totalRequests: stats.totalRequests + 1,
              allowed: result.request.status === 'executed' ? stats.allowed + 1 : stats.allowed,
              pending: result.request.status === 'pending' ? stats.pending + 1 : stats.pending,
              blocked: result.request.status === 'blocked' ? stats.blocked + 1 : stats.blocked
            }
          };
        }
        return a;
      })
    );

    // Prepend request and audit log
    setActionRequests(prev => [result.request, ...prev]);
    setAuditLogs(prev => [result.auditLog, ...prev]);

    if (result.decision === 'ALLOW') {
      toast.success(`Action allowed: ${result.request.toolName}`, 'Simulated execution completed.');
    } else if (result.decision === 'ASK') {
      toast.warning(`Approval required for ${result.request.toolName}`, 'Queued in Approval Center for review.');
    } else {
      toast.error(`${result.request.toolName} was blocked by policy`, result.request.reason);
    }

    return result;
  }, [agents, user, toast]);

  // --- Phase 6: Approval Center ---
  const approveAction = useCallback((
    requestId: string,
    reviewer = user?.displayName || 'Security Operator'
  ): boolean => {
    const req = actionRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'pending') return false;

    const res = executeApproval(req, reviewer);
    if (!res) return false;

    const { updatedRequest, auditLog } = res;
    const now = new Date().toISOString();

    // Update request
    setActionRequests(prev => prev.map(r => (r.id === requestId ? updatedRequest : r)));

    // Prepend audit log
    setAuditLogs(prev => [auditLog, ...prev]);

    // Update corresponding agent's lastActivityAt and stats
    setAgents(prev =>
      prev.map(a => {
        if (a.id === req.agentId) {
          const stats = a.stats || { totalRequests: 0, allowed: 0, pending: 0, blocked: 0 };
          return {
            ...a,
            lastActivityAt: now,
            updatedAt: now,
            stats: {
              ...stats,
              pending: Math.max(0, stats.pending - 1),
              allowed: stats.allowed + 1
            }
          };
        }
        return a;
      })
    );

    toast.success('Action approved and simulation completed.');
    return true;
  }, [actionRequests, user, toast]);

  const rejectAction = useCallback((
    requestId: string,
    reason = 'Disallowed by human operator.',
    reviewer = user?.displayName || 'Security Operator'
  ): boolean => {
    const req = actionRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'pending') return false;

    const res = executeRejection(req, reason, reviewer);
    if (!res) return false;

    const { updatedRequest, auditLog } = res;
    const now = new Date().toISOString();

    // Update request
    setActionRequests(prev => prev.map(r => (r.id === requestId ? updatedRequest : r)));

    // Prepend audit log
    setAuditLogs(prev => [auditLog, ...prev]);

    // Update corresponding agent
    setAgents(prev =>
      prev.map(a => {
        if (a.id === req.agentId) {
          const stats = a.stats || { totalRequests: 0, allowed: 0, pending: 0, blocked: 0 };
          return {
            ...a,
            lastActivityAt: now,
            updatedAt: now,
            stats: {
              ...stats,
              pending: Math.max(0, stats.pending - 1),
              blocked: stats.blocked + 1
            }
          };
        }
        return a;
      })
    );

    toast.error('Action rejected.', reason);
    return true;
  }, [actionRequests, user, toast]);

  // --- Reset & Wipe ---
  const resetToDemoData = useCallback(() => {
    const data = storageService.resetToDemo();
    setAgents(data.agents);
    setActionRequests(data.requests);
    setAuditLogs(data.logs);
    toast.info('Demo environment restored', 'Default demo agents and requests loaded.');
  }, [toast]);

  const clearAllData = useCallback(() => {
    storageService.clearAll();
    setAgents([]);
    setActionRequests([]);
    setAuditLogs([]);
    toast.info('Data cleared', 'All local records wiped.');
  }, [toast]);

  // --- Local Export ---
  const exportAuditData = useCallback((format: 'json' | 'csv') => {
    if (format === 'json') {
      const jsonStr = JSON.stringify(auditLogs, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentgate_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['ID', 'CreatedAt', 'Agent', 'Tool', 'Action', 'Target', 'Risk', 'Decision', 'Status', 'Reason', 'Simulation'];
      const rows = auditLogs.map(l => [
        `"${l.id}"`,
        `"${l.createdAt || l.timestamp}"`,
        `"${l.agentName.replace(/"/g, '""')}"`,
        `"${l.toolCode}"`,
        `"${l.action.replace(/"/g, '""')}"`,
        `"${(l.target || '').replace(/"/g, '""')}"`,
        `"${l.riskLevel}"`,
        `"${l.decision}"`,
        `"${l.status}"`,
        `"${l.reason.replace(/"/g, '""')}"`,
        `"${l.simulation ? 'YES' : 'NO'}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentgate_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [auditLogs]);

  // --- Phase 1 & 14: Dynamic Statistics Calculated Strictly from Real Data ---
  const stats = useMemo(() => {
    const today = new Date().toDateString();

    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => (a.status || '').toUpperCase() === 'ACTIVE').length;
    const pendingApprovals = actionRequests.filter(r => r.status === 'pending').length;

    // Actions today: count of action events registered today
    const actionsToday = auditLogs.filter(l => {
      const dateStr = l.createdAt || l.timestamp;
      return new Date(dateStr).toDateString() === today;
    }).length;

    // Blocked actions: count of blocked or rejected audit events
    const blockedActions = auditLogs.filter(
      l => l.decision === 'BLOCK' || l.status === 'blocked' || l.status === 'rejected'
    ).length;

    // Allowed actions
    const allowedActions = auditLogs.filter(
      l => l.decision === 'ALLOW' || l.status === 'executed' || l.status === 'approved'
    ).length;

    return {
      totalAgents,
      activeAgents,
      pendingApprovals,
      actionsToday,
      blockedActions,
      allowedActions
    };
  }, [agents, actionRequests, auditLogs]);

  // --- Phase 9: Real Security Posture ---
  const securityPosture = useMemo<SecurityPosture>(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => (a.status || '').toUpperCase() === 'ACTIVE').length;
    const totalTools = SYSTEM_TOOLS.length;
    const pendingApprovalsCount = actionRequests.filter(r => r.status === 'pending').length;
    const blockedCount = auditLogs.filter(l => l.decision === 'BLOCK' || l.status === 'blocked' || l.status === 'rejected').length;
    const allowedCount = auditLogs.filter(l => l.decision === 'ALLOW' || l.status === 'executed' || l.status === 'approved').length;

    // Check how many critical tools have explicit BLOCK in agents
    let criticalBlocked = 0;
    agents.forEach(a => {
      if (a.permissions['DELETE_DATA'] === 'BLOCK') {
        criticalBlocked++;
      }
    });

    // Policy Coverage: configured explicit permissions / total required permissions across assigned tools
    let totalAssignments = 0;
    let explicitlyCovered = 0;
    agents.forEach(a => {
      a.tools.forEach(t => {
        totalAssignments++;
        if (a.permissions[t.toUpperCase()]) {
          explicitlyCovered++;
        }
      });
    });

    const hasData = totalAgents > 0;
    const coveragePercentage = totalAssignments > 0
      ? Math.round((explicitlyCovered / totalAssignments) * 100)
      : (hasData ? 100 : 0);

    const recommendations: SecurityPosture['recommendations'] = [];

    if (!hasData) {
      recommendations.push({
        id: 'rec_no_agents',
        level: 'info',
        title: 'No Active Agents Configured',
        message: 'Create your first autonomous agent and assign permissions to begin security monitoring.',
        actionable: true,
        fixAction: '/agents'
      });
    } else {
      // Recommendation 1: Pending reviews
      if (pendingApprovalsCount > 0) {
        recommendations.push({
          id: 'rec_pending',
          level: 'warning',
          title: `${pendingApprovalsCount} Action${pendingApprovalsCount > 1 ? 's' : ''} Awaiting Review`,
          message: 'Sensitive actions are paused at security boundaries. Review and authorize or reject pending actions.',
          actionable: true,
          fixAction: '/approvals'
        });
      }

      // Recommendation 2: Critical tools enforcement
      const deleteToolAgents = agents.filter(a => a.tools.map(t => t.toUpperCase()).includes('DELETE_DATA'));
      const unblockedDelete = deleteToolAgents.filter(a => a.permissions['DELETE_DATA'] !== 'BLOCK');
      if (unblockedDelete.length > 0) {
        recommendations.push({
          id: 'rec_delete_unblocked',
          level: 'critical',
          title: 'Destructive Tool Not Blocked',
          message: `${unblockedDelete.length} agent(s) have DELETE_DATA assigned without explicit BLOCK policy.`,
          actionable: true,
          fixAction: '/agents'
        });
      } else {
        recommendations.push({
          id: 'rec_delete_good',
          level: 'good',
          title: 'Destructive Actions Blocked by Default',
          message: 'DELETE_DATA is strictly guarded across all active agents according to least-privilege standards.',
          actionable: false
        });
      }

      // Recommendation 3: Agents with unconfigured policies
      const looselyConfigured = agents.filter(a => a.tools.some(t => !a.permissions[t.toUpperCase()]));
      if (looselyConfigured.length > 0) {
        recommendations.push({
          id: 'rec_loose_policy',
          level: 'info',
          title: 'Implicit Fallback Policies Detected',
          message: `${looselyConfigured.length} agent(s) rely on tool risk defaults rather than explicit policies.`,
          actionable: true,
          fixAction: '/agents'
        });
      } else {
        recommendations.push({
          id: 'rec_tight_policy',
          level: 'good',
          title: 'Full Policy Explicit Coverage',
          message: 'All registered agent tools have explicit ALLOW/ASK/BLOCK directives declared.',
          actionable: false
        });
      }
    }

    const today = new Date().toDateString();
    const actionsToday = auditLogs.filter(l => {
      const dateStr = l.createdAt || l.timestamp;
      return new Date(dateStr).toDateString() === today;
    }).length;

    return {
      coveragePercentage,
      totalAgents,
      activeAgents,
      totalTools,
      criticalToolsCount: 1,
      criticalToolsBlockedCount: criticalBlocked,
      pendingApprovalsCount,
      totalActionsToday: actionsToday,
      blockedCount,
      allowedCount,
      hasData,
      recommendations
    };
  }, [agents, actionRequests, auditLogs]);

  return (
    <AgentGateContext.Provider
      value={{
        user,
        isDemoMode: Boolean(user?.isDemo),
        theme,
        toggleTheme,
        aiExplanationEnabled,
        toggleAiExplanation,
        agents,
        actionRequests,
        auditLogs,
        createAgent,
        updateAgent,
        deleteAgent,
        pauseAgent,
        resumeAgent,
        toggleAgentPause,
        duplicateAgent,
        runActionSimulation,
        approveAction,
        rejectAction,
        resetToDemoData,
        clearAllData,
        exportAuditData,
        loginAsDemo,
        logout,
        securityPosture,
        stats
      }}
    >
      {children}
    </AgentGateContext.Provider>
  );
};

export const useAgentGate = () => {
  const context = useContext(AgentGateContext);
  if (!context) {
    throw new Error('useAgentGate must be used within an AgentGateProvider');
  }
  return context;
};
