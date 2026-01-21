import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { pipelineService, PipelineListItem, PipelineFilters } from '@/services/pipelineService';

interface UsePipelinesResult {
  pipelines: PipelineListItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: PipelineFilters;
  actions: {
    loadPipelines: () => Promise<void>;
    setFilters: (filters: Partial<PipelineFilters>) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    runPipeline: (id: string) => Promise<void>;
    suspendPipeline: (id: string) => Promise<void>;
    resumePipeline: (id: string) => Promise<void>;
    deletePipeline: (id: string) => Promise<void>;
    refreshPipelines: () => Promise<void>;
  };
}

export const usePipelines = (initialFilters: PipelineFilters = {}): UsePipelinesResult => {
  const [pipelines, setPipelines] = useState<PipelineListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFiltersState] = useState<PipelineFilters>({
    page: 1,
    pageSize: 20,
    ...initialFilters,
  });

  const loadPipelines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await pipelineService.listPipelines(filters);
      
      setPipelines(response);
      // Simulate pagination for now - backend returns simple array
      const total = response.length;
      const pageSize = filters.pageSize || 20;
      const totalPages = Math.ceil(total / pageSize);
      
      setPagination({
        page: filters.page || 1,
        pageSize,
        total,
        totalPages,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load pipelines';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const setFilters = useCallback((newFilters: Partial<PipelineFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1, // Reset to first page when changing filters
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters({ page });
  }, [setFilters]);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters({ pageSize, page: 1 });
  }, [setFilters]);

  const runPipeline = useCallback(async (id: string) => {
    try {
      const pipeline = pipelines.find(p => p.id === id);
      const pipelineName = pipeline?.name || 'Pipeline';

      toast.loading(`Running ${pipelineName}...`, { id: `run-${id}` });
      
      const result = await pipelineService.runPipeline(id);
      
      if (result.enqueued) {
        toast.success(`${pipelineName} has been queued for execution`, { id: `run-${id}` });
        // Refresh the list to update status
        await loadPipelines();
      } else {
        toast.error(`Failed to queue ${pipelineName}`, { id: `run-${id}` });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to run pipeline';
      toast.error(errorMessage, { id: `run-${id}` });
    }
  }, [pipelines, loadPipelines]);

  const suspendPipeline = useCallback(async (id: string) => {
    try {
      const pipeline = pipelines.find(p => p.id === id);
      const pipelineName = pipeline?.name || 'Pipeline';

      toast.loading(`Suspending ${pipelineName}...`, { id: `suspend-${id}` });
      
      await pipelineService.suspendPipeline(id);
      
      toast.success(`${pipelineName} has been suspended`, { id: `suspend-${id}` });
      
      // Update local state immediately for better UX
      setPipelines(prev => prev.map(p => 
        p.id === id ? { ...p, isActive: false } : p
      ));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to suspend pipeline';
      toast.error(errorMessage, { id: `suspend-${id}` });
    }
  }, [pipelines]);

  const resumePipeline = useCallback(async (id: string) => {
    try {
      const pipeline = pipelines.find(p => p.id === id);
      const pipelineName = pipeline?.name || 'Pipeline';

      toast.loading(`Resuming ${pipelineName}...`, { id: `resume-${id}` });
      
      await pipelineService.resumePipeline(id);
      
      toast.success(`${pipelineName} has been resumed`, { id: `resume-${id}` });
      
      // Update local state immediately for better UX
      setPipelines(prev => prev.map(p => 
        p.id === id ? { ...p, isActive: true } : p
      ));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to resume pipeline';
      toast.error(errorMessage, { id: `resume-${id}` });
    }
  }, [pipelines]);

  const deletePipeline = useCallback(async (id: string) => {
    try {
      const pipeline = pipelines.find(p => p.id === id);
      const pipelineName = pipeline?.name || 'Pipeline';

      toast.loading(`Deleting ${pipelineName}...`, { id: `delete-${id}` });
      
      await pipelineService.deletePipeline(id);
      
      toast.success(`${pipelineName} has been deleted`, { id: `delete-${id}` });
      
      // Remove from local state immediately
      setPipelines(prev => prev.filter(p => p.id !== id));
      
      // Update pagination if needed
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete pipeline';
      toast.error(errorMessage, { id: `delete-${id}` });
      throw err; // Re-throw to let the modal handle the error
    }
  }, [pipelines]);

  const refreshPipelines = useCallback(async () => {
    await loadPipelines();
  }, [loadPipelines]);

  // Load pipelines when filters change
  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);

  // Memoize actions to prevent re-creating object on every render
  const actions = useMemo(() => ({
    loadPipelines,
    setFilters,
    setPage,
    setPageSize,
    runPipeline,
    suspendPipeline,
    resumePipeline,
    deletePipeline,
    refreshPipelines,
  }), [loadPipelines, setFilters, setPage, setPageSize, runPipeline, suspendPipeline, resumePipeline, deletePipeline, refreshPipelines]);

  return {
    pipelines,
    loading,
    error,
    pagination,
    filters,
    actions,
  };
};

export default usePipelines;