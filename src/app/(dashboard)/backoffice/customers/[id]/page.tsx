'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { backofficeService } from '@/services/backofficeService';
import { BackofficeCustomer, BackofficeUser, PaginatedResponse } from '@/types/backoffice';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';
import { ROUTES } from '@/constants';
import StatusBadge from '@/components/backoffice/StatusBadge';

const PAGE_SIZE = 10;

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const userRole = useAuthStore((state) => state.user?.role ?? UserRole.Viewer);
  const canMutate = userRole >= UserRole.Owner;

  // The backend uses Tenant as the underlying entity for "customers"
  // Users are listed via /tenants/{id}/users
  const [usersData, setUsersData] = useState<PaginatedResponse<BackofficeUser> | null>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  // We derive customer info from the users listing — fetch tenant via /customers list and match
  // For simplicity we show users directly, status toggle goes via customers endpoint
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await backofficeService.listTenantUsers(id, {
        page: usersPage,
        pageSize: PAGE_SIZE,
      });
      setUsersData(result);
    } catch {
      setError('Failed to load users for this customer.');
    } finally {
      setLoading(false);
    }
  }, [id, usersPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Load the customer status from customers list
  useEffect(() => {
    backofficeService
      .listCustomers({ page: 1, pageSize: 100 })
      .then((res) => {
        const match = res.items.find((c) => c.id === id);
        if (match) setIsActive(match.isActive);
      })
      .catch(() => {});
  }, [id]);

  const handleToggleStatus = async () => {
    if (!canMutate || isActive === null) return;
    setToggling(true);
    try {
      await backofficeService.updateCustomerStatus(id, !isActive);
      setIsActive((prev) => !prev);
    } catch {
      setError('Failed to update customer status.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.BACKOFFICE_CUSTOMERS}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Customers
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customer Detail</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{id}</p>
        </div>
        <div className="flex items-center gap-3">
          {isActive !== null && <StatusBadge isActive={isActive} />}
          {canMutate && isActive !== null && (
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`text-sm px-3 py-1.5 rounded-md font-medium ${
                isActive
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
              } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {toggling ? 'Saving…' : isActive ? 'Deactivate Customer' : 'Activate Customer'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Users</h3>
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
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(canMutate ? 5 : 4)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !usersData || usersData.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={canMutate ? 5 : 4}
                    className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                usersData.items.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    canMutate={canMutate}
                    onUpdated={(userId, active) =>
                      setUsersData((prev) =>
                        prev
                          ? {
                              ...prev,
                              items: prev.items.map((u) =>
                                u.id === userId ? { ...u, isActive: active } : u
                              ),
                            }
                          : prev
                      )
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {usersData && usersData.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{usersData.totalItems} user{usersData.totalItems !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                disabled={usersPage === 1}
                className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40"
              >
                Prev
              </button>
              <span>
                {usersPage} / {usersData.totalPages}
              </span>
              <button
                onClick={() => setUsersPage((p) => Math.min(usersData.totalPages, p + 1))}
                disabled={usersPage === usersData.totalPages}
                className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  canMutate,
  onUpdated,
}: {
  user: BackofficeUser;
  canMutate: boolean;
  onUpdated: (id: string, isActive: boolean) => void;
}) {
  const [toggling, setToggling] = useState(false);
  const roleLabels = ['Viewer', 'User', 'Admin', 'Owner'];

  const handleToggle = async () => {
    setToggling(true);
    try {
      await backofficeService.updateUserStatus(user.id, !user.isActive);
      onUpdated(user.id, !user.isActive);
    } finally {
      setToggling(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
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
        {roleLabels[user.role] ?? user.role}
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
            onClick={handleToggle}
            disabled={toggling}
            className={`text-xs px-2 py-1 rounded font-medium ${
              user.isActive
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
            } disabled:opacity-50 focus:outline-none`}
          >
            {toggling ? 'Saving…' : user.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      )}
    </tr>
  );
}
