'use client'

import { Fragment } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react'
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'
import type { DryRunResult, DryRunStatus } from '@/types/dry-run'
import { StepTimeline } from './StepTimeline'
import { SampleDataViewer } from './SampleDataViewer'

interface DryRunResultModalProps {
  isOpen: boolean
  onClose: () => void
  result: DryRunResult | null
  status?: DryRunStatus | null
  pipelineName?: string
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Modal for displaying comprehensive dry-run results
 * 
 * Features:
 * - Overall execution summary
 * - Step-by-step timeline with status
 * - Sample data viewer for each step
 * - Performance metrics
 * - Error details (if failed)
 */
export function DryRunResultModal({
  isOpen,
  onClose,
  result,
  status,
  pipelineName,
}: DryRunResultModalProps) {
  // Show loading state if no result yet but we have a status
  const isLoading = !result && (status === 'pending' || status === 'running')
  
  // If modal is open but we have neither result nor status, don't render
  if (!result && !status) {
    return null
  }

  const formatDuration = (ms: number | undefined) => {
    if (ms === undefined) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        isLoading
                          ? 'bg-blue-100 dark:bg-blue-900/50'
                          : result?.success 
                          ? 'bg-green-100 dark:bg-green-900/50' 
                          : 'bg-red-100 dark:bg-red-900/50'
                      }`}>
                        {isLoading ? (
                          <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                        ) : result?.success ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                          {isLoading ? 'Dry-Run in Progress' : 'Dry-Run Results'}
                        </Dialog.Title>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {pipelineName || result?.pipelineName}{result?.version && ` (v${result.version})`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                      <dd className="mt-1 flex items-center gap-2">
                        {isLoading ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                            {status === 'pending' ? 'Pending' : 'Running'}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            result?.success
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                          }`}>
                            {result?.success ? 'Success' : 'Failed'}
                          </span>
                        )}
                      </dd>
                    </div>

                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</dt>
                      <dd className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        {isLoading ? (
                          <span className="text-gray-500 dark:text-gray-400">In progress...</span>
                        ) : (
                          formatDuration(result?.durationMs)
                        )}
                      </dd>
                    </div>

                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sample Messages</dt>
                      <dd className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <BeakerIcon className="h-4 w-4 text-gray-400" />
                        {isLoading ? (
                          <span className="text-gray-500 dark:text-gray-400">Waiting...</span>
                        ) : (
                          result?.totalSampleMessages || 0
                        )}
                      </dd>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {isLoading ? (
                      <span>Execution started • Waiting for results...</span>
                    ) : (
                      <>
                        Started: {formatDateTime(result!.startedAt)}
                        {result!.completedAt && ` • Completed: ${formatDateTime(result!.completedAt)}`}
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 py-5 sm:p-6">
                  {isLoading ? (
                    /* Loading State */
                    <div className="text-center py-12">
                      <ClockIcon className="mx-auto h-12 w-12 text-blue-500 dark:text-blue-400 animate-pulse" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        {status === 'pending' ? 'Dry-run queued for execution' : 'Executing pipeline steps...'}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {status === 'pending' 
                          ? 'Your test run has been sent to the executor. Waiting to start...'
                          : 'The pipeline is currently executing. Results will appear here in real-time.'}
                      </p>
                      <div className="mt-6">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Results State */
                    <Tab.Group>
                    <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
                      <Tab
                        className={({ selected }) =>
                          classNames(
                            'w-full rounded-md py-2.5 text-sm font-medium leading-5',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                            selected
                              ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-100'
                          )
                        }
                      >
                        Timeline
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          classNames(
                            'w-full rounded-md py-2.5 text-sm font-medium leading-5',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                            selected
                              ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-100'
                          )
                        }
                      >
                        Sample Data
                      </Tab>
                      {result && !result.success && (
                        <Tab
                          className={({ selected }) =>
                            classNames(
                              'w-full rounded-md py-2.5 text-sm font-medium leading-5',
                              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                              selected
                                ? 'bg-white dark:bg-gray-800 text-red-700 dark:text-red-400 shadow'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-100'
                            )
                          }
                        >
                          Error Details
                        </Tab>
                      )}
                    </Tab.List>
                    <Tab.Panels className="mt-4">
                      {/* Timeline Panel */}
                      <Tab.Panel className="rounded-lg bg-white dark:bg-gray-800 p-4">
                        <StepTimeline steps={result!.steps} />
                      </Tab.Panel>

                      {/* Sample Data Panel */}
                      <Tab.Panel className="rounded-lg bg-white dark:bg-gray-800 p-4">
                        <div className="space-y-4">
                          {result!.steps.map((step, index) => (
                            step.sampleData && step.sampleData.length > 0 && (
                              <SampleDataViewer
                                key={index}
                                data={step.sampleData}
                                stepName={step.stepType}
                              />
                            )
                          ))}
                          {result!.steps.every(s => !s.sampleData || s.sampleData.length === 0) && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                              No sample data available from any step
                            </p>
                          )}
                        </div>
                      </Tab.Panel>

                      {/* Error Details Panel */}
                      {!result!.success && (
                        <Tab.Panel className="rounded-lg bg-white dark:bg-gray-800 p-4">
                          <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                            <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                              Error Message
                            </h4>
                            <p className="text-sm text-red-800 dark:text-red-200">
                              {result!.errorMessage || 'Unknown error occurred'}
                            </p>
                            {result!.errorStackTrace && (
                              <details className="mt-3">
                                <summary className="text-sm font-medium text-red-900 dark:text-red-100 cursor-pointer">
                                  Stack Trace
                                </summary>
                                <pre className="mt-2 text-xs overflow-x-auto p-3 bg-white dark:bg-black rounded border border-red-200 dark:border-red-800">
                                  <code className="text-red-800 dark:text-red-200">
                                    {result!.errorStackTrace}
                                  </code>
                                </pre>
                              </details>
                            )}
                          </div>
                        </Tab.Panel>
                      )}
                    </Tab.Panels>
                  </Tab.Group>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 dark:bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-400 sm:ml-3 sm:w-auto"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
