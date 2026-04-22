'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { backofficeService } from '@/services/backofficeService';
import { BackofficeTenant } from '@/types/backoffice';
import { useAuthStore } from '@/store/auth';
import { PlatformRole } from '@/types';
import { ROUTES } from '@/constants';
import StatusBadge from '@/components/backoffice/StatusBadge';

const PAGE_SIZE = 25;

export default function BackofficeTenantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const platformRole = useAuthStore((state) => state.user?.platformRole ?? null);
  const canMutate = platformRole === PlatformRole.BackofficeOperator
    || platformRole === PlatformRole.BackofficeAdmin;

  const initialPage = Number(searchParams.get('page') ?? '1') || 1;
  const initialStatus = (searchParams.get('status') as 'all' | 'active' | 'inactive' | null) ?? 'all';
  const initialSearch = searchParams.get('search') ?? '';

  const [tenants, setTenants] = useState<BackofficeTenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const returnParams = new URLSearchParams();
  if (page > 1) returnParams.set('page', String(page));
  if (statusFilter !== 'all') returnParams.set('status', statusFilter);
  if (search) returnParams.set('search', search);
  const returnQuery = returnParams.toString() ? `?${returnParams.toString()}` : '';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await backofficeService.listTenants({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      setTenants(result.items);
      setTotal(result.totalItems);
      setTotalPages(result.totalPages);
    } catch {
      setError('Failed to load tenants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);
    const query = params.toString();
    router.replace(query ? `?${query}` : '?', { scroll: false });
  }, [page, statusFilter, search, router]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusFilter = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleToggleStatus = async (tenant: BackofficeTenant) => {
    if (!canMutate) return;
    setTogglingId(tenant.id);
    try {
      await backofficeService.updateTenantStatus(tenant.id, !tenant.isActive);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, isActive: !t.isActive } : t))
      );
      toast.success(`Tenant ${tenant.isActive ? 'deactivated' : 'activated'} successfully.`);
    } catch {
      setError('Failed to update tenant status.');
      toast.error('Failed to update tenant status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tenants…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${
                statusFilter === s
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tenant
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Users
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pipelines
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  No tenants found.
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <div>
                      <Link
                        href={`${ROUTES.BACKOFFICE_TENANT_DETAIL(tenant.id)}?back=${encodeURIComponent(returnQuery)}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {tenant.name}
                      </Link>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{tenant.subdomain}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {['Free', 'Pro', 'Enterprise'][tenant.plan] ?? tenant.plan}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-200">{tenant.ownerName || '—'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{tenant.ownerEmail || 'No owner assigned'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {tenant.userCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {tenant.pipelineCount}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isActive={tenant.isActive} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canMutate && (
                      <button
                        onClick={() => handleToggleStatus(tenant)}
                        disabled={togglingId === tenant.id}
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          tenant.isActive
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                            : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                        } disabled:opacity-50 focus:outline-none`}
                      >
                        {togglingId === tenant.id
                          ? 'Saving…'
                          : tenant.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {total} tenant{total !== 1 ? 's' : ''} total
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 focus:outline-none"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 focus:outline-none"
              aria-label="Next page"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
