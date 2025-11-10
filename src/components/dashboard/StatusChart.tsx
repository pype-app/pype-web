'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { ChartDataPoint } from '@/types/dashboard';

interface StatusChartProps {
  data: ChartDataPoint[];
  height?: number;
  showLegend?: boolean;
}

const COLORS = {
  success: '#10b981',
  failed: '#ef4444',
  running: '#3b82f6',
  pending: '#f59e0b',
  cancelled: '#6b7280'
};

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {data.name}
        </p>
        <p className="text-sm" style={{ color: data.color }}>
          Quantidade: {data.value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.payload.label && `(${data.payload.label})`}
        </p>
      </div>
    );
  }

  return null;
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null; // Não mostrar label se for menos de 5%
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function StatusChart({ 
  data, 
  height = 300, 
  showLegend = true 
}: StatusChartProps) {
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);

  if (!hasData) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🍰</div>
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Status statistics will appear here
          </p>
        </div>
      </div>
    );
  }

  // Filtrar dados com valor > 0 e adicionar cores
  const chartData = data
    .filter(item => item.value > 0)
    .map(item => ({
      ...item,
      color: COLORS[item.name.toLowerCase() as keyof typeof COLORS] || '#6b7280'
    }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}