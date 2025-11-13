export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  emailConfirmed: boolean;
  lastLoginAt?: string;
  tenant: Tenant;
}

export enum UserRole {
  Viewer = 0,
  User = 1,
  Admin = 2,
  Owner = 3,
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  plan: TenantPlan;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  limits: TenantLimits;
}

export enum TenantPlan {
  Free = 0,
  Pro = 1,
  Enterprise = 2,
}

export interface TenantLimits {
  maxUsers: number;
  maxPipelines: number;
  maxExecutionsPerMonth: number;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  version: string;
  yamlDefinition: string;
  isActive: boolean;
  cronExpression?: string;
  createdAt: string;
  updatedAt?: string;
  settings?: string;
  tags?: string[];
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  pipelineName: string; // Nome do pipeline
  tenantId: string;     // ID do tenant
  status: string;       // Status como string (Success, Running, etc.)
  startedAt: string;
  completedAt?: string;
  duration?: number;    // Duração em millisegundos
  logs?: string;
  errorMessage?: string;
  outputData?: string;
  metrics?: string;
  triggerType?: string;
  attemptNumber?: number;  // Número da tentativa atual
  maxAttempts?: number;    // Número máximo de tentativas
}

export enum ExecutionStatus {
  Pending = 0,
  Running = 1,
  Success = 2,
  Failed = 3,
  Cancelled = 4,
  Timeout = 5,
}

export interface QuotaUsage {
  tenantId: string;
  plan: TenantPlan;
  users: QuotaItem;
  pipelines: QuotaItem;
  executionsThisMonth: QuotaItem;
  period: QuotaPeriod;
}

export interface QuotaItem {
  current: number;
  limit: number;
  percentage: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
  remaining: number;
}

export interface QuotaPeriod {
  start: string;
  end: string;
  current: string;
  daysRemaining: number;
  totalDays: number;
  periodProgress: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  tenantSubdomain?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  tenantName: string;
  tenantSubdomain: string;
  plan?: TenantPlan;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number; // seconds until expiration
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface InviteUserRequest {
  email: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
}

// Pipeline Types
export interface CreatePipelineRequest {
  name: string;
  description?: string;
  yamlDefinition: string;
  version?: string;
  isActive?: boolean;
  cronExpression?: string;
  settings?: string;
  tags?: string[];
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  yamlDefinition?: string;
  version?: string;
  isActive?: boolean;
  cronExpression?: string;
  settings?: string;
  tags?: string[];
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}