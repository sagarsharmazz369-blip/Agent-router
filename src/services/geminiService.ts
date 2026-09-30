export interface GeminiExplanationResponse {
  available: boolean;
  explanation: string;
}

/**
 * Explains an action request decision in simple, beginner-friendly language
 */
export async function getActionExplanation(params: {
  agentName: string;
  toolName: string;
  action: string;
  target?: string;
  riskLevel: string;
  decision: string;
  reason: string;
}): Promise<string> {
  try {
    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'decision',
        context: params
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.explanation && data.available) {
        return data.explanation;
      }
    }
  } catch (err) {
    // Network or server fallback
  }

  // High-fidelity fallback explanation grounded in AgentGate principles
  if (params.decision === 'BLOCK') {
    return `AgentGate blocked this action because "${params.toolName}" involves ${params.riskLevel} risk or a destructive operation. Under least-privilege principles, critical actions like data deletion are blocked by default so no agent can irreversibly affect your systems without explicit manual intervention.`;
  }

  if (params.decision === 'ASK') {
    return `AgentGate requested your approval because "${params.toolName}" interacts with an external service or sensitive data (${params.riskLevel} risk). Even trusted agents pause at sensitive boundaries until a human operator verifies the target "${params.target || 'destination'}".`;
  }

  return `AgentGate allowed this action automatically because "${params.toolName}" is categorized as ${params.riskLevel} risk and performs read-only exploration or internal computation that matches the agent's pre-approved scope.`;
}

/**
 * Recommends permission policies for an agent based on its stated purpose
 */
export async function getPolicyRecommendations(agentName: string, description: string): Promise<string> {
  try {
    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'policy_recommendation',
        context: { name: agentName, description }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.explanation && data.available) {
        return data.explanation;
      }
    }
  } catch (err) {
    // Fallback
  }

  return `Recommended Policy based on least privilege:
• Web Search & File Reader: ALLOW (Needed for reading materials without side effects).
• Messages & Database Writes: ASK (Human review ensures external communications or persistent modifications are verified).
• Delete Data: BLOCK (Destructive actions should never be automated unless critical emergency protocols apply).`;
}
