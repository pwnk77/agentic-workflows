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
  source?: string;
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

// JSON Storage Types for v3.1
export interface SpecDocument {
  id: string;
  metadata: {
    title: string;
    status: string;
    category: string;
    priority: string;
    created_at: string;
    updated_at: string;
    created_via?: string;
    related_specs?: string[];
    parent_spec_id?: string | null;
    tags?: string[];
    effort_estimate?: string;
    completion?: number;
  };
  sections: {
    summary: string;
    requirements: string;
    architecture: string;
    implementation?: string;
    execution_logs?: string;
    debug_logs?: string;
  };
}