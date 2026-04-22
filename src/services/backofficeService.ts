import apiClient from '@/lib/api-client';
import {
  BackofficeKpiResponse,
  BackofficeCustomer,
  BackofficeTenant,
  BackofficeUser,
  TenantEvent,
  PaginatedResponse,
  ListCustomersQuery,
  ListTenantsQuery,
  ListTenantUsersQuery,
} from '@/types/backoffice';

const BASE = '/api/backoffice/v1';

class BackofficeService {
  async getKpi(): Promise<BackofficeKpiResponse> {
    return apiClient.get<BackofficeKpiResponse>(`${BASE}/kpi`);
  }

  async listCustomers(
    query: ListCustomersQuery = {}
  ): Promise<PaginatedResponse<BackofficeCustomer>> {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);
    if (query.page !== undefined) params.set('page', String(query.page));
    if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortDir) params.set('sortDir', query.sortDir);
    const qs = params.toString();
    return apiClient.get<PaginatedResponse<BackofficeCustomer>>(
      `${BASE}/customers${qs ? `?${qs}` : ''}`
    );
  }

  async listTenants(
    query: ListTenantsQuery = {}
  ): Promise<PaginatedResponse<BackofficeTenant>> {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);
    if (query.page !== undefined) params.set('page', String(query.page));
    if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortDir) params.set('sortDir', query.sortDir);
    const qs = params.toString();
    return apiClient.get<PaginatedResponse<BackofficeTenant>>(
      `${BASE}/tenants${qs ? `?${qs}` : ''}`
    );
  }

  async listTenantUsers(
    tenantId: string,
    query: ListTenantUsersQuery = {}
  ): Promise<PaginatedResponse<BackofficeUser>> {
    const params = new URLSearchParams();
    if (query.role) params.set('role', query.role);
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);
    if (query.page !== undefined) params.set('page', String(query.page));
    if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
    const qs = params.toString();
    return apiClient.get<PaginatedResponse<BackofficeUser>>(
      `${BASE}/tenants/${tenantId}/users${qs ? `?${qs}` : ''}`
    );
  }

  async getTenantEvents(tenantId: string, limit = 20): Promise<TenantEvent[]> {
    return apiClient.get<TenantEvent[]>(
      `${BASE}/tenants/${tenantId}/events?limit=${limit}`
    );
  }

  async updateCustomerStatus(customerId: string, isActive: boolean): Promise<void> {
    return apiClient.patch(`${BASE}/customers/${customerId}/status`, { isActive });
  }

  async updateTenantStatus(tenantId: string, isActive: boolean): Promise<void> {
    return apiClient.patch(`${BASE}/tenants/${tenantId}/status`, { isActive });
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    return apiClient.patch(`${BASE}/users/${userId}/status`, { isActive });
  }
}

export const backofficeService = new BackofficeService();
