'use client';

import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAnalytics } from '@/hooks/useAnalytics';
import { analyticsService, TimePeriod } from '@/services/analyticsService';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AnalyticsPage() {
  const {
    overview,
    topPipelines,
    trends,
    loading,
    error,
    period,
    setPeriod,
    refresh,
  } = useAnalytics();

  if (error && !overview) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Analytics
          </h1>
        </div>
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Error loading analytics
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={refresh}
                  className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md px-3 py-2 text-sm font-medium"
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

  const metrics = overview ? [
    {
      name: 'Total Executions',
      value: overview.totalExecutions.toString(),
      change: analyticsService.formatChange(overview.executionsChange),
      changeType: overview.executionsChange >= 0 ? 'positive' : 'negative',
      period: `vs ${period === '24h' ? 'yesterday' : 'last period'}`,
    },
    {
      name: 'Success Rate',
      value: `${overview.successRate.toFixed(1)}%`,
      change: analyticsService.formatChange(overview.successRateChange),
      changeType: overview.successRateChange >= 0 ? 'positive' : 'negative',
      period: `vs ${period === '24h' ? 'yesterday' : 'last period'}`,
    },
    {
      name: 'Avg Duration',
      value: analyticsService.formatDuration(overview.avgDurationSeconds),
      change: analyticsService.formatChange(overview.durationChange),
      changeType: overview.durationChange <= 0 ? 'positive' : 'negative',
      period: `vs ${period === '24h' ? 'yesterday' : 'last period'}`,
    },
    {
      name: 'Failed Executions',
      value: overview.failedExecutions.toString(),
      change: '',
      changeType: 'neutral',
      period: 'in this period',
    },
  ] : [];
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Performance metrics and insights for your pipelines
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600"
          >
            <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {/* Time period selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period:</label>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value as TimePeriod)}
          disabled={loading}
          className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 disabled:opacity-50"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key metrics */}
      {loading && !overview ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-lg rounded-lg animate-pulse">
              <div className="p-5">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
          <div key={metric.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-lg rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{metric.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">{metric.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3">
              <div className="text-sm">
                <div className="flex items-center">
                  {metric.changeType === 'positive' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 dark:text-green-400 mr-1" />
                  ) : metric.changeType === 'negative' ? (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 dark:text-red-400 mr-1" />
                  ) : null}
                  {metric.change && (
                    <span
                      className={classNames(
                        metric.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                        'font-medium'
                      )}
                    >
                      {metric.change}
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400 ml-1">{metric.period}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Execution trends chart */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Execution Trends
            </h3>
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Chart placeholder</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Integration with Chart.js or D3.js needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success rate chart */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Success Rate Over Time
            </h3>
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Chart placeholder</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Integration with Chart.js or D3.js needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top performing pipelines */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
            Top Performing Pipelines
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 animate-spin" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          ) : topPipelines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">No pipeline data available for this period</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {topPipelines.map((pipeline, index) => (
                  <li key={pipeline.pipelineId} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">#{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {pipeline.pipelineName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {pipeline.totalExecutions} executions
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {pipeline.successRate.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">success rate</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick insights */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
            Quick Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">Peak hours:</span> Most executions happen between 8 AM - 12 PM
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">Performance improvement:</span> Average execution time decreased by 15% this month
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">Data volume:</span> Processing 40% more data compared to last month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}