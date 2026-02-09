'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface DLQFiltersState {
  executionId?: string;
  status?: string;
  limit: number;
}

interface DLQFiltersProps {
  onFilterChange: (filters: DLQFiltersState) => void;
  initialFilters?: Partial<DLQFiltersState>;
}

export function DLQFilters({ onFilterChange, initialFilters }: DLQFiltersProps) {
  const [filters, setFilters] = useState<DLQFiltersState>({
    executionId: initialFilters?.executionId || '',
    status: initialFilters?.status || '',
    limit: initialFilters?.limit || 100
  });

  const handleApply = () => {
    onFilterChange({
      executionId: filters.executionId || undefined,
      status: filters.status || undefined,
      limit: filters.limit
    });
  };

  const handleClear = () => {
    const clearedFilters = { executionId: '', status: '', limit: 100 };
    setFilters(clearedFilters);
    onFilterChange({ limit: 100 });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Execution ID
          </label>
          <input
            type="text"
            placeholder="Filter by execution..."
            value={filters.executionId}
            onChange={(e) => setFilters({ ...filters, executionId: e.target.value })}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Retrying">Retrying</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Discarded">Discarded</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Limit
          </label>
          <select
            value={filters.limit.toString()}
            onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="50">50 items</option>
            <option value="100">100 items</option>
            <option value="250">250 items</option>
            <option value="500">500 items</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleApply} variant="primary" size="md" className="flex-1">
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
            Apply
          </Button>
          <Button onClick={handleClear} variant="outline" size="md">
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
