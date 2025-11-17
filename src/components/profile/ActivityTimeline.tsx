'use client';

import { 
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  PhotoIcon,
  KeyIcon,
  PencilIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  PlusCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export interface TimelineEvent {
  id: string;
  type: 'account_created' | 'login' | 'profile_updated' | 'password_changed' | 'photo_uploaded' | 'email_confirmed' | 'pipeline_created' | 'pipeline_started' | 'pipeline_paused' | 'pipeline_deleted';
  title: string;
  description?: string;
  timestamp: Date;
  icon?: React.ReactNode;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

const getEventIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'account_created':
      return <UserPlusIcon className="h-5 w-5" />;
    case 'login':
      return <ArrowRightOnRectangleIcon className="h-5 w-5" />;
    case 'profile_updated':
      return <PencilIcon className="h-5 w-5" />;
    case 'password_changed':
      return <KeyIcon className="h-5 w-5" />;
    case 'photo_uploaded':
      return <PhotoIcon className="h-5 w-5" />;
    case 'email_confirmed':
      return <CheckCircleIcon className="h-5 w-5" />;
    case 'pipeline_created':
      return <PlusCircleIcon className="h-5 w-5" />;
    case 'pipeline_started':
      return <PlayIcon className="h-5 w-5" />;
    case 'pipeline_paused':
      return <PauseIcon className="h-5 w-5" />;
    case 'pipeline_deleted':
      return <TrashIcon className="h-5 w-5" />;
    default:
      return <CheckCircleIcon className="h-5 w-5" />;
  }
};

const getEventColor = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'account_created':
      return 'bg-purple-500 dark:bg-purple-600';
    case 'login':
      return 'bg-blue-500 dark:bg-blue-600';
    case 'profile_updated':
      return 'bg-green-500 dark:bg-green-600';
    case 'password_changed':
      return 'bg-orange-500 dark:bg-orange-600';
    case 'photo_uploaded':
      return 'bg-pink-500 dark:bg-pink-600';
    case 'email_confirmed':
      return 'bg-teal-500 dark:bg-teal-600';
    case 'pipeline_created':
      return 'bg-indigo-500 dark:bg-indigo-600';
    case 'pipeline_started':
      return 'bg-emerald-500 dark:bg-emerald-600';
    case 'pipeline_paused':
      return 'bg-yellow-500 dark:bg-yellow-600';
    case 'pipeline_deleted':
      return 'bg-red-500 dark:bg-red-600';
    default:
      return 'bg-gray-500 dark:bg-gray-600';
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div>
                  <div className={`relative px-1 flex h-10 w-10 items-center justify-center rounded-full ${getEventColor(event.type)} text-white`}>
                    {event.icon || getEventIcon(event.type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                  {event.description && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <p>{event.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
