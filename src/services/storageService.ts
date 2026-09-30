import { Agent, ActionRequest, AuditLog, UserProfile } from '../types';
import { INITIAL_DEMO_AGENTS, INITIAL_DEMO_REQUESTS, INITIAL_DEMO_LOGS } from '../lib/seedData';

const STORAGE_KEYS = {
  AGENTS: 'agentgate_v1_agents',
  REQUESTS: 'agentgate_v1_requests',
  LOGS: 'agentgate_v1_logs',
  USER: 'agentgate_v1_user',
  THEME: 'agentgate_v1_theme',
  AI_EXPLAIN: 'agentgate_v1_ai_explain',
  VERSION: 'agentgate_v2_policy_version'
};

const POLICY_VERSION = '2.2';

/**
 * Data-access abstraction layer for AgentGate.
 * Enables zero-UI-change transition to Firestore/Cloud backend.
 */
class AgentGateStorageService {
  // --- Agents ---
  getAgents(): Agent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AGENTS);
      if (data) {
        const agents: Agent[] = JSON.parse(data);
        const version = localStorage.getItem(STORAGE_KEYS.VERSION);

        // One-time migration to resolve stale localStorage where Research Agent might have had an unintended BLOCK or missing SEND_MESSAGE
        if (version !== POLICY_VERSION && Array.isArray(agents)) {
          const migrated = agents.map(agent => {
            if (agent.id === 'agent_research_01' || agent.name === 'Research Agent') {
              const tools = agent.tools || [];
              const hasSend = tools.some(t => t.toUpperCase() === 'SEND_MESSAGE');
              const nextTools = hasSend ? tools : [...tools, 'SEND_MESSAGE'];
              const perms = { ...(agent.permissions || {}) };

              // If SEND_MESSAGE was previously stored as BLOCK in stale state, clear it so there is no explicit policy
              if (perms['SEND_MESSAGE'] === 'BLOCK') {
                delete perms['SEND_MESSAGE'];
              }

              return {
                ...agent,
                tools: nextTools,
                permissions: perms
              };
            }
            return agent;
          });

          localStorage.setItem(STORAGE_KEYS.VERSION, POLICY_VERSION);
          this.saveAgents(migrated);
          return migrated;
        }

        return agents;
      }
    } catch (e) {
      console.error('Error reading agents from storage:', e);
    }
    return INITIAL_DEMO_AGENTS;
  }

  saveAgents(agents: Agent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
    } catch (e) {
      console.error('Error saving agents to storage:', e);
    }
  }

  getAgentById(id: string): Agent | null {
    const agents = this.getAgents();
    return agents.find(a => a.id === id) || null;
  }

  saveAgent(agent: Agent): void {
    const agents = this.getAgents();
    const index = agents.findIndex(a => a.id === agent.id);
    if (index >= 0) {
      agents[index] = agent;
    } else {
      agents.unshift(agent);
    }
    this.saveAgents(agents);
  }

  deleteAgent(id: string): void {
    const agents = this.getAgents();
    this.saveAgents(agents.filter(a => a.id !== id));
  }

  // --- Action Requests ---
  getActionRequests(): ActionRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading action requests from storage:', e);
    }
    return INITIAL_DEMO_REQUESTS;
  }

  saveActionRequests(requests: ActionRequest[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Error saving action requests to storage:', e);
    }
  }

  getRequestById(id: string): ActionRequest | null {
    const requests = this.getActionRequests();
    return requests.find(r => r.id === id) || null;
  }

  updateActionRequest(request: ActionRequest): void {
    const requests = this.getActionRequests();
    const index = requests.findIndex(r => r.id === request.id);
    if (index >= 0) {
      requests[index] = request;
      this.saveActionRequests(requests);
    }
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading audit logs from storage:', e);
    }
    return INITIAL_DEMO_LOGS;
  }

  saveAuditLogs(logs: AuditLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving audit logs to storage:', e);
    }
  }

  appendAuditLog(log: AuditLog): void {
    const logs = this.getAuditLogs();
    logs.unshift(log);
    this.saveAuditLogs(logs);
  }

  // --- User Profile ---
  getUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading user profile from storage:', e);
    }
    return {
      id: 'demo_operator_01',
      email: 'operator@agentgate.security',
      displayName: 'Security Operator',
      isDemo: true
    };
  }

  saveUser(user: UserProfile | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.error('Error saving user profile to storage:', e);
    }
  }

  // --- Environment Reset & Wipe ---
  resetToDemo(): { agents: Agent[]; requests: ActionRequest[]; logs: AuditLog[] } {
    this.saveAgents(INITIAL_DEMO_AGENTS);
    this.saveActionRequests(INITIAL_DEMO_REQUESTS);
    this.saveAuditLogs(INITIAL_DEMO_LOGS);
    return {
      agents: INITIAL_DEMO_AGENTS,
      requests: INITIAL_DEMO_REQUESTS,
      logs: INITIAL_DEMO_LOGS
    };
  }

  clearAll(): void {
    this.saveAgents([]);
    this.saveActionRequests([]);
    this.saveAuditLogs([]);
  }
}

export const storageService = new AgentGateStorageService();
