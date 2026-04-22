'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { backofficeService } from '@/services/backofficeService';
import { BackofficeTenant, BackofficeUser, PaginatedResponse } from '@/types/backoffice';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';
import StatusBadge from '@/components/backoffice/StatusBadge';

const PAGE_SIZE = 15;
const ROLE_LABELS = ['Viewer', 'User', 'Admin', 'Owner'];
type StatusFilter = 'active' | 'inactive';

function toStatusFilter(value: string): StatusFilter | undefined {
  return value === 'active' || value === 'inactive' ? value : undefined;
}

export default function BackofficeUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = (searchParams.get('role') ?? '').trim();
  const status = (searchParams.get('status') ?? '').trim();
  const tenantId = (searchParams.get('tenantId') ?? '').trim();
  const page = Number(searchParams.get('page') ?? '1') || 1;

  const userRole = useAuthStore((state) => state.user?.role ?? UserRole.Viewer);
  const canMutate = userRole >= UserRole.Owner;

  const [tenants, setTenants] = useState<BackofficeTenant[]>([]);
  const [usersData, setUsersData] = useState<PaginatedResponse<BackofficeUser> | null>(null);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === tenantId) ?? null,
    [tenants, tenantId]
  );

  const updateQuery = useCallback(
    (next: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === 0) {
          params.delete(key);
          return;
        }
        params.set(key, String(value));
      });
      const query = params.toString();
      router.replace(query ? `?${query}` : '?', { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const loadTenants = async () => {
      setLoadingTenants(true);
      setError(null);
      try {
        const response = await backofficeService.listTenants({
          page: 1,
          pageSize: 100,
          sortBy: 'name',
          sortDir: 'asc',
        });
        setTenants(response.items);

        if (!tenantId && response.items.length > 0) {
          updateQuery({ tenantId: response.items[0].id, page: 1 });
        }
      } catch {
        setError('Failed to load tenants.');
      } finally {
        setLoadingTenants(false);
      }
    };

    loadTenants();
  }, [tenantId, updateQuery]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!tenantId) {
        setUsersData(null);
        return;
      }

      setLoadingUsers(true);
      setError(null);
      try {
        const response = await backofficeService.listTenantUsers(tenantId, {
          page,
          pageSize: PAGE_SIZE,
          role: role || undefined,
          status: toStatusFilter(status),
        });
        setUsersData(response);
      } catch {
        setError('Failed to load users.');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [tenantId, role, status, page]);

  const onTenantChange = (value: string) => {
    updateQuery({ tenantId: value, page: 1 });
  };

  const onRoleChange = (value: string) => {
    updateQuery({ role: value || undefined, page: 1 });
  };

  const onStatusChange = (value: string) => {
    updateQuery({ status: value || undefined, page: 1 });
  };

  const onPageChange = (nextPage: number) => {
    updateQuery({ page: nextPage });
  };

  const onToggleUserStatus = async (user: BackofficeUser) => {
    if (!canMutate) return;

    setTogglingUserId(user.id);
    try {
      await backofficeService.updateUserStatus(user.id, !user.isActive);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully.`);
      setUsersData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === user.id ? { ...item, isActive: !item.isActive } : item
              ),
            }
          : prev
      );
    } catch {
      toast.error('Failed to update user status.');
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tenant
            </label>
            <select
              value={tenantId}
              onChange={(e) => onTenantChange(e.target.value)}
              disabled={loadingTenants}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              {!tenantId && <option value="">Select a tenant</option>}
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              <option value="">All roles</option>
              <option value="Viewer">Viewer</option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Owner">Owner</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {selectedTenant && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing users for <span className="font-medium">{selectedTenant.name}</span>.
        </p>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Login
              </th>
              {canMutate && <th className="px-4 py-3" />}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loadingUsers ? (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {[...Array(canMutate ? 5 : 4)].map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !usersData || usersData.items.length === 0 ? (
              <tr>
                <td
                  colSpan={canMutate ? 5 : 4}
                  className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              usersData.items.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.firstName || user.lastName
                          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                          : '—'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isActive={user.isActive} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '—'}
                  </td>
                  {canMutate && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onToggleUserStatus(user)}
                        disabled={togglingUserId === user.id}
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          user.isActive
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                            : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                        } disabled:opacity-50`}
                      >
                        {togglingUserId === user.id
                          ? 'Saving…'
                          : user.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {usersData && usersData.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {usersData.totalItems} user{usersData.totalItems !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              {page} / {usersData.totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(usersData.totalPages, page + 1))}
              disabled={page === usersData.totalPages}
              className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
