'use client';

import React, { useState, useEffect } from 'react';
import { 
  CircleStackIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import MetricGrid from '@/components/dashboard/MetricGrid';
import ExecutionChart from '@/components/dashboard/ExecutionChart';
import StatusChart from '@/components/dashboard/StatusChart';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import { dashboardService } from '@/services/dashboardService';
import { DashboardStats, MetricCardProps, TimeSeriesDataPoint, ChartDataPoint } from '@/types/dashboard';
import { useInterval } from '@/hooks/useInterval';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await dashboardService.getStats();
      setStats(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading statistics');
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds
  useInterval(
    () => {
      if (autoRefresh && !loading && !refreshing) {
        loadStats(true);
      }
    },
    autoRefresh ? 30000 : null // 30 segundos ou null para pausar
  );

  useEffect(() => {
    loadStats();
  }, []);

  // Preparar dados para os cards de métricas
  const getMetricCards = (): MetricCardProps[] => {
    if (!stats) return [];

    return [
      {
        title: 'Total Pipelines',
        value: stats.pipelines.total,
        subtitle: `${stats.pipelines.active} active`,
        trend: stats.pipelines.active > stats.pipelines.inactive ? {
          value: Math.round((stats.pipelines.active / stats.pipelines.total) * 100),
          isPositive: true,
          label: 'active'
        } : undefined,
        icon: CircleStackIcon,
        color: 'blue'
      },
      {
        title: 'Executions Today',
        value: stats.executions.today.total,
        subtitle: `${stats.executions.today.success} successful`,
        trend: stats.executions.today.total > 0 ? {
          value: Math.round((stats.executions.today.success / stats.executions.today.total) * 100),
          isPositive: stats.executions.today.success > stats.executions.today.failed,
          label: 'success rate'
        } : undefined,
        icon: CheckCircleIcon,
        color: 'green'
      },
      {
        title: 'Running',
        value: stats.executions.today.running,
        subtitle: 'active pipelines',
        icon: PlayIcon,
        color: 'purple'
      },
      {
        title: 'Failures Today',
        value: stats.executions.today.failed,
        subtitle: stats.executions.today.failed > 0 ? 'needs attention' : 'all good',
        icon: ExclamationTriangleIcon,
        color: stats.executions.today.failed > 0 ? 'red' : 'gray'
      }
    ];
  };

  // Preparar dados para gráfico de execuções
  const getExecutionChartData = (): TimeSeriesDataPoint[] => {
    if (!stats?.executions.last24Hours) return [];

    return stats.executions.last24Hours.map(point => ({
      time: point.timestamp,
      success: point.success,
      failed: point.failed,
      total: point.total
    }));
  };

  // Preparar dados para gráfico de status
  const getStatusChartData = (): ChartDataPoint[] => {
    if (!stats?.executions.today) return [];

    const { success, failed, running, pending, cancelled } = stats.executions.today;
    
    return [
      { name: 'Success', value: success, label: 'Successful' },
      { name: 'Failed', value: failed, label: 'Failed' },
      { name: 'Running', value: running, label: 'Running' },
      { name: 'Pending', value: pending, label: 'Pending' },
      { name: 'Cancelled', value: cancelled, label: 'Cancelled' }
    ].filter(item => item.value > 0);
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Overview of your pipeline orchestration system
          </p>
        </div>

        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => loadStats()}
                  className="bg-red-100 dark:bg-red-800 px-3 py-2 text-sm font-medium text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Overview of your pipeline orchestration system
          </p>
          {lastRefresh && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Last updated: {lastRefresh.toLocaleTimeString()}
              {autoRefresh && <span className="ml-2 text-green-600 dark:text-green-400">• Auto-refresh ON</span>}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Auto-refresh toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoRefresh ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-refresh</span>
          </div>

          {/* Manual refresh button */}
          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricGrid
        metrics={getMetricCards()}
        loading={loading}
        columns={4}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Execution Chart */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Executions - Last 24h
          </h3>
          {loading ? (
            <div className="h-72 bg-gray-50 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <ExecutionChart 
              data={getExecutionChartData()} 
              height={288}
              period="24h"
            />
          )}
        </div>

        {/* Status Chart */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Status - Today
          </h3>
          {loading ? (
            <div className="h-72 bg-gray-50 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <StatusChart 
              data={getStatusChartData()} 
              height={288}
            />
          )}
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Performance by Hour
        </h3>
        {loading ? (
          <div className="h-72 bg-gray-50 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <PerformanceChart 
            data={stats?.performance.executionTimeByHour || []} 
            height={288}
          />
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 dark:focus-within:ring-blue-400 rounded-lg shadow dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-shadow">
          <div>
            <span className="rounded-lg inline-flex p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 ring-4 ring-white dark:ring-gray-800">
              <CircleStackIcon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              <a href="/dashboard/pipelines" className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                View Pipelines
              </a>
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Manage and monitor all your data pipelines in one place.
            </p>
          </div>
          <span
            className="pointer-events-none absolute top-6 right-6 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500"
            aria-hidden="true"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
            </svg>
          </span>
        </div>

        <div className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 dark:focus-within:ring-blue-400 rounded-lg shadow dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-shadow">
          <div>
            <span className="rounded-lg inline-flex p-3 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 ring-4 ring-white dark:ring-gray-800">
              <PlayIcon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              <a href="/dashboard/pipelines/create" className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                Create Pipeline
              </a>
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Build new data pipelines with our intuitive YAML editor.
            </p>
          </div>
          <span
            className="pointer-events-none absolute top-6 right-6 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500"
            aria-hidden="true"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
            </svg>
          </span>
        </div>

        <div className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 dark:focus-within:ring-blue-400 rounded-lg shadow dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-shadow">
          <div>
            <span className="rounded-lg inline-flex p-3 bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 ring-4 ring-white dark:ring-gray-800">
              <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              <a href="http://localhost:18080/hangfire" target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                Hangfire Dashboard
              </a>
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Monitor background jobs and recurring tasks.
            </p>
          </div>
          <span
            className="pointer-events-none absolute top-6 right-6 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500"
            aria-hidden="true"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}