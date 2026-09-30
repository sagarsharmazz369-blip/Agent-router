import { ActionRequest, Agent, AuditLog } from '../types';
import { getToolByCode } from './toolsRegistry';
import { evaluatePermission } from './permissionEngine';

export interface SimulateActionResult {
  request: ActionRequest;
  auditLog: AuditLog;
  message: string;
  decision: 'ALLOW' | 'ASK' | 'BLOCK';
}

/**
 * Runs a simulated action through the deterministic permission engine
 */
export function simulateAction(params: {
  agent: Agent;
  toolCode: string;
  action: string;
  target?: string;
  reason?: string;
  userId?: string;
}): SimulateActionResult {
  const { agent, toolCode, action, target, reason, userId } = params;
  const tool = getToolByCode(toolCode);
  const toolName = tool ? tool.name : toolCode;

  const evaluation = evaluatePermission({
    agent,
    tool: tool || toolCode,
    requestedAction: action,
    target,
    userReason: reason
  });

  const now = new Date().toISOString();
  const requestId = 'req_' + Math.random().toString(36).substring(2, 10);
  const logId = 'log_' + Math.random().toString(36).substring(2, 10);

  let status: ActionRequest['status'] = 'pending';
  let message = '';
  let executionResult: ActionRequest['executionResult'] | undefined = undefined;

  if (evaluation.decision === 'ALLOW') {
    status = 'executed';
    const output = tool?.simulatedOutputTemplate || 'Simulated execution completed safely in sandbox.';
    executionResult = {
      success: true,
      output,
      executedAt: now
    };
    message = `Action Allowed — ${evaluation.reason}`;
  } else if (evaluation.decision === 'ASK') {
    status = 'pending';
    message = `Approval Required — ${evaluation.reason}`;
  } else {
    // BLOCK
    status = 'blocked';
    message = `Action Blocked — ${evaluation.reason}`;
  }

  const request: ActionRequest = {
    id: requestId,
    agentId: agent.id,
    agentName: agent.name,
    toolId: tool?.id || toolCode,
    toolCode: toolCode.toUpperCase(),
    toolName,
    action,
    target: target || 'Sandbox Target',
    reason: evaluation.reason,
    riskLevel: evaluation.riskLevel,
    decision: evaluation.decision,
    status,
    requestedAt: now,
    createdAt: now,
    executionResult,
    simulation: true,
    isSimulation: true,
    userId: userId || 'demo_operator_01'
  };

  const auditLog: AuditLog = {
    id: logId,
    agentId: agent.id,
    agentName: agent.name,
    toolId: tool?.id || toolCode,
    toolCode: toolCode.toUpperCase(),
    toolName,
    action,
    target: target || 'Sandbox Target',
    decision: evaluation.decision,
    status,
    riskLevel: evaluation.riskLevel,
    reason: evaluation.reason,
    simulation: true,
    isSimulation: true,
    createdAt: now,
    timestamp: now,
    userId: userId || 'demo_operator_01'
  };

  return {
    request,
    auditLog,
    message,
    decision: evaluation.decision
  };
}

/**
 * Executes operator approval on a pending request.
 * Prevents approving already approved/rejected/blocked actions.
 */
export function executeApproval(
  request: ActionRequest,
  reviewedBy: string = 'Security Admin'
): { updatedRequest: ActionRequest; auditLog: AuditLog } | null {
  if (request.status !== 'pending') {
    console.warn(`Cannot approve action request ${request.id} with status ${request.status}`);
    return null;
  }

  const now = new Date().toISOString();
  const tool = getToolByCode(request.toolCode);

  // Status transitions: APPROVED -> EXECUTED
  const updatedRequest: ActionRequest = {
    ...request,
    status: 'executed',
    reviewedAt: now,
    reviewedBy,
    executionResult: {
      success: true,
      output: tool?.simulatedOutputTemplate || 'Operator approval granted. Simulated execution completed successfully in sandbox.',
      executedAt: now
    }
  };

  const auditLog: AuditLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 10),
    agentId: request.agentId,
    agentName: request.agentName,
    toolId: request.toolId,
    toolCode: request.toolCode,
    toolName: request.toolName,
    action: request.action,
    target: request.target,
    decision: 'ALLOW',
    status: 'executed',
    riskLevel: request.riskLevel,
    reason: `Manually approved by ${reviewedBy}. Simulated tool execution completed.`,
    simulation: true,
    isSimulation: true,
    createdAt: now,
    timestamp: now,
    userId: request.userId,
    reviewedBy
  };

  return { updatedRequest, auditLog };
}

/**
 * Executes operator rejection on a pending request.
 * Prevents rejecting already approved/rejected/blocked actions.
 */
export function executeRejection(
  request: ActionRequest,
  rejectionReason: string = 'Disallowed by security operator',
  reviewedBy: string = 'Security Admin'
): { updatedRequest: ActionRequest; auditLog: AuditLog } | null {
  if (request.status !== 'pending') {
    console.warn(`Cannot reject action request ${request.id} with status ${request.status}`);
    return null;
  }

  const now = new Date().toISOString();

  const updatedRequest: ActionRequest = {
    ...request,
    status: 'rejected',
    reviewedAt: now,
    reviewedBy,
    rejectionReason
  };

  const auditLog: AuditLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 10),
    agentId: request.agentId,
    agentName: request.agentName,
    toolId: request.toolId,
    toolCode: request.toolCode,
    toolName: request.toolName,
    action: request.action,
    target: request.target,
    decision: 'BLOCK',
    status: 'rejected',
    riskLevel: request.riskLevel,
    reason: `Rejected by ${reviewedBy}: "${rejectionReason}". Execution prevented.`,
    simulation: true,
    isSimulation: true,
    createdAt: now,
    timestamp: now,
    userId: request.userId,
    reviewedBy
  };

  return { updatedRequest, auditLog };
}
