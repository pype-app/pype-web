'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { backofficeService } from '@/services/backofficeService';
import {
  BackofficeTenant,
  BackofficeTenantPipeline,
  BackofficeUser,
  TenantEvent,
  PaginatedResponse,
} from '@/types/backoffice';
import { useAuthStore } from '@/store/auth';
import { PlatformRole } from '@/types';
import { ROUTES } from '@/constants';
import StatusBadge from '@/components/backoffice/StatusBadge';
import { toast } from 'react-hot-toast';

type Tab = 'events' | 'users' | 'pipelines';
type StatusFilter = 'active' | 'inactive';

function toStatusFilter(value: string): StatusFilter | undefined {
  return value === 'active' || value === 'inactive' ? value : undefined;
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const backQuery = searchParams.get('back') ?? '';
  const backHref = `${ROUTES.BACKOFFICE_TENANTS}${backQuery}`;
  const platformRole = useAuthStore((state) => state.user?.platformRole ?? null);
  const canMutate = platformRole === PlatformRole.BackofficeOperator
    || platformRole === PlatformRole.BackofficeAdmin;

  const initialTab = searchParams.get('tab') === 'users' ? 'users' : 'events';
  const initialUsersPage = Number(searchParams.get('usersPage') ?? '1') || 1;
  const initialRoleFilter = searchParams.get('role') ?? '';
  const initialStatusFilter = searchParams.get('status') ?? '';

  const [tenant, setTenant] = useState<BackofficeTenant | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [events, setEvents] = useState<TenantEvent[]>([]);
  const [pipelines, setPipelines] = useState<BackofficeTenantPipeline[]>([]);
  const [usersData, setUsersData] = useState<PaginatedResponse<BackofficeUser> | null>(null);
  const [usersPage, setUsersPage] = useState(initialUsersPage);
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (backQuery) params.set('back', backQuery);
    if (activeTab !== 'events') params.set('tab', activeTab);
    if (activeTab === 'users') {
      if (usersPage > 1) params.set('usersPage', String(usersPage));
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : '?', { scroll: false });
  }, [activeTab, usersPage, roleFilter, statusFilter, router, backQuery]);

  // Load tenant metadata from tenants list
  useEffect(() => {
    backofficeService
      .listTenants({ page: 1, pageSize: 100 })
      .then((res) => {
        const match = res.items.find((t) => t.id === id);
        if (match) setTenant(match);
      })
      .catch(() => {});
  }, [id]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backofficeService.getTenantEvents(id, 20);
      setEvents(data);
    } catch {
      setError('Failed to load tenant events.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backofficeService.listTenantUsers(id, {
        page: usersPage,
        pageSize: 10,
        role: roleFilter || undefined,
        status: toStatusFilter(statusFilter),
      });
      setUsersData(data);
    } catch {
      setError('Failed to load tenant users.');
    } finally {
      setLoading(false);
    }
  }, [id, usersPage, roleFilter, statusFilter]);

  const loadPipelines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backofficeService.getTenantPipelines(id);
      setPipelines(data);
    } catch {
      setError('Failed to load tenant pipelines.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'events') loadEvents();
    else if (activeTab === 'users') loadUsers();
    else loadPipelines();
  }, [activeTab, loadEvents, loadUsers, loadPipelines]);

  const handleToggleTenantStatus = async () => {
    if (!canMutate || !tenant) return;
    setToggling(true);
    try {
      await backofficeService.updateTenantStatus(id, !tenant.isActive);
      setTenant((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
      toast.success(`Tenant ${tenant.isActive ? 'deactivated' : 'activated'} successfully.`);
    } catch {
      setError('Failed to update tenant status.');
      toast.error('Failed to update tenant status.');
    } finally {
      setToggling(false);
    }
  };

  const handleToggleUserStatus = async (user: BackofficeUser) => {
    if (!canMutate) return;
    setTogglingUserId(user.id);
    try {
      await backofficeService.updateUserStatus(user.id, !user.isActive);
      setUsersData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((u) =>
                u.id === user.id ? { ...u, isActive: !u.isActive } : u
              ),
            }
          : prev
      );
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully.`);
    } catch {
      setError('Failed to update user status.');
      toast.error('Failed to update user status.');
    } finally {
      setTogglingUserId(null);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'events', label: 'Recent Events' },
    { key: 'users', label: 'Users' },
    { key: 'pipelines', label: 'Pipelines' },
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Tenants
      </Link>

      {/* Header + status toggle */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {tenant?.name ?? 'Tenant Detail'}
          </h2>
          {tenant && (
            <p className="text-sm text-gray-400 dark:text-gray-500 font-mono">{tenant.subdomain}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {tenant && <StatusBadge isActive={tenant.isActive} />}
          {canMutate && tenant && (
            <button
              onClick={handleToggleTenantStatus}
              disabled={toggling}
              className={`text-sm px-3 py-1.5 rounded-md font-medium ${
                tenant.isActive
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
              } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {toggling ? 'Saving…' : tenant.isActive ? 'Deactivate Tenant' : 'Activate Tenant'}
            </button>
          )}
        </div>
      </div>

      {/* Health snapshot */}
      {tenant && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Plan', value: ['Free', 'Pro', 'Enterprise'][tenant.plan] ?? tenant.plan },
            { label: 'Owner', value: tenant.ownerEmail ?? '—' },
            { label: 'Users', value: tenant.userCount },
            { label: 'Pipelines', value: tenant.pipelineCount },
            {
              label: 'Created',
              value: new Date(tenant.createdAt).toLocaleDateString(),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 py-3"
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap focus:outline-none ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'events' && (
        <EventsTab events={events} loading={loading} />
      )}

      {activeTab === 'users' && (
        <UsersTab
          usersData={usersData}
          loading={loading}
          canMutate={canMutate}
          togglingUserId={togglingUserId}
          onToggleUser={handleToggleUserStatus}
          page={usersPage}
          onPageChange={setUsersPage}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onRoleFilterChange={(value) => {
            setRoleFilter(value);
            setUsersPage(1);
          }}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setUsersPage(1);
          }}
        />
      )}

      {activeTab === 'pipelines' && (
        <PipelinesTab pipelines={pipelines} loading={loading} />
      )}
    </div>
  );
}

function EventsTab({ events, loading }: { events: TenantEvent[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No recent events found.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {events.map((event) => (
        <li key={event.id} className="py-3 flex items-start gap-3">
          <ClockIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <span className="font-medium">{event.action}</span>{' '}
              <span className="text-gray-500 dark:text-gray-400">{event.entityType}</span>{' '}
              <span className="font-medium">{event.entityName}</span>
            </p>
            {event.description && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{event.description}</p>
            )}
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              by {event.performedBy} &middot;{' '}
              {new Date(event.timestamp).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function UsersTab({
  usersData,
  loading,
  canMutate,
  togglingUserId,
  onToggleUser,
  page,
  onPageChange,
  roleFilter,
  statusFilter,
  onRoleFilterChange,
  onStatusFilterChange,
}: {
  usersData: PaginatedResponse<BackofficeUser> | null;
  loading: boolean;
  canMutate: boolean;
  togglingUserId: string | null;
  onToggleUser: (user: BackofficeUser) => void;
  page: number;
  onPageChange: (p: number) => void;
  roleFilter: string;
  statusFilter: string;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}) {
  const ROLE_LABELS = ['Viewer', 'User', 'Admin', 'Owner'];

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!usersData || usersData.items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No users found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Role
          </label>
          <select
            value={roleFilter}
            onChange={(event) => onRoleFilterChange(event.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
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
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tenant
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
            {usersData.items.map((user) => (
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
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-200">{user.tenantName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{user.tenantSubdomain ?? '—'}</p>
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
                      onClick={() => onToggleUser(user)}
                      disabled={togglingUserId === user.id}
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        user.isActive
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                      } disabled:opacity-50 focus:outline-none`}
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
            ))}
          </tbody>
        </table>
      </div>

      {usersData.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{usersData.totalItems} user{usersData.totalItems !== 1 ? 's' : ''}</span>
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

function PipelinesTab({ pipelines, loading }: { pipelines: BackofficeTenantPipeline[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (pipelines.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No pipelines found for this tenant.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {pipelines.map((pipeline) => (
        <div
          key={pipeline.id}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
        >
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{pipeline.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Version {pipeline.version} · {pipeline.isActive ? 'Active' : 'Inactive'}
              </p>
              {pipeline.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{pipeline.description}</p>
              )}
            </div>

            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 sm:text-right">
              <p>Last execution: {pipeline.lastExecutionAt ? new Date(pipeline.lastExecutionAt).toLocaleString() : '—'}</p>
              <p>Status: {pipeline.lastExecutionStatus ?? 'No executions'}</p>
              <p>Failed runs (7d): {pipeline.failedExecutionsLast7Days}</p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">YAML Definition</p>
              <pre className="overflow-x-auto rounded-md bg-gray-50 dark:bg-gray-900/60 p-3 text-xs text-gray-800 dark:text-gray-200">{pipeline.yamlDefinition}</pre>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Latest Failure</p>
              {pipeline.lastErrorMessage ? (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                  <p className="font-medium">{pipeline.lastFailedAt ? new Date(pipeline.lastFailedAt).toLocaleString() : 'Unknown time'}</p>
                  <p className="mt-1 whitespace-pre-wrap">{pipeline.lastErrorMessage}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No execution failures recorded.</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
