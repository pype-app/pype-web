interface CardSkeletonProps {
  className?: string;
}

/**
 * Card skeleton loader for metric cards
 */
export default function CardSkeleton({ className = '' }: CardSkeletonProps) {
  return (
    <div className={`rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="mt-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}
