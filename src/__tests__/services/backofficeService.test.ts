import { backofficeService } from '@/services/backofficeService';

// Mock api-client
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

import apiClient from '@/lib/api-client';

const mockGet = apiClient.get as jest.Mock;
const mockPatch = apiClient.patch as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('backofficeService', () => {
  describe('getKpi', () => {
    it('should call /api/backoffice/v1/kpi and return the response', async () => {
      const kpiFixture = {
        activeCustomers: { key: 'activeCustomers', value: 42, trend: [] },
        activeTenants: { key: 'activeTenants', value: 10, trend: [] },
        activeUsers: { key: 'activeUsers', value: 200, trend: [] },
        errorRate: { key: 'errorRate', value: 1.5, trend: [] },
        generatedAt: '2026-01-01T00:00:00Z',
      };
      mockGet.mockResolvedValueOnce(kpiFixture);

      const result = await backofficeService.getKpi();

      expect(mockGet).toHaveBeenCalledWith('/api/backoffice/v1/kpi');
      expect(result).toEqual(kpiFixture);
    });
  });

  describe('listCustomers', () => {
    it('should call /api/backoffice/v1/customers with no params when query is empty', async () => {
      const paginated = { items: [], page: 1, pageSize: 25, totalItems: 0, totalPages: 0 };
      mockGet.mockResolvedValueOnce(paginated);

      const result = await backofficeService.listCustomers();

      expect(mockGet).toHaveBeenCalledWith('/api/backoffice/v1/customers');
      expect(result).toEqual(paginated);
    });

    it('should append query parameters when provided', async () => {
      mockGet.mockResolvedValueOnce({ items: [], page: 1, pageSize: 25, totalItems: 0, totalPages: 0 });

      await backofficeService.listCustomers({
        status: 'active',
        search: 'acme',
        page: 2,
        pageSize: 10,
        sortBy: 'name',
        sortDir: 'asc',
      });

      const calledUrl = mockGet.mock.calls[0][0] as string;
      expect(calledUrl).toContain('status=active');
      expect(calledUrl).toContain('search=acme');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('pageSize=10');
      expect(calledUrl).toContain('sortBy=name');
      expect(calledUrl).toContain('sortDir=asc');
    });
  });

  describe('listTenants', () => {
    it('should call /api/backoffice/v1/tenants with status filter', async () => {
      mockGet.mockResolvedValueOnce({ items: [], page: 1, pageSize: 25, totalItems: 0, totalPages: 1 });

      await backofficeService.listTenants({ status: 'inactive', page: 1 });

      const calledUrl = mockGet.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/api/backoffice/v1/tenants');
      expect(calledUrl).toContain('status=inactive');
    });
  });

  describe('listTenantUsers', () => {
    it('should call /api/backoffice/v1/tenants/{id}/users', async () => {
      mockGet.mockResolvedValueOnce({ items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });

      await backofficeService.listTenantUsers('tenant-123', { role: 'Admin' });

      const calledUrl = mockGet.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/api/backoffice/v1/tenants/tenant-123/users');
      expect(calledUrl).toContain('role=Admin');
    });
  });

  describe('getTenantEvents', () => {
    it('should call /api/backoffice/v1/tenants/{id}/events with limit', async () => {
      mockGet.mockResolvedValueOnce([]);

      await backofficeService.getTenantEvents('tenant-xyz', 15);

      expect(mockGet).toHaveBeenCalledWith('/api/backoffice/v1/tenants/tenant-xyz/events?limit=15');
    });

    it('should default limit to 20', async () => {
      mockGet.mockResolvedValueOnce([]);

      await backofficeService.getTenantEvents('tenant-xyz');

      expect(mockGet).toHaveBeenCalledWith('/api/backoffice/v1/tenants/tenant-xyz/events?limit=20');
    });
  });

  describe('updateCustomerStatus', () => {
    it('should PATCH /api/backoffice/v1/customers/{id}/status with isActive payload', async () => {
      mockPatch.mockResolvedValueOnce(undefined);

      await backofficeService.updateCustomerStatus('cust-1', false);

      expect(mockPatch).toHaveBeenCalledWith(
        '/api/backoffice/v1/customers/cust-1/status',
        { isActive: false }
      );
    });
  });

  describe('updateTenantStatus', () => {
    it('should PATCH /api/backoffice/v1/tenants/{id}/status with isActive payload', async () => {
      mockPatch.mockResolvedValueOnce(undefined);

      await backofficeService.updateTenantStatus('tenant-1', true);

      expect(mockPatch).toHaveBeenCalledWith(
        '/api/backoffice/v1/tenants/tenant-1/status',
        { isActive: true }
      );
    });
  });

  describe('updateUserStatus', () => {
    it('should PATCH /api/backoffice/v1/users/{id}/status with isActive payload', async () => {
      mockPatch.mockResolvedValueOnce(undefined);

      await backofficeService.updateUserStatus('user-1', false);

      expect(mockPatch).toHaveBeenCalledWith(
        '/api/backoffice/v1/users/user-1/status',
        { isActive: false }
      );
    });
  });
});
