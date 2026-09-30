import { Agent, Tool, PermissionLevel, RiskLevel } from '../types';
import { getToolByCode } from './toolsRegistry';

export interface EvaluationResult {
  decision: PermissionLevel;
  riskLevel: RiskLevel;
  ruleMatched: string;
  reason: string;
  requiresApproval: boolean;
  canExecuteSimulation: boolean;
}

export interface PermissionInput {
  agent?: Agent | null;
  tool: Tool | string;
  requestedAction?: string;
  target?: string;
  userReason?: string;
}

/**
 * Dedicated Deterministic Permission Engine for AgentGate
 * 
 * Evaluation Order:
 * 1. If agent does not exist → BLOCK
 * 2. If agent is PAUSED → BLOCK
 * 3. If tool is not assigned to the agent → BLOCK
 * 4. If explicit agent permission exists → use that exact permission:
 *    - ALLOW → ALLOW
 *    - ASK → ASK
 *    - BLOCK → BLOCK
 * 5. If there is no explicit permission:
 *    - LOW → ALLOW
 *    - MEDIUM → ASK
 *    - HIGH → ASK
 *    - CRITICAL → BLOCK
 * 
 * Explicit user policies always override defaults.
 * Decisions are strictly deterministic — no LLM or semantic inference alters decisions.
 */
export function evaluatePermission(input: PermissionInput): EvaluationResult {
  const { agent, tool } = input;

  const toolCode = typeof tool === 'string' ? tool.toUpperCase() : tool.code.toUpperCase();
  const toolObj = typeof tool === 'string' ? getToolByCode(toolCode) : tool;

  // 1. If agent does not exist → BLOCK
  if (!agent) {
    return {
      decision: 'BLOCK',
      riskLevel: toolObj?.riskLevel || 'high',
      ruleMatched: 'AGENT_DOES_NOT_EXIST',
      reason: 'Agent does not exist in registry. Execution blocked.',
      requiresApproval: false,
      canExecuteSimulation: false
    };
  }

  // 2. If agent is PAUSED → BLOCK
  const statusUpper = (agent.status || '').toUpperCase();
  if (statusUpper === 'PAUSED') {
    return {
      decision: 'BLOCK',
      riskLevel: toolObj?.riskLevel || 'medium',
      ruleMatched: 'AGENT_PAUSED_SAFETY_RULE',
      reason: `Agent is paused. All action requests for "${agent.name}" are halted automatically.`,
      requiresApproval: false,
      canExecuteSimulation: false
    };
  }

  // Verify registered tool
  if (!toolObj) {
    return {
      decision: 'BLOCK',
      riskLevel: 'high',
      ruleMatched: 'UNREGISTERED_TOOL_RULE',
      reason: `The requested capability "${toolCode}" is not registered in the system tool registry.`,
      requiresApproval: false,
      canExecuteSimulation: false
    };
  }

  // 3. If tool is not assigned to the agent → BLOCK
  const assignedTools = (agent.tools || []).map(t => t.toUpperCase());
  const isAssigned = assignedTools.includes(toolCode);
  if (!isAssigned) {
    return {
      decision: 'BLOCK',
      riskLevel: toolObj.riskLevel,
      ruleMatched: 'UNASSIGNED_CAPABILITY_RULE',
      reason: `Agent "${agent.name}" does not have "${toolObj.name}" assigned in its capability list. Least-privilege violation prevented.`,
      requiresApproval: false,
      canExecuteSimulation: false
    };
  }

  // 4. If explicit agent permission exists → use that exact permission
  const explicitPolicy = agent.permissions
    ? (agent.permissions[toolCode] || agent.permissions[toolCode.toUpperCase()])
    : undefined;

  if (explicitPolicy) {
    const policyUpper = (explicitPolicy as string).toUpperCase() as PermissionLevel;

    if (policyUpper === 'BLOCK') {
      return {
        decision: 'BLOCK',
        riskLevel: toolObj.riskLevel,
        ruleMatched: 'EXPLICIT_POLICY_BLOCK',
        reason: `Explicit agent policy blocks "${toolObj.name}". Execution denied by operator configuration.`,
        requiresApproval: false,
        canExecuteSimulation: false
      };
    }

    if (policyUpper === 'ASK') {
      return {
        decision: 'ASK',
        riskLevel: toolObj.riskLevel,
        ruleMatched: 'EXPLICIT_POLICY_ASK',
        reason: `Explicit agent policy requires human operator approval for "${toolObj.name}".`,
        requiresApproval: true,
        canExecuteSimulation: false
      };
    }

    if (policyUpper === 'ALLOW') {
      return {
        decision: 'ALLOW',
        riskLevel: toolObj.riskLevel,
        ruleMatched: 'EXPLICIT_POLICY_ALLOW',
        reason: `Explicit agent policy authorizes "${toolObj.name}" for automatic execution.`,
        requiresApproval: false,
        canExecuteSimulation: true
      };
    }
  }

  // 5. If there is no explicit permission, use risk-based defaults:
  //    - LOW → ALLOW
  //    - MEDIUM → ASK
  //    - HIGH → ASK
  //    - CRITICAL → BLOCK
  const risk = (toolObj.riskLevel || 'medium').toLowerCase() as RiskLevel;
  switch (risk) {
    case 'low':
      return {
        decision: 'ALLOW',
        riskLevel: 'low',
        ruleMatched: 'DEFAULT_LOW_RISK_ALLOW',
        reason: `Low-risk tool "${toolObj.name}" is allowed by default system policy.`,
        requiresApproval: false,
        canExecuteSimulation: true
      };

    case 'medium':
      return {
        decision: 'ASK',
        riskLevel: 'medium',
        ruleMatched: 'DEFAULT_MEDIUM_RISK_ASK',
        reason: toolCode === 'SEND_MESSAGE'
          ? 'This action requires operator approval because it sends a message to an external recipient.'
          : `Medium-risk tool "${toolObj.name}" requires operator approval by default.`,
        requiresApproval: true,
        canExecuteSimulation: false
      };

    case 'high':
      return {
        decision: 'ASK',
        riskLevel: 'high',
        ruleMatched: 'DEFAULT_HIGH_RISK_ASK',
        reason: `High-risk tool "${toolObj.name}" requires human operator approval by default.`,
        requiresApproval: true,
        canExecuteSimulation: false
      };

    case 'critical':
    default:
      return {
        decision: 'BLOCK',
        riskLevel: 'critical',
        ruleMatched: 'DEFAULT_CRITICAL_RISK_BLOCK',
        reason: `Critical risk operations with "${toolObj.name}" are blocked by default system policy.`,
        requiresApproval: false,
        canExecuteSimulation: false
      };
  }
}
