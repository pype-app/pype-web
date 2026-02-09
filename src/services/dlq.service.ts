import apiClient from '@/lib/api-client';

export interface DLQItem {
  id: string;
  executionId: string;
  pipelineName: string;
  stepName?: string;
  connectorType: string;
  failedMessage?: string;  // Pode estar truncado (500 chars)
  errorMessage: string;
  retryCount: number;
  status: 'Pending' | 'Retrying' | 'Success' | 'Failed' | 'Discarded';
  failedAt: string;       // ISO 8601
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface DLQListResponse {
  items: DLQItem[];
  totalCount: number;
  limit: number;
}

export interface DLQStats {
  executionId?: string;
  totalItems: number;
  byStatus: Record<string, number>;  // { "Pending": 10, "Failed": 5, ... }
  topErrors: Array<{ error: string; count: number }>;
  retrySuccessRate: number;
}

export const dlqService = {
  /**
   * Lista items da DLQ com filtros opcionais
   * GET /api/dead-letter-queue
   */
  async getItems(params?: {
    executionId?: string;
    status?: string;
    limit?: number;
  }): Promise<DLQListResponse> {
    return await apiClient.get<DLQListResponse>('/api/dead-letter-queue', { params });
  },

  /**
   * Busca detalhes de um item específico
   * GET /api/dead-letter-queue/{id}
   */
  async getById(id: string): Promise<DLQItem> {
    return await apiClient.get<DLQItem>(`/api/dead-letter-queue/${id}`);
  },

  /**
   * Solicita retry manual de um item
   * POST /api/dead-letter-queue/{id}/retry
   */
  async retry(id: string): Promise<{ message: string; jobId: string; newStatus: string }> {
    return await apiClient.post<{ message: string; jobId: string; newStatus: string }>(`/api/dead-letter-queue/${id}/retry`);
  },

  /**
   * Descarta um item (marca como Discarded)
   * DELETE /api/dead-letter-queue/{id}
   */
  async discard(id: string, resolvedByUserId?: string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/api/dead-letter-queue/${id}`, {
      params: { resolvedByUserId }
    });
  },

  /**
   * Busca estatísticas agregadas
   * GET /api/dead-letter-queue/stats
   */
  async getStats(executionId?: string): Promise<DLQStats> {
    return await apiClient.get<DLQStats>('/api/dead-letter-queue/stats', {
      params: { executionId }
    });
  }
};
