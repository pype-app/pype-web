'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'
import type { EnrichedValidationError } from '@/types/errors'

interface ValidationErrorModalProps {
  isOpen: boolean
  onClose: () => void
  errors: EnrichedValidationError[]
  title?: string
}

/**
 * Modal to display enriched YAML validation errors
 * BUG-001: Shows messages in English, snippets, line/column, and suggestions
 */
export function ValidationErrorModal({
  isOpen,
  onClose,
  errors,
  title = 'Pipeline Validation Errors',
}: ValidationErrorModalProps) {
  if (!errors || errors.length === 0) {
    return null
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                          {title}
                        </Dialog.Title>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {errors.length} {errors.length === 1 ? 'error found' : 'errors found'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={onClose}
                    >
                      <span className="sr-only">Fechar</span>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Error List */}
                <div className="px-4 py-5 sm:p-6 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-6">
                    {errors.map((error, index) => (
                      <div
                        key={index}
                        className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10"
                      >
                        {/* Error Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                              {error.message}
                            </h3>
                            {error.path && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                                Path: <code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded">{error.path}</code>
                              </p>
                            )}
                            {(error.line !== null || error.column !== null) && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                                Location: Line {error.line ?? '?'}, Column {error.column ?? '?'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* YAML Snippet */}
                        {error.yamlSnippet && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <CodeBracketIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Code snippet:
                              </span>
                            </div>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto whitespace-pre font-mono">
                              {error.yamlSnippet}
                            </pre>
                          </div>
                        )}

                        {/* Suggestion */}
                        {error.suggestion && (
                          <div className="mt-3 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                            <LightBulbIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Suggestion:
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                {error.suggestion}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Expected Type */}
                        {error.expectedType && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Expected type: <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">{error.expectedType}</code>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={onClose}
                  >
                    Close and Fix
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
