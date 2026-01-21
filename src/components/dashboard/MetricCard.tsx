import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { MetricCardProps } from '@/types/dashboard';
import { CardSkeleton } from '@/components/ui/skeletons';

const TrendIndicator = React.memo(function TrendIndicator({ trend }: { trend: MetricCardProps['trend'] }) {
  if (!trend) return null;

  const { value, isPositive, label } = trend;
  const TrendIcon = isPositive ? ChevronUpIcon : ChevronDownIcon;
  const trendColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className={`flex items-center text-sm ${trendColor}`}>
      <TrendIcon className="h-4 w-4" />
      <span className="ml-1">
        {Math.abs(value)}% {label}
      </span>
    </div>
  );
});

const MetricCard = React.memo(function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'blue',
  loading = false
}: MetricCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
    red: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
    yellow: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
    purple: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20',
    gray: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    purple: 'text-purple-600 dark:text-purple-400',
    gray: 'text-gray-600 dark:text-gray-400'
  };

  if (loading) {
    return (
      <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-md ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted">{title}</h3>
        {Icon && (
          <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
        )}
      </div>

      <div className="mt-2">
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-primary">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>

        <div className="mt-1 flex items-center justify-between">
          {subtitle && (
            <p className="text-sm text-muted">{subtitle}</p>
          )}
          <TrendIndicator trend={trend} />
        </div>
      </div>
    </div>
  );
});

export default MetricCard;