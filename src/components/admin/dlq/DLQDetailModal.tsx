'use client';

import { Fragment } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { DLQItem } from '@/services/dlq.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DLQDetailModalProps {
  item: DLQItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

export function DLQDetailModal({ item, isOpen, onClose }: DLQDetailModalProps) {
  if (!item) return null;

  const renderJSON = (jsonString?: string) => {
    if (!jsonString) return <p className="text-gray-500 dark:text-gray-400">N/A</p>;
    
    try {
      const parsed = JSON.parse(jsonString);
      return (
        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return (
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-900 dark:text-gray-100">
          {jsonString}
        </pre>
      );
    }
  };

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
          <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                {/* Header */}
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start mb-4">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      DLQ Item Details
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        item.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                        item.status === 'Failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                      }`}>
                        {item.status}
                      </span>
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.pipelineName} / {item.stepName || 'Unknown Step'}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <Tab.Group>
                  <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-md py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-100'
                        )
                      }
                    >
                      Overview
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-md py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-100'
                        )
                      }
                    >
                      Error Details
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-md py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-100'
                        )
                      }
                    >
                      Failed Message
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-4">
                    <Tab.Panel className="rounded-lg bg-white dark:bg-gray-800 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InfoField label="Execution ID" value={item.executionId} />
                        <InfoField label="Connector Type" value={item.connectorType} />
                        <InfoField label="Retry Count" value={item.retryCount.toString()} />
                        <InfoField label="Status" value={item.status} />
                        <InfoField 
                          label="Failed At" 
                          value={format(new Date(item.failedAt), "PPpp", { locale: ptBR })} 
                        />
                        {item.resolvedAt && (
                          <InfoField 
                            label="Resolved At" 
                            value={format(new Date(item.resolvedAt), "PPpp", { locale: ptBR })} 
                          />
                        )}
                      </div>
                    </Tab.Panel>
                    <Tab.Panel className="rounded-lg bg-white dark:bg-gray-800 p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Error Message</label>
                          <p className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-900 dark:text-red-200">
                            {item.errorMessage}
                          </p>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          ⚠️ Stack trace not available (removed for security - OWASP A04 compliance)
                        </div>
                      </div>
                    </Tab.Panel>
                    <Tab.Panel className="rounded-lg bg-white dark:bg-gray-800 p-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Failed Message Payload
                        </label>
                        {item.failedMessage ? (
                          <>
                            {renderJSON(item.failedMessage)}
                            {item.failedMessage.includes('truncated for security') && (
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                ⚠️ Message truncated to 500 chars for security (PII protection)
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No message data available</p>
                        )}
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
