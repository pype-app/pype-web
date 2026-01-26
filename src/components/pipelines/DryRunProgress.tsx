'use client'

import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import type { DryRunStatus } from '@/types/dry-run'

interface DryRunProgressProps {
  status: DryRunStatus | null
  isPolling: boolean
  durationMs?: number
  className?: string
}

/**
 * Progress indicator for dry-run execution
 * 
 * Displays visual feedback for the current state of a dry-run:
 * - pending: Waiting to start
 * - running: Currently executing
 * - completed: Finished successfully
 * - failed: Execution failed
 * - cancelled: User cancelled
 */
export function DryRunProgress({
  status,
  isPolling,
  durationMs,
  className = '',
}: DryRunProgressProps) {
  if (!status && !isPolling) {
    return null
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: ClockIcon,
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          label: 'Pending',
          description: 'Dry-run is queued and waiting to start...',
          showSpinner: true,
        }
      case 'running':
        return {
          icon: ClockIcon,
          iconColor: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          label: 'Running',
          description: 'Executing pipeline steps...',
          showSpinner: true,
        }
      case 'completed':
        return {
          icon: CheckCircleIcon,
          iconColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Completed',
          description: durationMs ? `Finished in ${durationMs}ms` : 'Dry-run completed successfully',
          showSpinner: false,
        }
      case 'failed':
        return {
          icon: XCircleIcon,
          iconColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Failed',
          description: 'Dry-run execution failed',
          showSpinner: false,
        }
      case 'cancelled':
        return {
          icon: ExclamationCircleIcon,
          iconColor: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          label: 'Cancelled',
          description: 'Dry-run was cancelled',
          showSpinner: false,
        }
      default:
        return {
          icon: ClockIcon,
          iconColor: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          label: 'Unknown',
          description: 'Status unknown',
          showSpinner: false,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div
      className={`rounded-md border p-4 ${config.bgColor} ${config.borderColor} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {config.showSpinner ? (
            <div className="relative">
              <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent opacity-50" />
              </div>
            </div>
          ) : (
            <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.iconColor}`}>
            {config.label}
          </h3>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {config.description}
          </p>
          {isPolling && (status === 'pending' || status === 'running') && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Checking status every 2 seconds...
            </p>
          )}
        </div>
      </div>

      {/* Progress bar for running state */}
      {status === 'running' && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full bg-blue-600 dark:bg-blue-500 animate-progress-indeterminate" />
          </div>
        </div>
      )}
    </div>
  )
}
