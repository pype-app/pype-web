'use client';

import { DLQItem } from '@/services/dlq.service';
import { ArrowPathIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DLQItemsTableProps {
  items: DLQItem[];
  onRetry: (id: string) => void;
  onDiscard: (id: string) => void;
  onViewDetails: (item: DLQItem) => void;
  isLoading?: boolean;
}

function StatusBadge({ status }: { status: DLQItem['status'] }) {
  const styles = {
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    Retrying: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    Success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Failed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    Discarded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function RetryCountBadge({ count }: { count: number }) {
  const isDanger = count > 3;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
      isDanger 
        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' 
        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
    }`}>
      {count}
    </span>
  );
}

export function DLQItemsTable({ items, onRetry, onDiscard, onViewDetails, isLoading }: DLQItemsTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">Nenhum item na Dead Letter Queue</p>
        <p className="text-sm mt-2">Ótimo! Não há mensagens com falha no momento.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pipeline
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Step
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Connector
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Error
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Retries
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Failed At
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.pipelineName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {item.stepName || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {item.connectorType}
                </code>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={item.errorMessage}>
                {item.errorMessage}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <RetryCountBadge count={item.retryCount} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(item.failedAt), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onViewDetails(item)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    title="Ver detalhes"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  
                  {(item.status === 'Pending' || item.status === 'Failed') && (
                    <button
                      onClick={() => onRetry(item.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                      title="Tentar novamente"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                  )}
                  
                  {item.status !== 'Success' && item.status !== 'Discarded' && (
                    <button
                      onClick={() => onDiscard(item.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                      title="Descartar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
      ))}
    </div>
  );
}
