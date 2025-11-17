import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Tenant, AuthResponse, LoginRequest, RegisterRequest, UserRole } from '@/types';
import apiClient from '@/lib/api-client';

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

// Normalize user response from API
function normalizeUser(user: any): User {
  return {
    ...user,
    role: parseRole(user.role),
  };
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string, expiresAt: string) => void;
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant) => void;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
  checkAuth: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  canManageSecrets: () => boolean;
  canManagePipelines: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response: AuthResponse = await apiClient.post('/api/auth/login', credentials);
          
          const { accessToken, refreshToken, user, expiresIn } = response;

          // Normalize user role from string to enum
          const normalizedUser = normalizeUser(user);

          // Calculate expiration time from expiresIn seconds
          const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

          set({
            user: normalizedUser,
            tenant: normalizedUser?.tenant || null,
            accessToken,
            refreshToken,
            expiresAt,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Save last used tenant to localStorage
          if (normalizedUser?.tenant?.subdomain && typeof window !== 'undefined') {
            localStorage.setItem('pype-last-tenant', normalizedUser.tenant.subdomain);
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          
          // Ensure complete reset of auth state on error
          set({
            user: null,
            tenant: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          throw error;
        }
      },

      register: async (data: RegisterRequest): Promise<AuthResponse> => {
        try {
          set({ isLoading: true, error: null });

          const response: AuthResponse = await apiClient.post('/api/auth/register', data);
          
          const { accessToken, refreshToken, user, expiresIn } = response;

          // Normalize user role from string to enum
          const normalizedUser = normalizeUser(user);

          // Calculate expiration time from expiresIn seconds
          const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

          set({
            user: normalizedUser,
            tenant: normalizedUser.tenant,
            accessToken,
            refreshToken,
            expiresAt,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Call logout API endpoint if available
        try {
          apiClient.post('/api/auth/logout');
        } catch (error) {
          // Ignore errors in logout
        }

        set({
          user: null,
          tenant: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      setTokens: (accessToken: string, refreshToken: string, expiresAt: string) => {
        set({
          accessToken,
          refreshToken,
          expiresAt,
          isAuthenticated: true,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTenant: (tenant: Tenant) => {
        set({ tenant });
      },

      clearError: () => {
        set({ error: null });
      },

      refreshUserData: async () => {
        try {
          const { isAuthenticated } = get();
          if (!isAuthenticated) return;

          const user: User = await apiClient.get('/api/auth/me');
          const normalizedUser = normalizeUser(user);
          set({ user: normalizedUser });
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      },

      checkAuth: () => {
        const { accessToken, expiresAt } = get();
        
        if (!accessToken || !expiresAt) {
          set({ isAuthenticated: false, user: null, tenant: null });
          return;
        }

        const now = new Date();
        const expiry = new Date(expiresAt);
        
        if (now >= expiry) {
          set({ isAuthenticated: false, user: null, tenant: null, accessToken: null, refreshToken: null });
          return;
        }

        set({ isAuthenticated: true });
      },

      // Helper methods for role checking
      hasRole: (roles: UserRole | UserRole[]): boolean => {
        const { user } = get();
        if (!user) return false;
        
        const targetRoles = Array.isArray(roles) ? roles : [roles];
        return targetRoles.includes(user.role);
      },

      isAdmin: (): boolean => {
        const { user } = get();
        return user?.role === UserRole.Admin || user?.role === UserRole.Owner;
      },

      canManageSecrets: (): boolean => {
        const { user } = get();
        return user?.role === UserRole.Admin || user?.role === UserRole.Owner;
      },

      canManagePipelines: (): boolean => {
        const { user } = get();
        return user?.role !== UserRole.Viewer;
      },
    }),
    {
      name: 'pype-auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Custom hook for easier usage
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    tenant: store.tenant,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    hasRole: store.hasRole,
    isAdmin: store.isAdmin,
    canManageSecrets: store.canManageSecrets,
    canManagePipelines: store.canManagePipelines,
    clearError: store.clearError,
    refreshUserData: store.refreshUserData,
  };
};