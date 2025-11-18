import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/auth';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18080';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
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
        
        // Debug log for development
        if (process.env.NODE_ENV === 'development') {
          console.log('API Request:', {
            url: config.url,
            fullUrl: `${config.baseURL}${config.url}`,
            method: config.method,
            hasToken: !!accessToken,
            tenant: tenant?.subdomain || 'default',
            headers: config.headers,
            data: config.data ? JSON.stringify(config.data).substring(0, 500) : null,
          });
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Debug log for development
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.response?.data?.error || error.message,
            requestData: error.config?.data ? JSON.parse(error.config.data) : null,
          });
        }
        
        const original = error.config;
        
        // Only try to refresh token on 401 errors, not on other errors
        if (error.response?.status === 401 && !original._retry && original.url !== '/api/auth/refresh') {
          original._retry = true;
          
          try {
            await this.refreshToken();
            return this.client(original);
          } catch (refreshError) {
            console.error('Token refresh failed, logging out');
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    const { refreshToken } = useAuthStore.getState();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${this.baseURL}/api/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
    
    // Calculate expiration time from expiresIn seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    useAuthStore.getState().setTokens(accessToken, newRefreshToken, expiresAt);
  }

  // Generic methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Upload file method
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
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
  createWebSocketUrl(path: string): string {
    const wsProtocol = this.baseURL.startsWith('https') ? 'wss' : 'ws';
    const baseWsUrl = this.baseURL.replace(/^https?/, wsProtocol);
    return `${baseWsUrl}${path}`;
  }
}

export const apiClient = new ApiClient();
export default apiClient;