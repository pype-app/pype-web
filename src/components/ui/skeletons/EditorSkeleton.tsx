interface EditorSkeletonProps {
  height?: string;
  className?: string;
}

/**
 * Monaco Editor skeleton loader
 * 
 * @param height - Height of the editor (default: '400px')
 */
export default function EditorSkeleton({ height = '400px', className = '' }: EditorSkeletonProps) {
  return (
    <div
      className={`bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 ${className}`}
      style={{ height }}
    >
      <div className="animate-pulse space-y-3">
        {/* Editor toolbar */}
        <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
          <div className="ml-auto h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
        </div>

        {/* Line numbers */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3 items-end w-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4"></div>
            ))}
          </div>

          {/* Code lines */}
          <div className="flex-1 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded" style={{ width: `${Math.random() * 60 + 40}%` }}></div>
            ))}
          </div>
        </div>

        {/* Loading text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading editor...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
