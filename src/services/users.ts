import apiClient from '@/lib/api-client';
import { User, UserRole } from '@/types';

// Helper to parse role from API (string) to UserRole enum (number)
function parseRole(role: any): UserRole {
  if (typeof role === 'number') return role;
  
  const roleMap: Record<string, UserRole> = {
    'Viewer': UserRole.Viewer,
    'User': UserRole.User,
    'Admin': UserRole.Admin,
    'Owner': UserRole.Owner,
  };
  
  return roleMap[role] ?? UserRole.User;
}

// Transform API response to normalize role
function normalizeUserResponse(user: any): any {
  return {
    ...user,
    role: parseRole(user.role),
  };
}

export interface CreateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  sendInvite?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface InviteUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface UserWithStatus extends User {
  isActive: boolean;
  invitedAt?: string;
  invitedBy?: string;
}

export const usersService = {
  // Get all users for current tenant
  async getAll(): Promise<UserWithStatus[]> {
    const users = await apiClient.get('/api/users');
    return users.map(normalizeUserResponse);
  },

  // Get user by ID
  async getById(id: string): Promise<UserWithStatus> {
    const user = await apiClient.get(`/api/users/${id}`);
    return normalizeUserResponse(user);
  },

  // Create new user
  async create(data: CreateUserRequest): Promise<UserWithStatus> {
    const user = await apiClient.post('/api/users', data);
    return normalizeUserResponse(user);
  },

  // Update existing user
  async update(id: string, data: UpdateUserRequest): Promise<UserWithStatus> {
    const user = await apiClient.put(`/api/users/${id}`, data);
    return normalizeUserResponse(user);
  },

  // Delete user
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/users/${id}`);
  },

  // Invite user to tenant
  async invite(data: InviteUserRequest): Promise<void> {
    return apiClient.post('/api/users/invite', data);
  },

  // Resend invitation
  async resendInvite(userId: string): Promise<void> {
    return apiClient.post(`/api/users/${userId}/resend-invite`);
  },

  // Activate/deactivate user
  async toggleActive(userId: string, isActive: boolean): Promise<UserWithStatus> {
    const user = await apiClient.patch(`/api/users/${userId}/status`, { isActive });
    return normalizeUserResponse(user);
  },

  // Reset user password (admin only)
  async resetPassword(userId: string): Promise<void> {
    return apiClient.post(`/api/users/${userId}/reset-password`);
  }
};