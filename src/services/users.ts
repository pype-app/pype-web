import apiClient from '@/lib/api-client';
import { User, UserRole } from '@/types';

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
    return apiClient.get('/api/users');
  },

  // Get user by ID
  async getById(id: string): Promise<UserWithStatus> {
    return apiClient.get(`/api/users/${id}`);
  },

  // Create new user
  async create(data: CreateUserRequest): Promise<UserWithStatus> {
    return apiClient.post('/api/users', data);
  },

  // Update existing user
  async update(id: string, data: UpdateUserRequest): Promise<UserWithStatus> {
    return apiClient.put(`/api/users/${id}`, data);
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
    return apiClient.patch(`/api/users/${userId}/status`, { isActive });
  },

  // Reset user password (admin only)
  async resetPassword(userId: string): Promise<void> {
    return apiClient.post(`/api/users/${userId}/reset-password`);
  }
};