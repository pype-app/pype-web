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
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAuthProfileRequest {
  name: string;
  authType: AuthType;
  description?: string;
  config: Record<string, unknown>;
}

export interface UpdateAuthProfileRequest {
  description?: string;
  config: Record<string, unknown>;
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

function normalizeAuthProfile(input: any): AuthProfile {
  const rawConfig = input?.config;
  let parsedConfig: Record<string, unknown> | undefined;

  if (typeof rawConfig === 'string') {
    try {
      parsedConfig = JSON.parse(rawConfig) as Record<string, unknown>;
    } catch {
      console.warn(
        `[authProfiles] Failed to parse config for profile "${input?.name}". Falling back to empty object.`
      );
      parsedConfig = {};
    }
  } else {
    parsedConfig = rawConfig as Record<string, unknown> | undefined;
  }

  return {
    id: input.id,
    name: input.name,
    authType: parseAuthType(input.authType),
    description: input.description,
    version: input.version,
    usageCount: input.usageCount ?? 0,
    config: parsedConfig,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export const authProfilesService = {
  async getAll(): Promise<AuthProfile[]> {
    const response = await apiClient.get('/api/auth-profiles');
    if (!Array.isArray(response)) {
      throw new Error('Unexpected response shape from /api/auth-profiles');
    }
    return response.map((item: any) => normalizeAuthProfile(item));
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
    return (response ?? []) as AuthProfileHistoryEntry[];
  },

  async delete(name: string): Promise<void> {
    await apiClient.delete(`/api/auth-profiles/${encodeURIComponent(name)}`);
  },
};
