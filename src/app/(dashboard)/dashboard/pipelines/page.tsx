'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

import { usePipelines } from '@/hooks/usePipelines';
import { useConfirmationModal } from '@/hooks/useConfirmationModal';
import { useAuthStore } from '@/store/auth';
import PipelineTable from '@/components/pipelines/PipelineTable';
import PipelineFilters from '@/components/pipelines/PipelineFilters';
import Pagination from '@/components/ui/Pagination';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { PipelineListItem } from '@/services/pipelineService';

export default function PipelinesPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {
    pipelines,
    loading,
    isRefreshing,
    error,
    pagination,
    filters,
    actions: {
      setFilters,
      setPage,
      setPageSize,
      runPipeline,
      suspendPipeline,
      resumePipeline,
      deletePipeline,
      refreshPipelines,
    },
  } = usePipelines();

  const {
    isOpen: isConfirmOpen,
    loading: isDeleting,
    options: confirmOptions,
    showConfirmation,
    hideConfirmation,
    confirmAction,
  } = useConfirmationModal();

  const handleView = (pipeline: PipelineListItem) => {
    router.push(`/dashboard/pipelines/${pipeline.id}`);
  };

  const handleEdit = (pipeline: PipelineListItem) => {
    router.push(`/dashboard/pipelines/${pipeline.id}/edit`);
  };

  const handleDelete = (pipeline: PipelineListItem) => {
    showConfirmation(
      {
        title: 'Delete Pipeline',
        message: `Are you sure you want to delete "${pipeline.name}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'danger',
      },
      () => deletePipeline(pipeline.id)
    );
  };

  const handleDuplicate = async (pipeline: PipelineListItem) => {
    try {
      // For now, navigate to create page with the pipeline data
      // Later we can implement actual duplication
      router.push(`/dashboard/pipelines/create?duplicate=${pipeline.id}`);
    } catch (error) {
      toast.error('Failed to duplicate pipeline');
    }
  };

  const handleExport = async (pipeline: PipelineListItem) => {
    try {
      // For now, show a toast - implement actual export later
      toast.success(`Exporting ${pipeline.name}...`);
    } catch (error) {
      toast.error('Failed to export pipeline');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Pipelines
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage and monitor your data pipelines
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            onClick={refreshPipelines}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600"
          >
            <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
          <Link
            href="/dashboard/pipelines/new"
            className="inline-flex items-center rounded-md bg-blue-600 dark:bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Create Pipeline
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading pipelines
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={refreshPipelines}
                  className="bg-red-50 text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-50 rounded-md px-3 py-2 text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        <PipelineFilters
          filters={filters}
          onFiltersChange={setFilters}
          loading={loading}
          isRefreshing={isRefreshing}
          // availableTags={[]} // TODO: Load from backend
        />
      </div>

      {/* Pipeline list */}
      <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        <PipelineTable
        pipelines={pipelines}
        loading={loading}
        currentUserId={user?.id}
        onView={handleView}
        onEdit={handleEdit}
        onRun={(pipeline) => runPipeline(pipeline.id)}
        onSuspend={(pipeline) => suspendPipeline(pipeline.id)}
        onResume={(pipeline) => resumePipeline(pipeline.id)}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onExport={handleExport}
      />
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          loading={loading}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={hideConfirmation}
        onConfirm={confirmAction}
        title={confirmOptions?.title || ''}
        message={confirmOptions?.message || ''}
        confirmLabel={confirmOptions?.confirmLabel}
        cancelLabel={confirmOptions?.cancelLabel}
        variant={confirmOptions?.variant}
        loading={isDeleting}
      />
    </div>
  );
}