import { Tool, Agent } from '../types';

export const SYSTEM_TOOLS: Tool[] = [
  {
    id: 'tool_web_search',
    code: 'WEB_SEARCH',
    name: 'Web Search',
    category: 'research',
    description: 'Searches public internet search engines and crawls public web pages for research and factual lookup.',
    riskLevel: 'low',
    defaultRisk: 'low',
    enabled: true,
    defaultPermission: 'ALLOW',
    iconName: 'Globe',
    parametersSchema: '{\n  "query": "string (search terms)",\n  "maxResults": "number (default: 5)"\n}',
    simulatedOutputTemplate: 'Retrieved 8 relevant sources and verified information across 3 domains in sandbox.'
  },
  {
    id: 'tool_read_file',
    code: 'READ_FILE',
    name: 'File Reader',
    category: 'files',
    description: 'Reads local project documents, markdown files, source code, and configuration files.',
    riskLevel: 'low',
    defaultRisk: 'low',
    enabled: true,
    defaultPermission: 'ALLOW',
    iconName: 'FileText',
    parametersSchema: '{\n  "filePath": "string (relative file path)",\n  "encoding": "utf-8"\n}',
    simulatedOutputTemplate: 'File read successfully (4.2 KB). 142 lines parsed without error.'
  },
  {
    id: 'tool_read_github',
    code: 'READ_GITHUB',
    name: 'GitHub Reader',
    category: 'research',
    description: 'Inspects code repositories, git commits, pull requests, diffs, and issue discussions.',
    riskLevel: 'low',
    defaultRisk: 'low',
    enabled: true,
    defaultPermission: 'ALLOW',
    iconName: 'GitBranch',
    parametersSchema: '{\n  "repo": "string (owner/repo)",\n  "branch": "string",\n  "path": "string"\n}',
    simulatedOutputTemplate: 'Fetched repo metadata, latest commit hash: 9d4f21a, 0 open security alerts.'
  },
  {
    id: 'tool_create_report',
    code: 'CREATE_REPORT',
    name: 'Report Generator',
    category: 'research',
    description: 'Synthesizes gathered research into structured briefings, executive summaries, and tables.',
    riskLevel: 'low',
    defaultRisk: 'low',
    enabled: true,
    defaultPermission: 'ALLOW',
    iconName: 'FileCheck',
    parametersSchema: '{\n  "title": "string",\n  "sections": "string[]",\n  "format": "markdown | pdf"\n}',
    simulatedOutputTemplate: 'Executive summary report created: 3 chapters, formatted with citations.'
  },
  {
    id: 'tool_send_message',
    code: 'SEND_MESSAGE',
    name: 'Message Sender',
    category: 'communication',
    description: 'Transmits emails, Slack notifications, or webhook messages to external human recipients.',
    riskLevel: 'medium',
    defaultRisk: 'medium',
    enabled: true,
    defaultPermission: 'ASK',
    iconName: 'Mail',
    parametersSchema: '{\n  "recipient": "string (email or handle)",\n  "subject": "string",\n  "body": "string"\n}',
    simulatedOutputTemplate: 'Simulation: Dispatch message queued for human validation.'
  },
  {
    id: 'tool_database_read',
    code: 'DATABASE_READ',
    name: 'Database Reader',
    category: 'data',
    description: 'Queries existing relational or document database tables using read-only statements.',
    riskLevel: 'low',
    defaultRisk: 'low',
    enabled: true,
    defaultPermission: 'ALLOW',
    iconName: 'Database',
    parametersSchema: '{\n  "collection": "string",\n  "query": "object",\n  "limit": "number"\n}',
    simulatedOutputTemplate: 'Read query returned 24 records matching filter criteria in 18ms.'
  },
  {
    id: 'tool_database_write',
    code: 'DATABASE_WRITE',
    name: 'Database Writer',
    category: 'data',
    description: 'Inserts, modifies, or updates persistent operational records and table rows.',
    riskLevel: 'high',
    defaultRisk: 'high',
    enabled: true,
    defaultPermission: 'ASK',
    iconName: 'Layers',
    parametersSchema: '{\n  "collection": "string",\n  "docId": "string",\n  "data": "object"\n}',
    simulatedOutputTemplate: 'Simulation: Record mutation staged and validated against schema.'
  },
  {
    id: 'tool_delete_data',
    code: 'DELETE_DATA',
    name: 'Delete Data',
    category: 'destructive',
    description: 'Performs irreversible deletion of tables, database documents, or cloud storage buckets.',
    riskLevel: 'critical',
    defaultRisk: 'critical',
    enabled: true,
    defaultPermission: 'BLOCK',
    iconName: 'Trash2',
    parametersSchema: '{\n  "target": "string (collection or table identifier)",\n  "confirmToken": "string"\n}',
    simulatedOutputTemplate: 'Blocked by default policy. Permanent deletion prohibited.'
  }
];

export function getToolByCode(code: string): Tool | undefined {
  return SYSTEM_TOOLS.find(t => t.code.toUpperCase() === code.toUpperCase());
}

export function getToolById(id: string): Tool | undefined {
  return SYSTEM_TOOLS.find(t => t.id === id);
}

export function getAgentsUsingTool(toolCode: string, agents: Agent[]): Agent[] {
  return agents.filter(a => a.tools.map(t => t.toUpperCase()).includes(toolCode.toUpperCase()));
}

export function getRiskColor(risk: string) {
  switch (risk.toLowerCase()) {
    case 'low':
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        badge: 'emerald',
        label: 'Low Risk'
      };
    case 'medium':
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        badge: 'amber',
        label: 'Medium Risk'
      };
    case 'high':
      return {
        bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        badge: 'orange',
        label: 'High Risk'
      };
    case 'critical':
      return {
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        badge: 'rose',
        label: 'Critical Risk'
      };
    default:
      return {
        bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        badge: 'zinc',
        label: 'Unknown'
      };
  }
}
