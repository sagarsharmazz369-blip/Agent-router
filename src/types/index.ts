export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type PermissionLevel = 'ALLOW' | 'ASK' | 'BLOCK';

export type ToolCategory = 'research' | 'files' | 'communication' | 'data' | 'destructive' | 'system';

export type AgentStatus = 'ACTIVE' | 'PAUSED';

export interface Tool {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ToolCategory;
  riskLevel: RiskLevel;
  defaultRisk: RiskLevel; // alias for compatibility
  enabled: boolean;
  defaultPermission: PermissionLevel;
  iconName: string;
  parametersSchema?: string;
  simulatedOutputTemplate?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  tools: string[]; // tool codes (e.g. ['WEB_SEARCH', 'READ_FILE'])
  permissions: Record<string, PermissionLevel>; // toolCode -> PermissionLevel
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  icon: string;
  stats?: {
    totalRequests: number;
    allowed: number;
    pending: number;
    blocked: number;
  };
}

export type ActionRequestStatus = 'pending' | 'approved' | 'rejected' | 'blocked' | 'executed';

export interface ActionRequest {
  id: string;
  agentId: string;
  agentName: string;
  toolId: string;
  toolCode: string;
  toolName: string;
  action: string;
  target?: string;
  reason: string;
  riskLevel: RiskLevel;
  decision: PermissionLevel;
  status: ActionRequestStatus;
  requestedAt: string;
  createdAt?: string; // alias
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  executionResult?: {
    success: boolean;
    output: string;
    executedAt: string;
  };
  simulation: boolean;
  isSimulation?: boolean; // alias for backward-compatibility
  userId?: string;
}

export interface AuditLog {
  id: string;
  agentId: string;
  agentName: string;
  toolId: string;
  toolCode: string;
  toolName: string;
  action: string;
  target?: string;
  decision: PermissionLevel;
  status: ActionRequestStatus;
  riskLevel: RiskLevel;
  reason: string;
  simulation: boolean;
  isSimulation?: boolean; // alias
  createdAt: string;
  timestamp: string; // alias
  userId?: string;
  reviewedBy?: string;
}

export interface SecurityPosture {
  coveragePercentage: number;
  totalAgents: number;
  activeAgents: number;
  totalTools: number;
  criticalToolsCount: number;
  criticalToolsBlockedCount: number;
  pendingApprovalsCount: number;
  totalActionsToday: number;
  blockedCount: number;
  allowedCount: number;
  hasData: boolean;
  recommendations: Array<{
    id: string;
    level: 'info' | 'warning' | 'critical' | 'good';
    title: string;
    message: string;
    actionable: boolean;
    fixAction?: string;
  }>;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  isDemo: boolean;
}
