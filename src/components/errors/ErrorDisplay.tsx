'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ErrorResponseDto } from '@/types/errors';
import { cn } from '@/lib/utils';

/**
 * Sanitizes text to prevent XSS attacks.
 * Removes HTML tags and dangerous characters.
 */
const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  return text.replace(/[<>"'&]/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '&': '&amp;',
    };
    return entities[char] || char;
  });
};

/**
 * Validates if URL is safe to open (prevents javascript:, data:, etc.)
 */
const isSafeUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith('https://') || trimmed.startsWith('http://');
};

export interface ErrorDisplayProps {
  error: ErrorResponseDto;
  onApplySuggestion?: (suggestion: string) => void;
  onClose?: () => void;
  variant?: 'toast' | 'inline';
  className?: string;
}

const ERROR_ICONS = {
  CONNECTOR_NOT_FOUND: AlertTriangle,
  INVALID_CONFIGURATION: XCircle,
  AUTH_PROFILE_NOT_FOUND: AlertCircle,
  PIPELINE_RUNTIME_ERROR: XCircle,
  INTERNAL_SERVER_ERROR: XCircle,
} as const;

const ERROR_COLORS = {
  400: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  401: 'bg-red-50 border-red-200 text-red-900',
  403: 'bg-red-50 border-red-200 text-red-900',
  404: 'bg-blue-50 border-blue-200 text-blue-900',
  429: 'bg-orange-50 border-orange-200 text-orange-900',
  500: 'bg-red-50 border-red-200 text-red-900',
} as const;

export function ErrorDisplay({
  error,
  onApplySuggestion,
  onClose,
  variant = 'inline',
  className,
}: ErrorDisplayProps) {
  const Icon = ERROR_ICONS[error.code as keyof typeof ERROR_ICONS] || AlertCircle;
  const colorClass = ERROR_COLORS[error.status as keyof typeof ERROR_COLORS] || ERROR_COLORS[500];

  // Extract suggestion from first item if available
  const primarySuggestion = error.suggestions?.[0]?.match(/'([^']+)'/)?.[1];

  return (
    <Alert className={cn(colorClass, 'relative', className)}>
      <Icon className="h-5 w-5" />
      <AlertTitle className="flex items-center justify-between">
        {error.title}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">{error.detail}</p>

        {/* Suggestions */}
        {error.suggestions && error.suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">💡 Suggestions:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {error.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Available connectors/profiles */}
        {error.context?.availableConnectors && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">📚 Available connectors:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {error.context.availableConnectors.map((connector: any, idx: number) => (
                <li key={idx}>
                  <code className="bg-black/10 px-1 rounded">{sanitizeText(connector.type || '')}</code> - {sanitizeText(connector.name || '')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error.context?.availableProfiles && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">🔑 Available auth profiles:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {error.context.availableProfiles.map((profile: string, idx: number) => (
                <li key={idx}>
                  <code className="bg-black/10 px-1 rounded">{sanitizeText(profile)}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trace ID */}
        {error.traceId && (
          <div className="text-xs text-muted-foreground">
            Trace ID:{' '}
            <code
              className="bg-black/10 px-1 rounded cursor-pointer hover:bg-black/20"
              onClick={() => navigator.clipboard.writeText(error.traceId!)}
              title="Click to copy"
            >
              {error.traceId}
            </code>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {error.documentationUrl && isSafeUrl(error.documentationUrl) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(error.documentationUrl, '_blank', 'noopener,noreferrer')}
            >
              📖 View Documentation
            </Button>
          )}

          {primarySuggestion && onApplySuggestion && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onApplySuggestion(primarySuggestion)}
            >
              ✨ Apply Suggestion: {primarySuggestion}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
