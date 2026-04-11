import apiClient from '@/lib/api-client';

export enum AuthType {
  Login = 0,
  BearerStatic = 1,
  OAuth2ClientCredentials = 2,
  ApiKey = 3,
  Basic = 4,
}

export interface AuthProfile {
  id: number;
  name: string;
  authType: AuthType;
  description?: string;
  version: number;
  usageCount: number;
  config: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAuthProfileRequest {
  name: string;
  authType: AuthType;
  description?: string;
  config: string;
}

export interface UpdateAuthProfileRequest {
  description?: string;
  config: string;
}

export interface AuthProfileHistoryEntry {
  versionNumber: number;
  createdAt: string;
  createdBy?: string;
  changeDescription?: string;
}

function parseAuthType(value: unknown): AuthType {
  if (typeof value === 'number') {
    return value as AuthType;
  }

  if (typeof value === 'string') {
    const map: Record<string, AuthType> = {
      Login: AuthType.Login,
      BearerStatic: AuthType.BearerStatic,
      OAuth2ClientCredentials: AuthType.OAuth2ClientCredentials,
      ApiKey: AuthType.ApiKey,
      Basic: AuthType.Basic,
    };

    return map[value] ?? AuthType.Login;
  }

  return AuthType.Login;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function normalizeAuthProfile(input: unknown): AuthProfile {
  const source = asRecord(input);
  const rawConfig = source.config;
  const yamlConfig = typeof rawConfig === 'string' ? rawConfig : '';

  return {
    id: typeof source.id === 'number' ? source.id : 0,
    name: typeof source.name === 'string' ? source.name : '',
    authType: parseAuthType(source.authType),
    description: typeof source.description === 'string' ? source.description : undefined,
    version: typeof source.version === 'number' ? source.version : 1,
    usageCount: typeof source.usageCount === 'number' ? source.usageCount : 0,
    config: yamlConfig,
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : undefined,
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : undefined,
  };
}

export const authProfilesService = {
  async getAll(): Promise<AuthProfile[]> {
    const response = await apiClient.get('/api/auth-profiles');
    if (!Array.isArray(response)) {
      throw new Error('Unexpected response shape from /api/auth-profiles');
    }
    return response.map((item) => normalizeAuthProfile(item));
  },

  async getByName(name: string): Promise<AuthProfile> {
    const response = await apiClient.get(`/api/auth-profiles/${encodeURIComponent(name)}`);
    return normalizeAuthProfile(response);
  },

  async create(payload: CreateAuthProfileRequest): Promise<AuthProfile> {
    const response = await apiClient.post('/api/auth-profiles', payload);
    return normalizeAuthProfile(response);
  },

  async update(name: string, payload: UpdateAuthProfileRequest): Promise<AuthProfile> {
    const response = await apiClient.put(`/api/auth-profiles/${encodeURIComponent(name)}`, payload);
    return normalizeAuthProfile(response);
  },

  async getHistory(name: string): Promise<AuthProfileHistoryEntry[]> {
    const response = await apiClient.get(`/api/auth-profiles/${encodeURIComponent(name)}/history`);
    if (!response) {
      return [];
    }

    if (!Array.isArray(response)) {
      throw new Error('Unexpected response shape from /api/auth-profiles/{name}/history');
    }

    return response as AuthProfileHistoryEntry[];
  },

  async delete(name: string): Promise<void> {
    await apiClient.delete(`/api/auth-profiles/${encodeURIComponent(name)}`);
  },
};
