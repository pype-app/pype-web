import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  PlayIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EllipsisHorizontalIcon,
  PauseIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { PipelineListItem } from '@/services/pipelineService';
import { formatDistanceToNow } from 'date-fns';
import { cronToHuman } from '@/utils/cronUtils';

interface PipelineTableProps {
  pipelines: PipelineListItem[];
  loading?: boolean;
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
  onView?: (pipeline: PipelineListItem) => void;
  onEdit?: (pipeline: PipelineListItem) => void;
  onRun?: (pipeline: PipelineListItem) => void;
  onSuspend?: (pipeline: PipelineListItem) => void;
  onResume?: (pipeline: PipelineListItem) => void;
  onDelete?: (pipeline: PipelineListItem) => void;
  onDuplicate?: (pipeline: PipelineListItem) => void;
  onExport?: (pipeline: PipelineListItem) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Quick actions - visible */}
      {pipeline.isActive && onRun && (
        <button
          onClick={() => onRun(pipeline)}
          className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/50 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30 hover:bg-green-100 dark:hover:bg-green-900/70"
        >
          <PlayIcon className="h-3 w-3 mr-1" />
          Run
        </button>
      )}

      {onView && (
        <button
          onClick={() => onView(pipeline)}
          className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-600/20 dark:ring-gray-400/30 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <EyeIcon className="h-3 w-3 mr-1" />
          View
        </button>
      )}

      {/* More actions - dropdown */}
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
          <EllipsisHorizontalIcon className="h-3 w-3" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="dropdown-menu"
            style={{
              position: 'absolute',
              right: 0,
              zIndex: 1000,
              marginTop: '0.5rem',
              width: '12rem',
              transformOrigin: 'top right',
            }}
          >
            {onEdit && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onEdit(pipeline)}
                    className={classNames(
                      active ? 'bg-gray-100 dark:bg-gray-700' : '',
                      'dropdown-item flex w-full'
                    )}
                  >
                    <PencilIcon className="mr-3 h-4 w-4" />
                    Edit
                  </button>
                )}
              </Menu.Item>
            )}

            {pipeline.isActive ? (
              onSuspend && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onSuspend(pipeline)}
                      className={classNames(
                        active ? 'bg-gray-100 dark:bg-gray-700' : '',
                        'dropdown-item flex w-full'
                      )}
                    >
                      <PauseIcon className="mr-3 h-4 w-4" />
                      Suspend
                    </button>
                  )}
                </Menu.Item>
              )
            ) : (
              onResume && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onResume(pipeline)}
                      className={classNames(
                        active ? 'bg-gray-100 dark:bg-gray-700' : '',
                        'dropdown-item flex w-full'
                      )}
                    >
                      <PlayIcon className="mr-3 h-4 w-4" />
                      Resume
                    </button>
                  )}
                </Menu.Item>
              )
            )}

            {onDuplicate && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onDuplicate(pipeline)}
                    className={classNames(
                      active ? 'bg-gray-100 dark:bg-gray-700' : '',
                      'dropdown-item flex w-full'
                    )}
                  >
                    <DocumentDuplicateIcon className="mr-3 h-4 w-4" />
                    Duplicate
                  </button>
                )}
              </Menu.Item>
            )}

            {onExport && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onExport(pipeline)}
                    className={classNames(
                      active ? 'bg-gray-100 dark:bg-gray-700' : '',
                      'dropdown-item flex w-full'
                    )}
                  >
                    <ArrowDownTrayIcon className="mr-3 h-4 w-4" />
                    Export
                  </button>
                )}
              </Menu.Item>
            )}

            {onDelete && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onDelete(pipeline)}
                    className={classNames(
                      active ? 'bg-red-50 dark:bg-red-900/50' : '',
                      'flex w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50'
                    )}
                  >
                    <TrashIcon className="mr-3 h-4 w-4" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            )}
          </Menu.Items>
        </Transition>
      </Menu>
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
    <div className="table-card" style={{ overflow: 'visible' }}>
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {pipelines.map((pipeline) => (
          <li key={pipeline.id} className="table-row relative">
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <StatusBadge isActive={pipeline.isActive} />
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-primary truncate">
                        {pipeline.name}
                      </h3>
                      <span className="ml-2 text-sm text-muted">
                        v{pipeline.version}
                      </span>
                    </div>
                    {pipeline.description && (
                      <p className="text-sm text-muted mt-1 line-clamp-2">
                        {pipeline.description}
                      </p>
                    )}
                    <PipelineTags tags={pipeline.tags} />
                  </div>
                </div>
                
                <div className="flex-shrink-0 relative z-10">
                  <PipelineActions
                    pipeline={pipeline}
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
                  <dt className="text-sm font-medium text-muted">Created</dt>
                  <dd className="mt-1 text-sm text-primary">
                    {formatDistanceToNow(new Date(pipeline.createdAt), { addSuffix: true })}
                  </dd>
                </div>
                {pipeline.updatedAt && (
                  <div>
                    <dt className="text-sm font-medium text-muted">Last Updated</dt>
                    <dd className="mt-1 text-sm text-primary">
                      {formatDistanceToNow(new Date(pipeline.updatedAt), { addSuffix: true })}
                    </dd>
                  </div>
                )}
                {pipeline.lastExecutedAt && (
                  <div>
                    <dt className="text-sm font-medium text-muted">Last Execution</dt>
                    <dd className="mt-1 text-sm text-primary">
                      {formatDistanceToNow(new Date(pipeline.lastExecutedAt), { addSuffix: true })}
                    </dd>
                  </div>
                )}
                {!pipeline.lastExecutedAt && (
                  <div>
                    <dt className="text-sm font-medium text-muted">Last Execution</dt>
                    <dd className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Never
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted">Schedule</dt>
                  <dd className="mt-1 text-sm text-primary">
                    {cronToHuman(pipeline.cronExpression || '')}
                  </dd>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}