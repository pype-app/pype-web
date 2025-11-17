import apiClient from '@/lib/api-client';
import { DashboardStats } from '@/types/dashboard';

class DashboardService {
  private readonly baseUrl = '/api/dashboard';

  // Obtém todas as estatísticas do dashboard
  async getStats(onlyMine?: boolean): Promise<DashboardStats> {
    const params = onlyMine !== undefined ? { onlyMine: onlyMine.toString() } : {};
    return await apiClient.get<DashboardStats>(`${this.baseUrl}/stats`, { params });
  }

  // Refresh das estatísticas (mesmo endpoint, mas para uso explícito)
  async refreshStats(onlyMine?: boolean): Promise<DashboardStats> {
    return this.getStats(onlyMine);
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;