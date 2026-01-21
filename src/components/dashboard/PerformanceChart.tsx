'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { PerformanceTimePoint } from '@/types/dashboard';

interface PerformanceChartProps {
  data: PerformanceTimePoint[];
  height?: number;
}

const CustomTooltip = React.memo(function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}:00h
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Duração média: {formatDuration(data.value)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Execuções: {payload[0].payload.executionCount}
        </p>
      </div>
    );
  }

  return null;
});

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(0)}ms`;
  }
  
  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(1)}min`;
  }
  
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}

const PerformanceChart = React.memo(function PerformanceChart({ 
  data, 
  height = 300 
}: PerformanceChartProps) {
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">⚡</div>
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Performance metrics will appear here
          </p>
        </div>
      </div>
    );
  }

  // Preparar dados com formatação de hora
  const chartData = data.map(item => ({
    ...item,
    hour: `${item.hour.toString().padStart(2, '0')}`,
    formattedDuration: formatDuration(item.averageDuration)
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis 
            dataKey="hour"
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            className="text-xs text-gray-600 dark:text-gray-400"
            tickFormatter={formatDuration}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="averageDuration"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            name="Duração Média"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default PerformanceChart;