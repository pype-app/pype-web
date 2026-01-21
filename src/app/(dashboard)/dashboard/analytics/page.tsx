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
import { CardSkeleton } from '@/components/ui/skeletons';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AnalyticsPage() {
  const {
    overview,
    topPipelines,
    trends,
    loading,
    isRefreshing,
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
            className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
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
          className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6"
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
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
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
      <div className={`grid grid-cols-1 gap-8 lg:grid-cols-2 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        {/* Execution trends chart */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Execution Trends
            </h3>
            {loading ? (
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 animate-spin" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </div>
            ) : trends.length === 0 ? (
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No execution data for this period</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <div className="flex items-end justify-between h-full gap-1 pb-6">
                  {trends.map((trend, index) => {
                    const maxExecutions = Math.max(...trends.map(t => t.totalExecutions), 1);
                    const heightPercent = (trend.totalExecutions / maxExecutions) * 100;
                    // Minimum 8% height so bar is always visible
                    const height = Math.max(heightPercent, 8);
                    const date = new Date(trend.date);
                    const label = period === '24h'
                      ? date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
                      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="relative w-full">
                          <div
                            className="w-full bg-blue-500 dark:bg-blue-400 rounded-t transition-all group-hover:bg-blue-600 dark:group-hover:bg-blue-300"
                            style={{ height: `${height}%` }}
                            title={`${trend.totalExecutions} executions (${trend.successRate.toFixed(1)}% success)`}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                              {trend.totalExecutions} exec
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success rate chart */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Success Rate Over Time
            </h3>
            {loading ? (
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 animate-spin" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </div>
            ) : trends.length === 0 ? (
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No data for this period</p>
                </div>
              </div>
            ) : (
              <div className="h-64 relative pl-10">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="0" x2="400" y2="0" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="400" y2="150" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" strokeDasharray="4" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />

                  {/* Line chart */}
                  {trends.length > 1 ? (
                    <polyline
                      points={trends.map((trend, index) => {
                        const x = (index / (trends.length - 1)) * 400;
                        const y = 200 - (trend.successRate * 2);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-green-500 dark:text-green-400"
                    />
                  ) : null}

                  {/* Data points */}
                  {trends.map((trend, index) => {
                    const x = trends.length > 1 ? (index / (trends.length - 1)) * 400 : 200;
                    const y = 200 - (trend.successRate * 2);
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="currentColor"
                          className="text-green-500 dark:text-green-400"
                        />
                        <title>{`${new Date(trend.date).toLocaleDateString()}: ${trend.successRate.toFixed(1)}%`}</title>
                      </g>
                    );
                  })}
                </svg>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top performing pipelines */}
      <div className={`bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
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
      <div className={`bg-white dark:bg-gray-800 shadow dark:shadow-lg rounded-lg transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
            Quick Insights
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <ArrowPathIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 animate-spin" />
            </div>
          ) : overview ? (
            <div className="space-y-4">
              {overview.successRate >= 90 ? (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">Excellent performance:</span> Success rate is at {overview.successRate.toFixed(1)}%, well above target
                    </p>
                  </div>
                </div>
              ) : overview.successRate < 80 ? (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">Attention needed:</span> Success rate is at {overview.successRate.toFixed(1)}%, below recommended threshold
                    </p>
                  </div>
                </div>
              ) : null}

              {overview.durationChange < 0 ? (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">Performance improved:</span> Average execution time decreased by {Math.abs(overview.durationChange).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ) : overview.durationChange > 0 ? (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">Duration increased:</span> Average execution time increased by {overview.durationChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ) : null}

              {topPipelines.length > 0 && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">Most active pipeline:</span> {topPipelines[0].pipelineName} with {topPipelines[0].totalExecutions} executions
                    </p>
                  </div>
                </div>
              )}

              {overview.failedExecutions > 0 && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">Failed executions:</span> {overview.failedExecutions} execution{overview.failedExecutions !== 1 ? 's' : ''} failed in this period
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">No insights available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}