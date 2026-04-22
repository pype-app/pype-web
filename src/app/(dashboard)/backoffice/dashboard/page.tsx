'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UsersIcon,
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { backofficeService } from '@/services/backofficeService';
import { BackofficeKpiResponse, KpiCard } from '@/types/backoffice';

function formatTrend(trend: KpiCard['trend']): string {
  if (trend.length < 2) return '';
  const first = trend[0].value;
  const last = trend[trend.length - 1].value;
  if (first === 0) return '';
  const pct = (((last - first) / first) * 100).toFixed(1);
  const sign = last >= first ? '+' : '';
  return `${sign}${pct}% (7d)`;
}

function TrendSparkline({ trend }: { trend: KpiCard['trend'] }) {
  if (trend.length === 0) return null;
  const max = Math.max(...trend.map((p) => p.value), 1);
  const width = 80;
  const height = 32;
  const points = trend.map((p, i) => {
    const x = (i / (trend.length - 1)) * width;
    const y = height - (p.value / max) * height;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-400"
      />
    </svg>
  );
}

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  card: KpiCard;
  suffix?: string;
}

function KpiMetricCard({ title, value, icon: Icon, card, suffix = '' }: KpiCardProps) {
  const trend = formatTrend(card.trend);
  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {value.toLocaleString()}{suffix}
          </p>
          {trend && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{trend}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-y-2">
          <Icon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          <TrendSparkline trend={card.trend} />
        </div>
      </div>
    </div>
  );
}

export default function BackofficeDashboardPage() {
  const [kpi, setKpi] = useState<BackofficeKpiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await backofficeService.getKpi();
      setKpi(data);
    } catch {
      setError('Failed to load KPI metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
        <ExclamationTriangleIcon className="inline h-4 w-4 mr-2" />
        {error}
        <button
          onClick={load}
          className="ml-3 underline hover:no-underline focus:outline-none"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!kpi) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Platform KPIs</h2>
        <div className="flex items-center gap-x-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Updated {new Date(kpi.generatedAt).toLocaleTimeString()}
          </span>
          <button
            onClick={load}
            className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Refresh KPIs"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiMetricCard
          title="Active Customers"
          value={kpi.activeCustomers.value}
          icon={UsersIcon}
          card={kpi.activeCustomers}
        />
        <KpiMetricCard
          title="Active Tenants"
          value={kpi.activeTenants.value}
          icon={BuildingOffice2Icon}
          card={kpi.activeTenants}
        />
        <KpiMetricCard
          title="Active Users"
          value={kpi.activeUsers.value}
          icon={UsersIcon}
          card={kpi.activeUsers}
        />
        <KpiMetricCard
          title="Error Rate (7d)"
          value={parseFloat(kpi.errorRate.value.toFixed(2))}
          icon={ExclamationTriangleIcon}
          card={kpi.errorRate}
          suffix="%"
        />
      </div>
    </div>
  );
}
