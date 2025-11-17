import { 
  PlayIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PauseIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { PipelineListItem } from '@/services/pipelineService';
import { formatDistanceToNow } from 'date-fns';
import { cronToHuman } from '@/utils/cronUtils';

interface PipelineTableProps {
  pipelines: PipelineListItem[];
  loading?: boolean;
  currentUserId?: string;
  onView?: (pipeline: PipelineListItem) => void;
  onEdit?: (pipeline: PipelineListItem) => void;
  onRun?: (pipeline: PipelineListItem) => void;
  onSuspend?: (pipeline: PipelineListItem) => void;
  onResume?: (pipeline: PipelineListItem) => void;
  onDelete?: (pipeline: PipelineListItem) => void;
  onDuplicate?: (pipeline: PipelineListItem) => void;
  onExport?: (pipeline: PipelineListItem) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={classNames(
      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
      isActive 
        ? 'badge-green' 
        : 'badge-gray'
    )}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function PipelineActions({ 
  pipeline,
  currentUserId,
  onView, 
  onEdit, 
  onRun, 
  onSuspend, 
  onResume, 
  onDelete, 
  onDuplicate, 
  onExport 
}: {
  pipeline: PipelineListItem;
  currentUserId?: string;
  onView?: (pipeline: PipelineListItem) => void;
  onEdit?: (pipeline: PipelineListItem) => void;
  onRun?: (pipeline: PipelineListItem) => void;
  onSuspend?: (pipeline: PipelineListItem) => void;
  onResume?: (pipeline: PipelineListItem) => void;
  onDelete?: (pipeline: PipelineListItem) => void;
  onDuplicate?: (pipeline: PipelineListItem) => void;
  onExport?: (pipeline: PipelineListItem) => void;
}) {
  // Check if current user owns this pipeline
  const isOwner = !pipeline.createdByUserId || pipeline.createdByUserId === currentUserId;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* View button */}
      {onView && (
        <button
          onClick={() => onView(pipeline)}
          className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-600/20 dark:ring-gray-400/30 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <EyeIcon className="h-3 w-3 mr-1" />
          View
        </button>
      )}

      {/* Run button - for active pipelines */}
      {pipeline.isActive && onRun && (
        <button
          onClick={() => onRun(pipeline)}
          className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/20 hover:bg-green-100 dark:hover:bg-green-900/30"
        >
          <PlayIcon className="h-3 w-3 mr-1" />
          Run
        </button>
      )}

      {/* Edit button - only for owner */}
      {isOwner && onEdit && (
        <button
          onClick={() => onEdit(pipeline)}
          className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
        >
          <PencilIcon className="h-3 w-3 mr-1" />
          Edit
        </button>
      )}

      {/* Suspend/Resume - available for all admins */}
      {pipeline.isActive ? (
        onSuspend && (
          <button
            onClick={() => onSuspend(pipeline)}
            className="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-400/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
          >
            <PauseIcon className="h-3 w-3 mr-1" />
            Suspend
          </button>
        )
      ) : (
        onResume && (
          <button
            onClick={() => onResume(pipeline)}
            className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/20 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            <PlayIcon className="h-3 w-3 mr-1" />
            Resume
          </button>
        )
      )}

      {/* Duplicate - available for all */}
      {onDuplicate && (
        <button
          onClick={() => onDuplicate(pipeline)}
          className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-900/20 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-400 ring-1 ring-inset ring-purple-600/20 dark:ring-purple-400/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <DocumentDuplicateIcon className="h-3 w-3 mr-1" />
          Duplicate
        </button>
      )}

      {/* Delete - only for owner */}
      {isOwner && onDelete && (
        <button
          onClick={() => onDelete(pipeline)}
          className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-400/20 hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <TrashIcon className="h-3 w-3 mr-1" />
          Delete
        </button>
      )}
    </div>
  );
}

function PipelineTags({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tags.slice(0, 3).map((tag) => (
        <span
          key={tag}
          className="badge-blue inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30"
        >
          {tag}
        </span>
      ))}
      {tags.length > 3 && (
        <span className="badge-gray inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
          +{tags.length - 3} more
        </span>
      )}
    </div>
  );
}

export default function PipelineTable({
  pipelines,
  loading = false,
  currentUserId,
  onView,
  onEdit,
  onRun,
  onSuspend,
  onResume,
  onDelete,
  onDuplicate,
  onExport,
}: PipelineTableProps) {
  if (loading) {
    return (
      <div className="table-card">
        <div className="px-6 py-4">
          <div className="animate-pulse">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pipelines.length === 0) {
    return (
      <div className="table-card">
        <div className="px-6 py-12 text-center">
          <div className="text-muted">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-primary">No pipelines</h3>
            <p className="mt-1 text-sm text-muted">
              Get started by creating your first pipeline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop view */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
          {pipelines.map((pipeline) => (
            <li key={pipeline.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <StatusBadge isActive={pipeline.isActive} />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {pipeline.name}
                        </h3>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          v{pipeline.version}
                        </span>
                      </div>
                      {pipeline.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {pipeline.description}
                        </p>
                      )}
                      <PipelineTags tags={pipeline.tags} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <PipelineActions
                      pipeline={pipeline}
                      currentUserId={currentUserId}
                      onView={onView}
                      onEdit={onEdit}
                      onRun={onRun}
                      onSuspend={onSuspend}
                      onResume={onResume}
                      onDelete={onDelete}
                      onDuplicate={onDuplicate}
                      onExport={onExport}
                    />
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDistanceToNow(new Date(pipeline.createdAt), { addSuffix: true })}
                    </dd>
                  </div>
                  {pipeline.updatedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDistanceToNow(new Date(pipeline.updatedAt), { addSuffix: true })}
                      </dd>
                    </div>
                  )}
                  {pipeline.lastExecutedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Execution</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDistanceToNow(new Date(pipeline.lastExecutedAt), { addSuffix: true })}
                      </dd>
                    </div>
                  )}
                  {!pipeline.lastExecutedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Execution</dt>
                      <dd className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Never
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Schedule</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {cronToHuman(pipeline.cronExpression || '')}
                    </dd>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden space-y-4">
        {pipelines.map((pipeline) => (
          <div key={pipeline.id} className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge isActive={pipeline.isActive} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">v{pipeline.version}</span>
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                  {pipeline.name}
                </h3>
                {pipeline.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {pipeline.description}
                  </p>
                )}
                <PipelineTags tags={pipeline.tags} />
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDistanceToNow(new Date(pipeline.createdAt), { addSuffix: true })}
                </span>
              </div>
              {pipeline.lastExecutedAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Last Execution</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDistanceToNow(new Date(pipeline.lastExecutedAt), { addSuffix: true })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Schedule</span>
                <span className="text-gray-900 dark:text-white">
                  {cronToHuman(pipeline.cronExpression || '')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PipelineActions
                pipeline={pipeline}
                currentUserId={currentUserId}
                onView={onView}
                onEdit={onEdit}
                onRun={onRun}
                onSuspend={onSuspend}
                onResume={onResume}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onExport={onExport}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}