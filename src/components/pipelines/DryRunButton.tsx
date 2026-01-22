'use client'

import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { BeakerIcon, InformationCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useDryRun } from '@/hooks/useDryRun'
import type { UseDryRunReturn } from '@/hooks/useDryRun'

interface DryRunButtonProps {
  pipelineId: string
  pipelineName: string
  disabled?: boolean
  className?: string
  onDryRunStart?: (dryRunId: string) => void
  /** Optional: Pass an external useDryRun hook state (for shared state scenarios) */
  dryRunState?: UseDryRunReturn
  /** Optional: Custom YAML to use instead of saved pipeline YAML */
  yamlContent?: string
}

/**
 * Button and modal for configuring and starting a pipeline dry-run.
 * 
 * A dry-run simulates pipeline execution without persisting data to the sink,
 * allowing users to test pipelines safely with a limited sample of data.
 */
export function DryRunButton({
  pipelineId,
  pipelineName,
  disabled = false,
  className = '',
  onDryRunStart,
  dryRunState: externalDryRunState,
  yamlContent,
}: DryRunButtonProps) {
  const [open, setOpen] = useState(false)
  const [sampleSize, setSampleSize] = useState(10)
  const [sampleSizeError, setSampleSizeError] = useState<string | null>(null)

  // Use external state if provided, otherwise create internal state
  const internalDryRunState = useDryRun({
    onComplete: () => {
      setOpen(false)
    },
  })

  const dryRunState = externalDryRunState || internalDryRunState
  const { startDryRun, isLoading, error, dryRunId } = dryRunState

  // Trigger callback when dry-run ID is available
  useEffect(() => {
    if (dryRunId && onDryRunStart) {
      onDryRunStart(dryRunId)
    }
  }, [dryRunId, onDryRunStart])

  const handleStart = async () => {
    // Validate sample size
    if (sampleSize < 1 || sampleSize > 1000) {
      setSampleSizeError('Sample size must be between 1 and 1000')
      return
    }

    setSampleSizeError(null)

    try {
      await startDryRun(pipelineId, sampleSize, yamlContent)
      // Close modal immediately after dry-run starts
      setOpen(false)
    } catch (err) {
      // Error already handled by hook
      console.error('Failed to start dry-run:', err)
      // Keep modal open on error so user can retry
    }
  }

  const handleSampleSizeChange = (value: string) => {
    const num = parseInt(value, 10)

    if (value === '' || isNaN(num)) {
      setSampleSize(1)
      return
    }

    // Clamp between 1 and 1000
    if (num < 1) {
      setSampleSize(1)
      setSampleSizeError('Minimum sample size is 1')
    } else if (num > 1000) {
      setSampleSize(1000)
      setSampleSizeError('Maximum sample size is 1000')
    } else {
      setSampleSize(num)
      setSampleSizeError(null)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen)
      // Reset errors when closing
      if (!newOpen) {
        setSampleSizeError(null)
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title="Run pipeline test without writing to sink"
        className={`inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <BeakerIcon className="h-5 w-5" aria-hidden="true" />
        Test Run
      </button>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleOpenChange}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <BeakerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                        Test Run Configuration
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Run a simulation of <strong className="text-gray-900 dark:text-gray-100">{pipelineName}</strong> without
                          writing to the sink. This will execute source and transform steps with a limited sample of data.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sample Size Input */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="sampleSize" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Sample Size
                      </label>
                      <div className="mt-2 flex items-start gap-3">
                        <div className="flex-1">
                          <input
                            type="number"
                            id="sampleSize"
                            min={1}
                            max={1000}
                            value={sampleSize}
                            onChange={(e) => handleSampleSizeChange(e.target.value)}
                            disabled={isLoading}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !isLoading) {
                                handleStart()
                              }
                            }}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          {sampleSizeError && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {sampleSizeError}
                            </p>
                          )}
                        </div>
                        <span className="pt-1.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          messages (1-1000)
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Number of sample messages to process from the source.
                      </p>
                    </div>

                    {/* Info Alert */}
                    <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong className="font-medium">How it works:</strong> Source and transform steps will run normally.
                            The sink step will be simulated (no data will be written).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse gap-3">
                    <button
                      type="button"
                      onClick={handleStart}
                      disabled={isLoading || !!sampleSizeError || sampleSize < 1 || sampleSize > 1000}
                      className="inline-flex w-full justify-center items-center gap-2 rounded-md bg-blue-600 dark:bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Starting...
                        </>
                      ) : (
                        'Start Test Run'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenChange(false)}
                      disabled={isLoading}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
