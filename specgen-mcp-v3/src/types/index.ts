export interface SpecMetadata {
  metadata_version: string;
  last_full_scan: string;
  specs: {
    [filename: string]: SpecInfo;
  };
}

export interface SpecInfo {
  filename: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  modified: string;
  created: string;
  manualStatus?: boolean;
  manualPriority?: boolean;
}

export interface MCPToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError: boolean;
}

export interface ThoughtState {
  currentThought: number;
  totalThoughts: number;
  phase: string;
  canRevise: boolean;
  canBranch: boolean;
  reasoning: string;
  nextAction?: string;
}

export interface WorkflowResult {
  specId: string;
  status: string;
  result: any;
  thoughtProgress: ThoughtState;
  errors?: string[];
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  key: string;
}

export interface SecurityConfig {
  requiresConfirmation: boolean;
  permissionLevel: 'read' | 'write' | 'admin';
  auditLog: boolean;
}

export interface ToolConfig {
  timeout?: number;
  caching?: CacheConfig;
  security?: SecurityConfig;
}