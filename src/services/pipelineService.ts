import apiClient from '@/lib/api-client';
import { 
  Pipeline, 
  PipelineExecution, 
  CreatePipelineRequest, 
  UpdatePipelineRequest,
  ApiResponse 
} from '@/types';

export interface PipelineListItem {
  id: string;
  name: string;
  description?: string;
  version: string;
  isActive: boolean;
  cronExpression?: string;
  createdAt: string;
  updatedAt?: string;
  lastExecutedAt?: string;
  tags?: string[];
  createdByUserId?: string;
  createdByUserName?: string;
}

export interface PipelineFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  tags?: string[];
  onlyMine?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PipelineStats {
  totalPipelines: number;
  activePipelines: number;
  runningPipelines: number;
  failedPipelines: number;
}

class PipelineService {
  private readonly baseUrl = '/pipelines/crud';
  private readonly adminUrl = '/pipelines/admin';

  // Lista pipelines com filtros e paginação
  async listPipelines(filters: PipelineFilters = {}): Promise<PipelineListItem[]> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('skip', ((filters.page - 1) * (filters.pageSize || 20)).toString());
    if (filters.pageSize) params.append('take', filters.pageSize.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.onlyMine !== undefined) params.append('onlyMine', filters.onlyMine.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    // O backend retorna array direto, não paginação ainda
    const response = await apiClient.get<PipelineListItem[]>(url);
    return response;
  }

  // Obtém pipeline específico por ID
  async getPipeline(id: string): Promise<Pipeline> {
    return await apiClient.get<Pipeline>(`${this.baseUrl}/${id}`);
  }

  // Cria novo pipeline
  async createPipeline(data: CreatePipelineRequest): Promise<Pipeline> {
    return await apiClient.post<Pipeline>(this.baseUrl, data);
  }

  // Atualiza pipeline existente
  async updatePipeline(id: string, data: UpdatePipelineRequest): Promise<Pipeline> {
    return await apiClient.put<Pipeline>(`${this.baseUrl}/${id}`, data);
  }

  // Exclui pipeline
  async deletePipeline(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Executa pipeline manualmente
  async runPipeline(id: string): Promise<{ executionId: string; enqueued: boolean }> {
    return await apiClient.post<{ executionId: string; enqueued: boolean }>(`${this.adminUrl}/${id}/run`);
  }

  // Suspende pipeline (desativa)
  async suspendPipeline(id: string): Promise<{ pipelineId: string; enabled: boolean }> {
    return await apiClient.post<{ pipelineId: string; enabled: boolean }>(`${this.adminUrl}/${id}/suspend`);
  }

  // Reativa pipeline
  async resumePipeline(id: string): Promise<{ pipelineId: string; enabled: boolean }> {
    return await apiClient.post<{ pipelineId: string; enabled: boolean }>(`${this.adminUrl}/${id}/resume`);
  }

  // Obtém execuções de um pipeline
  async getPipelineExecutions(pipelineId: string, page = 1, pageSize = 20): Promise<PipelineExecution[]> {
    const params = new URLSearchParams({
      pipelineId,
      skip: ((page - 1) * pageSize).toString(),
      take: pageSize.toString()
    });

    return await apiClient.get<PipelineExecution[]>(`/api/executions?${params}`);
  }

  // Obtém estatísticas dos pipelines
  async getPipelineStats(): Promise<PipelineStats> {
    return await apiClient.get<PipelineStats>(`${this.baseUrl}/stats`);
  }

  // Valida definição YAML do pipeline
  async validateYaml(yamlDefinition: string): Promise<{ isValid: boolean; errors?: string[] }> {
    return await apiClient.post<{ isValid: boolean; errors?: string[] }>(`${this.baseUrl}/validate`, {
      yamlDefinition
    });
  }

  // Obtém tags disponíveis
  async getAvailableTags(): Promise<string[]> {
    return await apiClient.get<string[]>(`${this.baseUrl}/tags`);
  }

  // Duplica pipeline
  async duplicatePipeline(id: string, newName: string): Promise<Pipeline> {
    return await apiClient.post<Pipeline>(`${this.baseUrl}/${id}/duplicate`, { newName });
  }

  // Exporta pipeline como YAML
  async exportPipeline(id: string): Promise<{ name: string; yamlContent: string }> {
    return await apiClient.get<{ name: string; yamlContent: string }>(`${this.baseUrl}/${id}/export`);
  }

  // Importa pipeline de YAML
  async importPipeline(yamlContent: string, name?: string): Promise<Pipeline> {
    return await apiClient.post<Pipeline>(`${this.baseUrl}/import`, {
      yamlContent,
      name
    });
  }
}

export const pipelineService = new PipelineService();
export default pipelineService;