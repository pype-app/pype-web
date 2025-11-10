'use client';

import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const metrics = [
  {
    name: 'Total Executions',
    value: '1,234',
    change: '+12%',
    changeType: 'positive',
    period: 'vs last month',
  },
  {
    name: 'Success Rate',
    value: '94.2%',
    change: '+2.1%',
    changeType: 'positive',
    period: 'vs last month',
  },
  {
    name: 'Avg Duration',
    value: '3m 24s',
    change: '-8%',
    changeType: 'positive',
    period: 'vs last month',
  },
  {
    name: 'Data Processed',
    value: '2.4TB',
    change: '+18%',
    changeType: 'positive',
    period: 'vs last month',
  },
];

const topPipelines = [
  { name: 'Customer Data Sync', executions: 456, successRate: 98.2 },
  { name: 'Invoice Processing', executions: 234, successRate: 95.1 },
  { name: 'Report Generation', executions: 189, successRate: 92.7 },
  { name: 'Product Catalog Update', executions: 156, successRate: 96.8 },
  { name: 'Sales Data Import', executions: 134, successRate: 89.5 },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Performance metrics and insights for your pipelines
        </p>
      </div>

      {/* Time period selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Time Period:</label>
        <select className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6">
          <option>Last 24 hours</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{metric.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{metric.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="flex items-center">
                  {metric.changeType === 'positive' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={classNames(
                      metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600',
                      'font-medium'
                    )}
                  >
                    {metric.change}
                  </span>
                  <span className="text-gray-500 ml-1">{metric.period}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Execution trends chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Execution Trends
            </h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Chart placeholder</p>
                <p className="text-xs text-gray-400">Integration with Chart.js or D3.js needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success rate chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Success Rate Over Time
            </h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Chart placeholder</p>
                <p className="text-xs text-gray-400">Integration with Chart.js or D3.js needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top performing pipelines */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Top Performing Pipelines
          </h3>
          <div className="flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200">
              {topPipelines.map((pipeline, index) => (
                <li key={pipeline.name} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pipeline.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pipeline.executions} executions
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {pipeline.successRate}%
                        </p>
                        <p className="text-sm text-gray-500">success rate</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick insights */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Quick Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Peak hours:</span> Most executions happen between 8 AM - 12 PM
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Performance improvement:</span> Average execution time decreased by 15% this month
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-5 w-5 text-purple-500 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">
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