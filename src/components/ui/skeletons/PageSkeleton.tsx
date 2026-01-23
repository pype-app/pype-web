interface PageSkeletonProps {
  layout?: 'dashboard' | 'list' | 'form';
  className?: string;
}

/**
 * Full page skeleton loader
 * 
 * @param layout - Page layout type (default: 'list')
 */
export default function PageSkeleton({ layout = 'list', className = '' }: PageSkeletonProps) {
  if (layout === 'dashboard') {
    return (
      <div className={`space-y-8 animate-pulse ${className}`}>
        {/* Header */}
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="mt-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
              style={{ height: '300px' }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'form') {
    return (
      <div className={`space-y-6 animate-pulse ${className}`}>
        {/* Header */}
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>

        {/* Form fields */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: list layout
  return (
    <div className={`space-y-6 animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {Array.from({ length: 4 }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 4 }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
