import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { PipelineFilters } from '@/services/pipelineService';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';

interface PipelineFiltersProps {
  filters: PipelineFilters;
  onFiltersChange: (filters: Partial<PipelineFilters>) => void;
  availableTags?: string[];
  loading?: boolean;
}

export default function PipelineFiltersComponent({
  filters,
  onFiltersChange,
  availableTags = [],
  loading = false,
}: PipelineFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Check if user is ADMIN or OWNER (can toggle onlyMine)
  const canToggleOnlyMine = user?.role === UserRole.Admin || user?.role === UserRole.Owner;
  const isUser = user?.role === UserRole.User;

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== filters.search) {
        onFiltersChange({ search: search || undefined });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, filters.search, onFiltersChange]);

  const handleStatusChange = (status: string) => {
    onFiltersChange({ 
      status: status === 'all' ? undefined : status as 'active' | 'inactive'
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({ 
      tags: newTags.length > 0 ? newTags : undefined 
    });
  };

  const clearFilters = () => {
    setSearch('');
    onFiltersChange({
      search: undefined,
      status: undefined,
      tags: undefined,
      onlyMine: undefined,
    });
  };

  const hasActiveFilters = !!(
    filters.search || 
    filters.status || 
    (filters.tags && filters.tags.length > 0) ||
    filters.onlyMine
  );

  return (
    <div className="space-y-4">
      {/* Main search and status filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search pipelines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 disabled:opacity-50 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        
        {/* Status filter */}
        <div className="flex gap-2">
          <select 
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
            className="block rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 disabled:opacity-50 sm:text-sm sm:leading-6"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Only Mine toggle - only for ADMIN/OWNER */}
          {canToggleOnlyMine && (
            <button
              type="button"
              onClick={() => onFiltersChange({ onlyMine: !filters.onlyMine })}
              disabled={loading}
              className={`inline-flex items-center gap-x-1.5 px-3 py-2 text-sm font-semibold rounded-md shadow-sm disabled:opacity-50 transition-colors ${
                filters.onlyMine
                  ? 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <UserCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Only Mine
            </button>
          )}

          {/* Info badge for USER role */}
          {isUser && (
            <div className="inline-flex items-center gap-x-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
              <UserCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Your Pipelines
            </div>
          )}
          
          {/* Advanced filters toggle */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            disabled={loading}
            className="btn-secondary inline-flex items-center gap-x-1.5 disabled:opacity-50"
          >
            <FunnelIcon className="-ml-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                {[
                  filters.search && 'search',
                  filters.status && 'status',
                  filters.tags?.length && `${filters.tags.length} tags`,
                  filters.onlyMine && 'only mine'
                ].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              disabled={loading}
              className="btn-secondary inline-flex items-center gap-x-1.5 disabled:opacity-50"
            >
              <XMarkIcon className="-ml-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
          {/* Tags filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = filters.tags?.includes(tag) || false;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      disabled={loading}
                      className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                        isSelected
                          ? 'badge-blue ring-1 ring-blue-600/20 dark:ring-blue-400/30'
                          : 'bg-white dark:bg-gray-600 text-secondary ring-1 ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                      } disabled:opacity-50`}
                    >
                      {tag}
                      {isSelected && (
                        <XMarkIcon className="ml-1 h-3 w-3" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="border-t border-card pt-4">
              <div className="text-sm text-muted">
                <span className="font-medium">Active filters:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {filters.search && (
                    <span className="badge-blue inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
                      Search: "{filters.search}"
                    </span>
                  )}
                  {filters.status && (
                    <span className="badge-green inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
                      Status: {filters.status}
                    </span>
                  )}
                  {filters.onlyMine && (
                    <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-200">
                      Only Mine
                    </span>
                  )}
                  {filters.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-900 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-200"
                    >
                      Tag: {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}