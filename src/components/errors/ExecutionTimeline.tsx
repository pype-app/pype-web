'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Circle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { ErrorResponseDto } from '@/types/errors';
import { ErrorDisplay } from './ErrorDisplay';

export interface TimelineStep {
  name: string;
  status: 'success' | 'failed' | 'skipped' | 'pending';
  error?: ErrorResponseDto;
  duration?: number; // in milliseconds
  startedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
}

export interface ExecutionTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    lineColor: 'border-green-300 dark:border-green-700',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    lineColor: 'border-red-300 dark:border-red-700',
  },
  skipped: {
    icon: Circle,
    color: 'text-gray-400 dark:text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    lineColor: 'border-gray-300 dark:border-gray-700',
  },
  pending: {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400 animate-pulse',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    lineColor: 'border-blue-300 dark:border-blue-700',
  },
};

/**
 * Timeline component for visualizing pipeline execution steps.
 * Follows IMP-011 Architecture specification section 2.5.
 * 
 * Features:
 * - Visual status indicators (success, failed, skipped, pending)
 * - Expandable error details on failed steps
 * - Duration display
 * - Timeline vertical line connecting steps
 */
export function ExecutionTimeline({ steps, className = '' }: ExecutionTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatDuration = (ms?: number): string => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {steps.map((step, index) => {
        const config = STATUS_CONFIG[step.status];
        const Icon = config.icon;
        const isExpanded = expandedSteps.has(index);
        const hasError = step.status === 'failed' && step.error;

        return (
          <div key={index} className="relative">
            {/* Timeline vertical line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-4 top-10 bottom-0 w-0.5 border-l-2 ${config.lineColor}`}
                aria-hidden="true"
              />
            )}

            {/* Step card */}
            <div
              className={`relative flex items-start gap-3 p-3 rounded-lg border ${config.bgColor} ${config.lineColor} transition-all ${
                hasError ? 'cursor-pointer hover:shadow-md' : ''
              }`}
              onClick={hasError ? () => toggleStep(index) : undefined}
              role={hasError ? 'button' : undefined}
              aria-expanded={hasError ? isExpanded : undefined}
            >
              {/* Status icon */}
              <div className={`flex-shrink-0 ${config.color}`}>
                <Icon className="w-6 h-6" aria-hidden="true" />
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {step.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    {step.duration && (
                      <span className="font-mono">{formatDuration(step.duration)}</span>
                    )}
                    {hasError && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                {step.startedAt && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Started: {new Date(step.startedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Expandable error details */}
            {hasError && isExpanded && step.error && (
              <div className="ml-9 mt-2">
                <ErrorDisplay
                  error={step.error}
                  variant="inline"
                  className="shadow-sm"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
