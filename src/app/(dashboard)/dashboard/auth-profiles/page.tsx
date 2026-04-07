'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import {
  KeyIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Editor from '@monaco-editor/react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useConfirmationModal } from '@/hooks/useConfirmationModal';
import { useAuth } from '@/store/auth';
import { UserRole } from '@/types';
import {
  authProfilesService,
  AuthProfile,
  AuthType,
  CreateAuthProfileRequest,
  AuthProfileHistoryEntry,
  UpdateAuthProfileRequest,
} from '@/services/authProfiles';
import { parse as parseYaml } from 'yaml';

type ProfileFormState = {
  name: string;
  authType: AuthType;
  description: string;
  configText: string;
};

type ProfileFormErrors = {
  name?: string;
  configText?: string;
};

const AUTH_TYPE_OPTIONS: Array<{ value: AuthType; label: string; defaultConfig: string }> = [
  {
    value: AuthType.Login,
    label: 'Login',
    defaultConfig: `url: "https://api.example.com/auth/login"
method: POST
headers:
  Content-Type: application/json
body: |
  {
    "email": "",
    "password": ""
  }
tokenPath: "$.token"
contextKey: "token"
ttl: 3600
`,
  },
  {
    value: AuthType.BearerStatic,
    label: 'Bearer Static',
    defaultConfig: `token: "\${secret:API/TOKEN}"
`,
  },
  {
    value: AuthType.OAuth2ClientCredentials,
    label: 'OAuth2 Client Credentials',
    defaultConfig: `tokenUrl: "https://api.example.com/oauth/token"
clientId: ""
clientSecret: "\${secret:API/CLIENT_SECRET}"
scope: ""
grantType: client_credentials
`,
  },
  {
    value: AuthType.ApiKey,
    label: 'API Key',
    defaultConfig: `key: "\${secret:API/KEY}"
headerName: "X-API-Key"
`,
  },
  {
    value: AuthType.Basic,
    label: 'Basic',
    defaultConfig: `username: "\${secret:API/USERNAME}"
password: "\${secret:API/PASSWORD}"
`,
  },
];

function authTypeLabel(type: AuthType): string {
  return AUTH_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? 'Unknown';
}

function toYamlConfig(value: string | undefined): string {
  return value && value.trim().length > 0 ? value : '';
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const errorObject = error as {
    response?: {
      data?: {
        error?: unknown;
        message?: unknown;
      };
    };
    message?: unknown;
  };

  const apiError = errorObject.response?.data?.error;
  if (typeof apiError === 'string' && apiError.trim().length > 0) {
    return apiError;
  }

  const apiMessage = errorObject.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
    return apiMessage;
  }

  if (typeof errorObject.message === 'string' && errorObject.message.trim().length > 0) {
    return errorObject.message;
  }

  return fallback;
}

function getSecretKeys(authType: AuthType): string[] {
  switch (authType) {
    case AuthType.Login:
      return ['password', 'token'];
    case AuthType.BearerStatic:
      return ['token'];
    case AuthType.OAuth2ClientCredentials:
      return ['clientSecret', 'token'];
    case AuthType.ApiKey:
      return ['key', 'apiKey'];
    case AuthType.Basic:
      return ['password'];
    default:
      return [];
  }
}

function maskSecretsDeep(value: unknown, secretKeys: string[]): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => maskSecretsDeep(item, secretKeys));
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const masked: Record<string, unknown> = {};

    for (const [key, raw] of Object.entries(obj)) {
      if (secretKeys.includes(key)) {
        masked[key] = '***';
      } else {
        masked[key] = maskSecretsDeep(raw, secretKeys);
      }
    }

    return masked;
  }

  return value;
}

export default function AuthProfilesPage() {
  const { hasRole } = useAuth();
  const canManageProfiles = hasRole([UserRole.Admin, UserRole.Owner]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<AuthProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loadingProfileDetails, setLoadingProfileDetails] = useState(false);
  const editRequestIdRef = useRef(0);
  const [editingProfile, setEditingProfile] = useState<AuthProfile | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<ProfileFormErrors>({});
  const [form, setForm] = useState<ProfileFormState>({
    name: '',
    authType: AuthType.Login,
    description: '',
    configText: AUTH_TYPE_OPTIONS[0].defaultConfig,
  });

  const [historyLoading, setHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyProfileName, setHistoryProfileName] = useState('');
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<AuthProfileHistoryEntry[]>([]);

  const maskedConfigPreview = useMemo(() => {
    try {
      const parsed = parseYaml(form.configText) as unknown;
      const masked = maskSecretsDeep(parsed, getSecretKeys(form.authType));
      return JSON.stringify(masked, null, 2);
    } catch {
      return null;
    }
  }, [form.configText, form.authType]);

  const {
    isOpen: isConfirmOpen,
    loading: isDeleting,
    options: confirmOptions,
    showConfirmation,
    hideConfirmation,
    confirmAction,
  } = useConfirmationModal();

  useEffect(() => {
    void loadProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return profiles;
    }

    return profiles.filter((profile) => {
      return (
        profile.name.toLowerCase().includes(term) ||
        (profile.description ?? '').toLowerCase().includes(term) ||
        authTypeLabel(profile.authType).toLowerCase().includes(term)
      );
    });
  }, [profiles, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / pageSize));

  const pagedProfiles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredProfiles.slice(start, end);
  }, [filteredProfiles, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(Math.max(1, prev), totalPages));
  }, [totalPages]);

  async function loadProfiles(): Promise<void> {
    try {
      setLoading(true);
      const data = await authProfilesService.getAll();
      setProfiles(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load authentication profiles'));
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal(): void {
    setEditingProfile(null);
    setFormError(null);
    setFormFieldErrors({});
    setForm({
      name: '',
      authType: AuthType.Login,
      description: '',
      configText: AUTH_TYPE_OPTIONS[0].defaultConfig,
    });
    setIsFormOpen(true);
  }

  async function openEditModal(profile: AuthProfile): Promise<void> {
    const requestId = ++editRequestIdRef.current;
    setLoadingProfileDetails(true);
    setEditingProfile(profile);
    setFormError(null);
    setFormFieldErrors({});
    setIsFormOpen(true);

    try {
      const fullProfile = await authProfilesService.getByName(profile.name);

      // Discard stale response if another edit was triggered while this one was in-flight
      if (requestId !== editRequestIdRef.current) return;

      setEditingProfile(fullProfile);
      setForm({
        name: fullProfile.name,
        authType: fullProfile.authType,
        description: fullProfile.description ?? '',
        configText: toYamlConfig(fullProfile.config),
      });
    } catch (error) {
      if (requestId !== editRequestIdRef.current) return;

      const message = getApiErrorMessage(error, 'Failed to load authentication profile details');
      toast.error(message);
      // Close modal immediately to prevent submitting stale form state
      setIsFormOpen(false);
      setEditingProfile(null);
    } finally {
      if (requestId === editRequestIdRef.current) {
        setLoadingProfileDetails(false);
      }
    }
  }

  function closeFormModal(): void {
    if (saving) {
      return;
    }

    setIsFormOpen(false);
    setEditingProfile(null);
    setFormError(null);
    setFormFieldErrors({});
  }

  function handleAuthTypeChange(nextType: AuthType): void {
    setForm((prev) => {
      const next = AUTH_TYPE_OPTIONS.find((item) => item.value === nextType);
      return {
        ...prev,
        authType: nextType,
        configText: editingProfile ? prev.configText : (next?.defaultConfig ?? ''),
      };
    });
  }

  async function openHistoryModal(profile: AuthProfile): Promise<void> {
    setHistoryProfileName(profile.name);
    setHistoryEntries([]);
    setHistoryError(null);
    setIsHistoryOpen(true);
    setHistoryLoading(true);

    try {
      const payload = await authProfilesService.getHistory(profile.name);
      setHistoryEntries(payload);
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { status?: unknown } }).response?.status
          : undefined;

      if (status === 404) {
        setHistoryError('Version history endpoint is not available yet.');
      } else {
        setHistoryError(getApiErrorMessage(error, 'Failed to load version history.'));
      }
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSubmitForm(): Promise<void> {
    if (!canManageProfiles || loadingProfileDetails) {
      return;
    }

    const trimmedName = form.name.trim();
    const nextErrors: ProfileFormErrors = {};

    if (!editingProfile && trimmedName.length < 3) {
      nextErrors.name = 'Name must be at least 3 characters long.';
    }

    if (!editingProfile && !/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      nextErrors.name = 'Name can only contain letters, numbers, underscore, and hyphen.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormFieldErrors(nextErrors);
      return;
    }

    const configText = form.configText.trim();

    if (configText.length === 0) {
      setFormFieldErrors({ configText: 'Config cannot be empty.' });
      return;
    }

    try {
      parseYaml(configText);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid YAML';
      setFormFieldErrors({ configText: `Config must be valid YAML: ${message}` });
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      setFormFieldErrors({});

      if (editingProfile) {
        const payload: UpdateAuthProfileRequest = {
          description: form.description.trim() || undefined,
          config: configText,
        };

        const updated = await authProfilesService.update(editingProfile.name, payload);
        setProfiles((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success('Authentication profile updated successfully');
      } else {
        const payload: CreateAuthProfileRequest = {
          name: trimmedName,
          authType: form.authType,
          description: form.description.trim() || undefined,
          config: configText,
        };

        const created = await authProfilesService.create(payload);
        setProfiles((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Authentication profile created successfully');
      }

      closeFormModal();
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to save authentication profile');
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(profile: AuthProfile): void {
    if (!canManageProfiles) {
      return;
    }

    const warning =
      profile.usageCount > 0
        ? `This profile is currently used by ${profile.usageCount} pipeline(s). Deletion may be blocked by backend policy.`
        : 'This action cannot be undone.';

    showConfirmation(
      {
        title: 'Delete Authentication Profile',
        message: `Are you sure you want to delete "${profile.name}"? ${warning}`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'danger',
      },
      async () => {
        try {
          await authProfilesService.delete(profile.name);
          setProfiles((prev) => prev.filter((item) => item.id !== profile.id));
          toast.success('Authentication profile deleted successfully');
        } catch (error) {
          const message = getApiErrorMessage(error, 'Failed to delete authentication profile');
          toast.error(message);
          // Keep confirmation dialog open for retry after a backend rejection.
          throw error;
        }
      }
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Authentication Profiles</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Manage reusable authentication configurations for pipelines.
          </p>
        </div>

        {canManageProfiles && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            New Profile
          </button>
        )}
      </div>

      {!canManageProfiles && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          You have read-only access. Contact an administrator to create or edit authentication profiles.
        </div>
      )}

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by profile name, description, or auth type..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        {filteredProfiles.length === 0 ? (
          <div className="py-12 text-center">
            <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg text-gray-500">No authentication profiles found.</p>
            <p className="text-sm text-gray-400">
              {canManageProfiles ? 'Create your first profile to reuse auth settings across pipelines.' : 'No profiles available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Updated
                  </th>
                  {canManageProfiles && (
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {pagedProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {profile.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {authTypeLabel(profile.authType)}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-600 dark:text-gray-400" title={profile.description || ''}>
                      {profile.description || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      v{profile.version}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {profile.usageCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString('en-US') : '-'}
                    </td>
                    {canManageProfiles && (
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="inline-flex items-center gap-3">
                          <button
                            onClick={() => void openHistoryModal(profile)}
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                            title="View History"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => void openEditModal(profile)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(profile)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-800 disabled:opacity-40 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredProfiles.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProfiles.length)} of {filteredProfiles.length} profile(s)
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Page size
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-600"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Transition appear show={isFormOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeFormModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {editingProfile ? 'Edit Authentication Profile' : 'Create Authentication Profile'}
                  </Dialog.Title>

                  {loadingProfileDetails && (
                    <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-2 text-sm text-blue-700">
                      Loading profile details...
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-1">
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input
                        value={form.name}
                        disabled={Boolean(editingProfile) || saving || loadingProfileDetails}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, name: e.target.value }));
                          setFormFieldErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="example_profile"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      />
                      {formFieldErrors.name && (
                        <p className="mt-1 text-xs text-red-600">{formFieldErrors.name}</p>
                      )}
                    </div>

                    <div className="md:col-span-1">
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Auth Type</label>
                      <select
                        value={form.authType}
                        disabled={Boolean(editingProfile) || saving || loadingProfileDetails}
                        onChange={(e) => handleAuthTypeChange(Number(e.target.value) as AuthType)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      >
                        {AUTH_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <input
                        value={form.description}
                        disabled={saving || loadingProfileDetails}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional profile description"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Config (YAML)</label>
                      <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                        <Editor
                          height="320px"
                          defaultLanguage="yaml"
                          language="yaml"
                          value={form.configText}
                          onChange={(value) => {
                            setForm((prev) => ({ ...prev, configText: value ?? '' }));
                            setFormFieldErrors((prev) => ({ ...prev, configText: undefined }));
                          }}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            readOnly: saving || loadingProfileDetails,
                            scrollBeyondLastLine: false,
                            formatOnPaste: true,
                            formatOnType: true,
                          }}
                        />
                      </div>
                      {formFieldErrors.configText && (
                        <p className="mt-1 text-xs text-red-600">{formFieldErrors.configText}</p>
                      )}

                      <div className="mt-3">
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Masked Preview</label>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                          {maskedConfigPreview ? (
                            <pre className="max-h-40 overflow-auto text-xs text-gray-700 dark:text-gray-200">{maskedConfigPreview}</pre>
                          ) : (
                            <p className="text-xs text-yellow-700 dark:text-yellow-400">Invalid YAML. Fix config to preview masked values.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {formError}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={closeFormModal}
                      disabled={saving}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => void handleSubmitForm()}
                      disabled={saving || loadingProfileDetails || !canManageProfiles}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : editingProfile ? 'Save Changes' : 'Create Profile'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isHistoryOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsHistoryOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Version History - {historyProfileName}
                  </Dialog.Title>

                  <div className="mt-4">
                    {historyLoading && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">Loading history...</div>
                    )}

                    {!historyLoading && historyError && (
                      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                        {historyError}
                      </div>
                    )}

                    {!historyLoading && !historyError && historyEntries.length === 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">No version history entries found.</div>
                    )}

                    {!historyLoading && !historyError && historyEntries.length > 0 && (
                      <div className="space-y-2">
                        {historyEntries.map((entry) => (
                          <div key={`${entry.versionNumber}-${entry.createdAt}`} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              Version {entry.versionNumber}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(entry.createdAt).toLocaleString('en-US')}
                            </div>
                            {entry.changeDescription && (
                              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{entry.changeDescription}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsHistoryOpen(false)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={hideConfirmation}
        onConfirm={confirmAction}
        title={confirmOptions?.title || ''}
        message={confirmOptions?.message || ''}
        confirmLabel={confirmOptions?.confirmLabel}
        cancelLabel={confirmOptions?.cancelLabel}
        variant={confirmOptions?.variant}
        loading={isDeleting}
      />
    </div>
  );
}
