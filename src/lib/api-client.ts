import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/auth';
import logger from '@/utils/logger';
import { isErrorResponseDto } from '@/lib/error-formatter';

// Runtime configuration cache
let runtimeConfig: { PYPE_API_URL: string } | null = null;
let configPromise: Promise<{ PYPE_API_URL: string }> | null = null;

/**
 * Fetch runtime configuration from the server
 * This allows the API URL to be set at container runtime, not build time
 */
async function fetchRuntimeConfig(): Promise<{ PYPE_API_URL: string }> {
  if (runtimeConfig) {
    return runtimeConfig;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      // Fetch config from our Next.js API route
      const response = await fetch('/api/config', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }
      
      const config = await response.json();
      runtimeConfig = config;
      logger.debug('Runtime config loaded:', config);
      return config;
    } catch (error) {
      logger.warn('Failed to fetch runtime config, using fallback:', error);
      // Fallback to build-time env var
      const fallbackConfig = {
        PYPE_API_URL: process.env.PYPE_API_URL || 'http://localhost:8080',
      };
      runtimeConfig = fallbackConfig;
      return fallbackConfig;
    } finally {
      configPromise = null;
    }
  })();

  return configPromise;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private initialized: Promise<void>;

  constructor() {
    // Initial baseURL - will be updated after runtime config is loaded
    this.baseURL = process.env.PYPE_API_URL || 'http://localhost:8080';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize with runtime config
    this.initialized = this.initializeWithRuntimeConfig();

    this.setupInterceptors();
  }

  private async initializeWithRuntimeConfig(): Promise<void> {
    try {
      const config = await fetchRuntimeConfig();
      this.baseURL = config.PYPE_API_URL;
      this.client.defaults.baseURL = config.PYPE_API_URL;
      logger.debug('API Client initialized with baseURL:', this.baseURL);
    } catch (error) {
      logger.error('Failed to initialize API client with runtime config:', error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    await this.initialized;
  }

  private setupInterceptors() {
    // Request interceptor to add auth token and tenant context
    this.client.interceptors.request.use(
      (config) => {
        const { accessToken, tenant } = useAuthStore.getState();
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        if (tenant?.subdomain) {
          config.headers['X-Tenant-Subdomain'] = tenant.subdomain;
        } else {
          // Fallback para desenvolvimento - usar um tenant padrão
          config.headers['X-Tenant-Subdomain'] = 'default';
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors and ErrorResponseDto
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        logger.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.response?.data?.error || error.message,
          requestData: error.config?.data ? JSON.parse(error.config.data) : null,
        });

        // Parse ErrorResponseDto if available (IMP-011 - ADR-003)
        if (error.response?.data && isErrorResponseDto(error.response.data)) {
          const errorDto = error.response.data;
          
          // Attach to error object for custom handling
          error.pypeError = errorDto;

          // Dispatch to error handler (unless it's a 401 that will retry)
          // Import dynamically to avoid circular dependency
          if (error.response.status !== 401 || error.config._retry) {
            import('@/hooks/useErrorHandler').then(({ useErrorHandler }) => {
              useErrorHandler.getState().showError(errorDto);
            }).catch((importError) => {
              logger.error('Failed to import useErrorHandler:', importError);
            });
          }
        }
        
        const original = error.config;
        
        // Only try to refresh token on 401 errors, not on other errors
        if (error.response?.status === 401 && !original._retry && original.url !== '/api/auth/refresh') {
          original._retry = true;
          
          try {
            logger.debug('Attempting to refresh token...');
            await this.refreshToken();
            logger.debug('Token refreshed successfully');
            return this.client(original);

          } catch (refreshError) {
            logger.error('Session expired. Please login again.');
            useAuthStore.getState().logout();
            window.location.href = '/login?session=expired';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    const { refreshToken, tenant } = useAuthStore.getState();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${this.baseURL}/api/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Subdomain': tenant?.subdomain || 'default',
        },
      }
    );
    
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    useAuthStore.getState().setTokens(accessToken, newRefreshToken, expiresAt);
  }

  // Generic methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    await this.ensureInitialized();
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    await this.ensureInitialized();
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    await this.ensureInitialized();
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    await this.ensureInitialized();
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    await this.ensureInitialized();
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Upload file method
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    await this.ensureInitialized();
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response: AxiosResponse<T> = await this.client.post(url, formData, config);
    return response.data;
  }

  // WebSocket connection helper
  async createWebSocketUrl(path: string): Promise<string> {
    await this.ensureInitialized();
    const wsProtocol = this.baseURL.startsWith('https') ? 'wss' : 'ws';
    const baseWsUrl = this.baseURL.replace(/^https?/, wsProtocol);
    return `${baseWsUrl}${path}`;
  }
}

export const apiClient = new ApiClient();
export default apiClient;