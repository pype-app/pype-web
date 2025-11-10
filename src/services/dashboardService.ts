import apiClient from '@/lib/api-client';
import { DashboardStats } from '@/types/dashboard';

class DashboardService {
  private readonly baseUrl = '/api/dashboard';

  // Obtém todas as estatísticas do dashboard
  async getStats(): Promise<DashboardStats> {
    return await apiClient.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  // Refresh das estatísticas (mesmo endpoint, mas para uso explícito)
  async refreshStats(): Promise<DashboardStats> {
    return this.getStats();
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;