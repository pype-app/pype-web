'use client';

import { DLQStats } from '@/services/dlq.service';
import { 
  ExclamationCircleIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

interface DLQStatsCardsProps {
  stats: DLQStats;
  isLoading?: boolean;
}

export function DLQStatsCards({ stats, isLoading }: DLQStatsCardsProps) {
  if (isLoading) {
    return <StatsCardsSkeleton />;
  }

  const cards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: ExclamationCircleIcon,
      color: 'text-gray-600 dark:text-gray-400'
    },
    {
      title: 'Pending',
      value: stats.byStatus['Pending'] || 0,
      icon: ClockIcon,
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Success',
      value: stats.byStatus['Success'] || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Failed',
      value: stats.byStatus['Failed'] || 0,
      icon: XCircleIcon,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Retry Success Rate',
      value: `${(stats.retrySuccessRate * 100).toFixed(1)}%`,
      icon: CheckCircleIcon,
      color: 'text-blue-600 dark:text-blue-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div 
          key={card.title}
          className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className={`mt-1 text-2xl font-semibold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className={`flex-shrink-0 ${card.color}`}>
                <card.icon className="h-8 w-8" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i}
          className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
