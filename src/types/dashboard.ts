/**
 * Tipos TypeScript para o dashboard de métricas e monitoramento
 */

export interface DashboardStats {
  pipelines: PipelineStats;
  executions: ExecutionStats;
  performance: PerformanceStats;
  lastUpdated: string;
}

export interface PipelineStats {
  total: number;
  active: number;
  inactive: number;
  withSchedule: number;
  withoutSchedule: number;
}

export interface ExecutionStats {
  today: ExecutionCountByStatus;
  thisWeek: ExecutionCountByStatus;
  thisMonth: ExecutionCountByStatus;
  last24Hours: ExecutionTimeSeriesPoint[];
  last7Days: ExecutionTimeSeriesPoint[];
}

export interface ExecutionCountByStatus {
  total: number;
  success: number;
  failed: number;
  running: number;
  pending: number;
  cancelled: number;
}

export interface ExecutionTimeSeriesPoint {
  timestamp: string;
  date: string;
  hour?: number;
  success: number;
  failed: number;
  total: number;
}

export interface PerformanceStats {
  averageExecutionTime: number; // em milissegundos
  fastest: ExecutionPerformance;
  slowest: ExecutionPerformance;
  totalExecutionTime: number; // tempo total de todas execuções em ms
  executionTimeByHour: PerformanceTimePoint[];
}

export interface ExecutionPerformance {
  pipelineId: string;
  pipelineName: string;
  executionId: string;
  duration: number; // em milissegundos
  startedAt: string;
}

export interface PerformanceTimePoint {
  hour: number;
  averageDuration: number;
  executionCount: number;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  loading?: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

export interface TimeSeriesDataPoint {
  time: string;
  success: number;
  failed: number;
  total: number;
}

// Status de refresh do dashboard
export interface DashboardRefreshState {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  autoRefresh: boolean;
  refreshInterval: number; // em segundos
  error: string | null;
}

// Configurações do dashboard
export interface DashboardConfig {
  autoRefreshEnabled: boolean;
  refreshIntervalSeconds: number;
  showTrends: boolean;
  defaultTimeRange: '24h' | '7d' | '30d';
  chartsEnabled: boolean;
}