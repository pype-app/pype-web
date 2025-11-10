import React from 'react';
import MetricCard from './MetricCard';
import { MetricCardProps } from '@/types/dashboard';

interface MetricGridProps {
  metrics: MetricCardProps[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function MetricGrid({ 
  metrics, 
  loading = false, 
  columns = 4,
  className = "" 
}: MetricGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  // Se estiver carregando, mostra skeletons
  const displayMetrics = loading 
    ? Array(columns).fill(null).map((_, index) => ({
        title: 'Loading...',
        value: '---',
        loading: true
      } as MetricCardProps))
    : metrics;

  return (
    <div className={`grid gap-6 ${gridClasses[columns]} ${className}`}>
      {displayMetrics.map((metric, index) => (
        <MetricCard
          key={loading ? `skeleton-${index}` : `metric-${index}`}
          {...metric}
        />
      ))}
    </div>
  );
}