interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

/**
 * Chart skeleton loader
 * 
 * @param height - Height in pixels (default: 300)
 */
export default function ChartSkeleton({ height = 300, className = '' }: ChartSkeletonProps) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40 mx-auto"></div>
      </div>
    </div>
  );
}
