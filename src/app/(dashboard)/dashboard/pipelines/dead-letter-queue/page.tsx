'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { dlqService, DLQItem, DLQStats } from '@/services/dlq.service';
import { DLQStatsCards } from '@/components/admin/dlq/DLQStatsCards';
import { DLQItemsTable } from '@/components/admin/dlq/DLQItemsTable';
import { DLQFilters, DLQFiltersState } from '@/components/admin/dlq/DLQFilters';
import { DLQDetailModal } from '@/components/admin/dlq/DLQDetailModal';
import { Button } from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function DeadLetterQueuePage() {
  // State
  const [items, setItems] = useState<DLQItem[]>([]);
  const [stats, setStats] = useState<DLQStats | null>(null);
  const [filters, setFilters] = useState<DLQFiltersState>({ limit: 100 });
  const [selectedItem, setSelectedItem] = useState<DLQItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Confirmation dialogs
  const [retryConfirm, setRetryConfirm] = useState<{ id: string; name: string } | null>(null);
  const [discardConfirm, setDiscardConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsData, statsData] = await Promise.all([
        dlqService.getItems(filters),
        dlqService.getStats(filters.executionId)
      ]);
      setItems(itemsData.items);
      setStats(statsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error loading DLQ data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Actions
  const handleRetryConfirm = async () => {
    if (!retryConfirm) return;
    
    setIsRetrying(true);
    try {
      const result = await dlqService.retry(retryConfirm.id);
      toast.success(`Retry enqueued! Job ID: ${result.jobId}. Status: ${result.newStatus}`);
      await fetchData(); // Refresh
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Retry failed: ${errorMessage}`);
    } finally {
      setIsRetrying(false);
      setRetryConfirm(null);
    }
  };

  const handleDiscardConfirm = async () => {
    if (!discardConfirm) return;
    
    setIsDiscarding(true);
    try {
      await dlqService.discard(discardConfirm.id);
      toast.success('Item discarded successfully');
      await fetchData(); // Refresh
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Discard failed: ${errorMessage}`);
    } finally {
      setIsDiscarding(false);
      setDiscardConfirm(null);
    }
  };

  const handleViewDetails = (item: DLQItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleRetryClick = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setRetryConfirm({ id, name: `${item.pipelineName} / ${item.stepName || 'Unknown'}` });
    }
  };

  const handleDiscardClick = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setDiscardConfirm({ id, name: `${item.pipelineName} / ${item.stepName || 'Unknown'}` });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dead Letter Queue</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage failed pipeline messages and retry operations
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="md" disabled={isLoading}>
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && <DLQStatsCards stats={stats} isLoading={isLoading} />}

      {/* Filters */}
      <DLQFilters onFilterChange={setFilters} initialFilters={filters} />

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <DLQItemsTable
          items={items}
          onRetry={handleRetryClick}
          onDiscard={handleDiscardClick}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
        />
      </div>

      {/* Detail Modal */}
      <DLQDetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
        }}
      />

      {/* Retry Confirmation */}
      <ConfirmationModal
        isOpen={!!retryConfirm}
        onClose={() => setRetryConfirm(null)}
        onConfirm={handleRetryConfirm}
        title="Confirm Retry"
        message={`Are you sure you want to retry this DLQ item (${retryConfirm?.name})? This will enqueue a background job to re-execute the failed message through the sink connector.`}
        confirmLabel="Retry"
        cancelLabel="Cancel"
        variant="info"
        loading={isRetrying}
      />

      {/* Discard Confirmation */}
      <ConfirmationModal
        isOpen={!!discardConfirm}
        onClose={() => setDiscardConfirm(null)}
        onConfirm={handleDiscardConfirm}
        title="Confirm Discard"
        message={`Are you sure you want to discard this DLQ item (${discardConfirm?.name})? This action will mark it as permanently discarded and it will not be retried automatically.`}
        confirmLabel="Discard"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDiscarding}
      />
    </div>
  );
}
