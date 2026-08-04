/** API response types matching the backend schemas */

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// --- Auth ---
export interface LoginRequest {
  username: string;
  password: string;
}

/** Raw user shape returned by /auth/login — may include roles array */
export interface LoginUserPayload {
  id: string;
  username: string;
  tenant_id: string;
  roles?: { id: string; name: string }[];
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: LoginUserPayload;
}

export interface UserInfo {
  id: string;
  username: string;
  tenant_id: string;
  role: string;
}

// --- Providers ---
export interface Provider {
  id: string;
  provider_name: string;
  display_name: string | null;
  api_base_url: string | null;
  api_key_display: string | null;
  models: ModelConfig[];
  is_enabled: boolean;
  priority: number;
  created_at: string;
}

export interface ModelConfig {
  name: string;
  context_length?: number;
  capabilities?: string[];
}

export interface ProviderCreateRequest {
  provider_name: string;
  display_name?: string;
  api_base_url?: string;
  api_key?: string;
  models: ModelConfig[];
  priority?: number;
}

// --- Knowledge Base ---
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  embedding_model: string;
  doc_count: number;
  chunk_count: number;
  status: string;
  created_at: string;
}

export interface Document {
  id: string;
  filename: string;
  mime_type: string | null;
  file_size: number | null;
  chunk_count: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

// --- Agent ---
export interface Agent {
  id: string;
  name: string;
  description: string | null;
  model: string;
  tools: string[];
  max_steps: number;
  status: string;
  created_at: string;
}

export interface AgentCreateRequest {
  name: string;
  description?: string;
  system_prompt: string;
  model: string;
  tools: string[];
  max_steps?: number;
  temperature?: number;
}

// --- Conversation ---
export interface Conversation {
  id: string;
  title: string | null;
  model: string | null;
  user_id: string | null;
  message_count: number;
  total_tokens: number;
  status: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: string;
  content: string | null;
  tool_calls: unknown[] | null;
  tool_call_id: string | null;
  model: string | null;
  token_count: number | null;
  created_at: string;
}

// --- Prompt ---
export interface PromptTemplate {
  id: string;
  name: string;
  description: string | null;
  current_version: number;
  created_at: string;
}

export interface PromptVersion {
  version: number;
  content: string;
  variables: unknown[] | null;
  change_note: string | null;
  created_by: string | null;
  created_at: string;
}

// --- Workflow ---
export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  version: number;
  status: string;
  node_count: number;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: string;
  current_node: string | null;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  outputs: Record<string, unknown> | null;
}

// --- Cost ---
export interface CostSummary {
  total_cost_usd: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_requests: number;
  by_model: Record<string, {
    input_tokens: number;
    output_tokens: number;
    requests: number;
    cost_usd: number;
  }>;
  period_start: string;
  period_end: string;
}

export interface DailyCost {
  date: string;
  input_tokens: number;
  output_tokens: number;
  requests: number;
  estimated_cost_usd: number;
}

// --- Evaluation ---
export interface EvalMetric {
  metric: string;
  score: number;
  reason: string | null;
}

export interface EvalSampleResult {
  sample_index: number;
  question: string;
  generated_answer: string;
  overall_score: number;
  metrics: EvalMetric[];
}

export interface EvalRunResult {
  run_id: string;
  dataset_name: string;
  total_samples: number;
  completed_samples: number;
  failed_samples: number;
  aggregate_scores: Record<string, number>;
  duration_seconds: number;
  model: string;
  sample_results: EvalSampleResult[];
}

// --- Health ---
export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  env: string;
  dependencies: Record<string, string>;
}

// --- Tool ---
export interface Tool {
  name: string;
  description: string;
  category: string;
  parameters: Record<string, unknown>;
}
