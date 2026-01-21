import apiClient from '@/lib/api-client';

export interface AnalyticsOverview {
  totalExecutions: number;
  executionsChange: number;
  successRate: number;
  successRateChange: number;
  avgDurationSeconds: number;
  durationChange: number;
  successfulExecutions: number;
  failedExecutions: number;
  pendingExecutions: number;
  period: string;
}

export interface TopPipeline {
  pipelineId: string;
  pipelineName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  avgDurationSeconds: number;
}

export interface ExecutionTrend {
  date: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
}

export type TimePeriod = '24h' | '7d' | '30d' | '90d';

class AnalyticsService {
  async getOverview(period: TimePeriod = '30d'): Promise<AnalyticsOverview> {
    return await apiClient.get<AnalyticsOverview>(
      `/api/analytics/overview?period=${period}`
    );
  }

  async getTopPipelines(period: TimePeriod = '30d', limit: number = 10): Promise<TopPipeline[]> {
    return await apiClient.get<TopPipeline[]>(
      `/api/analytics/top-pipelines?period=${period}&limit=${limit}`
    );
  }

  async getTrends(period: TimePeriod = '30d'): Promise<ExecutionTrend[]> {
    return await apiClient.get<ExecutionTrend[]>(
      `/api/analytics/trends?period=${period}`
    );
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  formatChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }
}

export const analyticsService = new AnalyticsService();
