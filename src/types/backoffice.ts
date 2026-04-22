/**
 * Backoffice domain types — mirrors pype-admin BackofficeModels
 */

export interface BackofficeCustomer {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  isActive: boolean;
  plan: number;
  tenantCount: number;
  userCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BackofficeTenant {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  isActive: boolean;
  plan: number;
  userCount: number;
  pipelineCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BackofficeUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: number;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface TenantEvent {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface KpiTrendPoint {
  date: string;
  value: number;
}

export interface KpiCard {
  key: string;
  value: number;
  trend: KpiTrendPoint[];
}

export interface BackofficeKpiResponse {
  activeCustomers: KpiCard;
  activeTenants: KpiCard;
  activeUsers: KpiCard;
  errorRate: KpiCard;
  generatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ListCustomersQuery {
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ListTenantsQuery {
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ListTenantUsersQuery {
  role?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  pageSize?: number;
}
