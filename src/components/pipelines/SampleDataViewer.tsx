'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface SampleDataViewerProps {
  data: any[]
  stepName: string
  className?: string
}

/**
 * Viewer for sample data from a dry-run step
 * 
 * Displays JSON data in a collapsible, formatted view.
 * Handles arrays and objects, with syntax highlighting.
 */
export function SampleDataViewer({ data, stepName, className = '' }: SampleDataViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data || data.length === 0) {
    return (
      <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        <p>No sample data available for this step</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300"
      >
        {isExpanded ? (
          <ChevronDownIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
        Sample Data from {stepName} ({data.length} {data.length === 1 ? 'record' : 'records'})
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Record {index + 1}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {typeof item === 'object' && item !== null
                    ? `${Object.keys(item).length} fields`
                    : typeof item}
                </span>
              </div>
              <pre className="text-xs overflow-x-auto p-2 bg-white dark:bg-black rounded border border-gray-200 dark:border-gray-800">
                <code className="text-gray-800 dark:text-gray-200">
                  {JSON.stringify(item, null, 2)}
                </code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
