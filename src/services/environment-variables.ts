import apiClient from '@/lib/api-client';

export interface EnvironmentVariable {
  id: number
  key: string
  value: string
  description?: string
  isSecret: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface CreateEnvironmentVariableRequest {
  key: string
  value: string
  description?: string
  isSecret: boolean
}

export interface UpdateEnvironmentVariableRequest {
  key: string
  value: string
  description?: string
  isSecret: boolean
}

export interface TestEnvironmentVariableResponse {
  key: string
  testToken: string
  description: string
  example: string
}

export const environmentVariablesService = {
  // Get all environment variables and secrets
  async getAll(): Promise<EnvironmentVariable[]> {
    return apiClient.get('/api/environment-variables');
  },

  // Get environment variable by ID
  async getById(id: number): Promise<EnvironmentVariable> {
    return apiClient.get(`/api/environment-variables/${id}`);
  },

  // Create new environment variable or secret
  async create(data: CreateEnvironmentVariableRequest): Promise<EnvironmentVariable> {
    return apiClient.post('/api/environment-variables', data);
  },

  // Update existing environment variable or secret
  async update(id: number, data: UpdateEnvironmentVariableRequest): Promise<EnvironmentVariable> {
    return apiClient.put(`/api/environment-variables/${id}`, data);
  },

  // Delete environment variable or secret
  async delete(id: number): Promise<void> {
    return apiClient.delete(`/api/environment-variables/${id}`);
  },

  // Test environment variable resolution
  async test(id: number): Promise<TestEnvironmentVariableResponse> {
    return apiClient.post(`/api/environment-variables/${id}/test`);
  }
}