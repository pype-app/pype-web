'use client';

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowPathIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import apiClient from '@/lib/api-client';
import { useDebounce } from '@/hooks/useDebounce';
import { PageSkeleton } from '@/components/ui/skeletons';

interface PipelineExecution {
  id: string;
  pipelineId: string;
  pipelineName: string;
  pipelineOwner: string;
  triggeredByUser: string;
  tenantId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  recordsProcessed?: number;
  errorMessage?: string;
  logs?: string;
}

interface PipelineExecutionLog {
  id: string;
  timestamp: string;
  level: string;
  category: string;
  stepName?: string;
  message: string;
  data?: string;
  stackTrace?: string;
  threadId?: string;
  hostName?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    Success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    Running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    Failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    Scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  return (
    <span className={classNames(
      'inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium w-20',
      statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    )}>
      {status}
    </span>
  );
}

function LogModal({
  execution,
  isOpen,
  onClose
}: {
  execution: PipelineExecution | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<PipelineExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && execution?.id) {
      fetchLogs();
    }
  }, [isOpen, execution?.id]);

  const fetchLogs = async () => {
    if (!execution?.id) return;

    try {
      setLoading(true);
      const result = await apiClient.get(`/api/logs/execution/${execution.id}`);
      setLogs(result || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      Debug: 'text-gray-600 dark:text-gray-400',
      Info: 'text-blue-600 dark:text-blue-400',
      Warning: 'text-yellow-600 dark:text-yellow-400',
      Error: 'text-red-600 dark:text-red-400',
      Critical: 'text-red-700 dark:text-red-300 font-bold'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75" onClick={onClose}></div>

        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Logs - {execution?.pipelineName}
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Carregando logs...</p>
                  </div>
                ) : logs.length > 0 ? (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm">
                        <div className="flex items-start space-x-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {format(new Date(log.timestamp), 'HH:mm:ss.SSS', { locale: ptBR })}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getLevelColor(log.level)}`}>
                            {log.level}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                            {log.category}
                          </span>
                          {log.stepName && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              {log.stepName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white mt-2 font-mono">
                          {log.message}
                        </p>
                        {log.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                              Dados adicionais
                            </summary>
                            <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(JSON.parse(log.data), null, 2)}
                            </pre>
                          </details>
                        )}
                        {log.stackTrace && (
                          <details className="mt-2">
                            <summary className="text-xs text-red-500 cursor-pointer">
                              Stack Trace
                            </summary>
                            <pre className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded mt-1 overflow-auto">
                              {log.stackTrace}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nenhum log encontrado para esta execução
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExecutionsPage() {
  const { user } = useAuthStore();
  const [executions, setExecutions] = useState<PipelineExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('');
  const [selectedExecution, setSelectedExecution] = useState<PipelineExecution | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Debounce search to avoid excessive filtering
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (user) {
      fetchExecutions();
    }
  }, [user]);

  const fetchExecutions = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const result = await apiClient.get('/api/executions');
      setExecutions(result || []);
    } catch (error) {
      console.error('Error fetching executions:', error);
      setExecutions([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const refreshExecutions = async () => {
    setIsRefreshing(true);
    await fetchExecutions(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setTimeout(() => setIsRefreshing(false), 200);
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return 'N/A';

    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  };

  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = !debouncedSearch ||
      execution.pipelineName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      execution.id.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus = !statusFilter || execution.status === statusFilter;
    const matchesPipeline = !pipelineFilter || execution.pipelineName === pipelineFilter;

    return matchesSearch && matchesStatus && matchesPipeline;
  });

  const handleViewLogs = (execution: PipelineExecution) => {
    setSelectedExecution(execution);
    setShowLogsModal(true);
  };

  const handleRetryExecution = async (executionId: string) => {
    try {
      await apiClient.post(`/api/executions/${executionId}/retry`);
      fetchExecutions(); // Refresh the list
    } catch (error) {
      console.error('Erro ao repetir execução:', error);
    }
  };

  const handleStopExecution = async (executionId: string) => {
    try {
      await apiClient.post(`/api/executions/${executionId}/stop`);
      fetchExecutions(); // Refresh the list
    } catch (error) {
      console.error('Erro ao parar execução:', error);
    }
  };

  if (loading) {
    return <PageSkeleton layout="list" />;
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Pipeline Executions
        </h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Monitor and track all pipeline execution runs
        </p>
      </div>

      {/* Filters and search */}
      <div className={`flex flex-col sm:flex-row gap-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        <div className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search executions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6"
          >
            <option value="">All Status</option>
            <option value="Success">Success</option>
            <option value="Running">Running</option>
            <option value="Failed">Failed</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={pipelineFilter}
            onChange={(e) => setPipelineFilter(e.target.value)}
            className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6"
          >
            <option value="">All Pipelines</option>
            {Array.from(new Set(executions.map(e => e.pipelineName))).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={refreshExecutions}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowPathIcon className={`-ml-0.5 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {/* Executions list */}
      <div className={`bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        {filteredExecutions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {executions.length === 0 ? 'No executions found' : 'No executions match the selected filters'}
            </p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredExecutions.map((execution) => (
              <li key={execution.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <StatusBadge status={execution.status} />
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {execution.pipelineName}
                          </h3>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            #{execution.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Owner: {execution.pipelineOwner}
                          </span>
                          <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Triggered by: {execution.triggeredByUser}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="font-medium text-blue-700 dark:text-blue-400">Started:</span>
                            <span className="ml-1">{formatDateTime(execution.startedAt)}</span>
                          </div>
                          {execution.completedAt && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="font-medium text-green-700 dark:text-green-400">Completed:</span>
                              <span className="ml-1">{formatDateTime(execution.completedAt)}</span>
                            </div>
                          )}
                        </div>
                        {execution.errorMessage && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Error: {execution.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewLogs(execution)}
                        className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        <EyeIcon className="h-3 w-3 mr-1" />
                        View Logs
                      </button>

                      {execution.status === 'Running' && (
                        <button
                          type="button"
                          onClick={() => handleStopExecution(execution.id)}
                          className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-400/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <StopIcon className="h-3 w-3 mr-1" />
                          Stop
                        </button>
                      )}

                      {(execution.status === 'Failed' || execution.status === 'Success') && (
                        <button
                          type="button"
                          onClick={() => handleRetryExecution(execution.id)}
                          className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                          <ArrowPathIcon className="h-3 w-3 mr-1" />
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDuration(execution.duration)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Execution Attempt</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                          {(execution as any).attemptNumber || 1} of {(execution as any).maxAttempts || 1}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pipeline ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{execution.pipelineId.slice(0, 8)}</dd>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Log Modal */}
      <LogModal
        execution={selectedExecution}
        isOpen={showLogsModal}
        onClose={() => {
          setShowLogsModal(false);
          setSelectedExecution(null);
        }}
      />
    </div>
  );
}