/** Tenant management domain types */

export type TenantPlan = 'standard' | 'professional' | 'enterprise';
export type TenantStatus = 'active' | 'disabled' | 'pending';

export interface TenantQuotaConfig {
  daily_token_limit: number;
  app_limit: number;
  knowledge_base_limit: number;
}

export interface TenantFeatureFlags {
  rag_enabled: boolean;
  agent_enabled: boolean;
  workflow_enabled: boolean;
  prompt_management_enabled: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  quota_config: TenantQuotaConfig;
  feature_flags: TenantFeatureFlags;
  allowed_models: string[];
  created_at: string;
  updated_at: string;
}

export interface TenantCreateRequest {
  name: string;
  slug: string;
  plan: TenantPlan;
  quota_config?: Partial<TenantQuotaConfig>;
  feature_flags?: Partial<TenantFeatureFlags>;
  allowed_models?: string[];
}

export interface TenantUpdateRequest {
  name?: string;
  plan?: TenantPlan;
  quota_config?: Partial<TenantQuotaConfig>;
  feature_flags?: Partial<TenantFeatureFlags>;
  allowed_models?: string[];
}

// --- Tenant Members ---
export type TenantMemberRole = 'tenant_admin' | 'tenant_developer' | 'tenant_viewer';

export interface TenantMember {
  id: string;
  user_id: string;
  username: string;
  email: string;
  role: TenantMemberRole;
  joined_at: string;
  status: 'active' | 'invited' | 'disabled';
}

export interface TenantMemberInviteRequest {
  email: string;
  role: TenantMemberRole;
  send_email?: boolean;
}

// --- Tenant API Keys ---
export interface TenantApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  allowed_models: string[];
  ip_whitelist: string[];
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  is_enabled: boolean;
}

export interface TenantApiKeyCreateRequest {
  name: string;
  permissions: string[];
  allowed_models?: string[];
  expires_at?: string | null;
  ip_whitelist?: string[];
}

export interface TenantApiKeyCreateResponse {
  id: string;
  key: string; // Only returned on creation
  key_prefix: string;
  name: string;
}

export interface TenantApiKeyUpdateRequest {
  name?: string;
  permissions?: string[];
  allowed_models?: string[];
  expires_at?: string | null;
  ip_whitelist?: string[];
}

export interface TenantApiKeyRotateResponse {
  id: string;
  new_key: string; // Only returned on rotation
  key_prefix: string;
}

// --- Tenant Usage ---
export interface TenantUsageSummary {
  period: string;
  tokens_used: number;
  tokens_limit: number;
  requests_used: number;
  requests_limit: number;
  storage_used: number;
  storage_limit: number;
  active_apps: number;
  app_limit: number;
}

export interface TenantUsageDataPoint {
  date: string;
  tokens: number;
  requests: number;
}

export interface TenantUsageByDimension {
  dimension: string;
  tokens: number;
  requests: number;
}

export interface TenantUsage {
  summary: TenantUsageSummary;
  daily: TenantUsageDataPoint[];
  by_app: TenantUsageByDimension[];
  by_model: TenantUsageByDimension[];
}

// --- Tenant Available Model ---
export interface TenantAvailableModel {
  name: string;
  provider: string;
  display_name: string;
  status: 'available' | 'unavailable';
  quota_remaining: number | null;
}

// --- Tenant Settings ---
export interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  description: string;
  notification_email: string;
  quota_alert_threshold: number;
  global_ip_whitelist: string[];
  default_api_key_expiry_days: number | null;
}

export interface TenantSettingsUpdateRequest {
  name?: string;
  description?: string;
  notification_email?: string;
  quota_alert_threshold?: number;
  global_ip_whitelist?: string[];
  default_api_key_expiry_days?: number | null;
}

// --- Audit Log ---
export interface TenantAuditLog {
  id: string;
  actor_id: string;
  actor_username: string;
  actor_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string | null;
  request_data: Record<string, unknown> | null;
  response_code: number;
  tokens_consumed: number | null;
  created_at: string;
}

export interface TenantAuditLogFilters {
  start_date?: string;
  end_date?: string;
  actor_id?: string;
  action?: string;
  resource_type?: string;
}

// --- Available permissions for API keys ---
export const API_KEY_PERMISSIONS = [
  'chat.write',
  'chat.read',
  'rag.read',
  'rag.write',
  'agent.execute',
  'agent.read',
  'workflow.execute',
  'workflow.read',
  'prompt.read',
  'prompt.write',
  'models.read',
  'usage.read',
] as const;

export type ApiKeyPermission = (typeof API_KEY_PERMISSIONS)[number];
