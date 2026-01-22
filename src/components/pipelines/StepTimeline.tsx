'use client'

import { CheckCircleIcon, XCircleIcon, ClockIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import type { DryRunStepResult } from '@/types/dry-run'

interface StepTimelineProps {
  steps: DryRunStepResult[]
  className?: string
}

/**
 * Timeline visualization of dry-run pipeline steps
 * 
 * Displays each step's status, duration, and message count in a vertical timeline format.
 */
export function StepTimeline({ steps, className = '' }: StepTimelineProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No steps recorded</p>
      </div>
    )
  }

  const getStepIcon = (step: DryRunStepResult) => {
    if (step.skipped) {
      return {
        Icon: ChevronRightIcon,
        className: 'text-gray-400 dark:text-gray-500',
        bgClassName: 'bg-gray-100 dark:bg-gray-700',
      }
    }
    if (step.success) {
      return {
        Icon: CheckCircleIcon,
        className: 'text-green-600 dark:text-green-400',
        bgClassName: 'bg-green-100 dark:bg-green-900/50',
      }
    }
    return {
      Icon: XCircleIcon,
      className: 'text-red-600 dark:text-red-400',
      bgClassName: 'bg-red-100 dark:bg-red-900/50',
    }
  }

  return (
    <div className={`flow-root ${className}`}>
      <ul role="list" className="-mb-8">
        {steps.map((step, stepIdx) => {
          const { Icon, className: iconClassName, bgClassName } = getStepIcon(step)
          const isLast = stepIdx === steps.length - 1

          return (
            <li key={stepIdx}>
              <div className="relative pb-8">
                {/* Connecting line */}
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex space-x-3">
                  {/* Icon */}
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${bgClassName}`}>
                      <Icon className={`h-5 w-5 ${iconClassName}`} aria-hidden="true" />
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {step.stepType.charAt(0).toUpperCase() + step.stepType.slice(1)}
                        {step.connectorType && (
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            ({step.connectorType})
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {step.message}
                      </p>

                      {/* Metrics */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {step.durationMs !== undefined ? `${step.durationMs}ms` : 'N/A'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {step.messageCount} {step.messageCount === 1 ? 'message' : 'messages'}
                        </span>
                        {step.skipped && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                            Skipped
                          </span>
                        )}
                        {step.metadata && Object.keys(step.metadata).length > 0 && (
                          <span className="text-blue-600 dark:text-blue-400">
                            +{Object.keys(step.metadata).length} metadata
                          </span>
                        )}
                      </div>

                      {/* Error message */}
                      {step.errorMessage && (
                        <div className="mt-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2">
                          <div className="flex items-start">
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                            <p className="ml-2 text-xs text-red-900 dark:text-red-100">
                              {step.errorMessage}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
