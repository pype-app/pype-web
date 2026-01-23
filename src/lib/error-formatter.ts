import { ErrorResponseDto } from '@/types/errors';

/**
 * Sanitizes error context to prevent exposure of sensitive data.
 * Only whitelisted keys are preserved (following ADR-007: Security Model).
 */
export function sanitizeErrorContext(
  context?: Record<string, any>
): Record<string, any> {
  if (!context) return {};

  const SAFE_KEYS = [
    'availableConnectors',
    'path',
    'connectorType',
    'profileName',
    'stepName',
    'availableProfiles',
    'lineNumber',
    'columnNumber',
  ];

  return Object.keys(context)
    .filter((key) => SAFE_KEYS.includes(key))
    .reduce((acc, key) => {
      const value = context[key];
      
      // Prevent prototype pollution
      if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
        return acc;
      }
      
      // Only allow safe primitive types
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return { ...acc, [key]: value };
      }
      
      // Allow arrays (but sanitize items)
      if (Array.isArray(value)) {
        const sanitizedArray = value.map(item => {
          // Primitives are safe
          if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
            return item;
          }
          
          // Objects must be sanitized deeply
          if (typeof item === 'object' && item !== null) {
            return Object.keys(item)
              .filter(k => !k.startsWith('__') && k !== 'constructor' && k !== 'prototype')
              .reduce((obj, k) => {
                const val = item[k];
                // Only primitive values in nested objects
                if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                  return { ...obj, [k]: val };
                }
                return obj;
              }, {});
          }
          
          return null;
        }).filter(item => item !== null);
        
        return { ...acc, [key]: sanitizedArray };
      }
      
      // Reject functions, symbols, and other dangerous types
      return acc;
    }, {});
}

/**
 * Formats a raw error object into ErrorResponseDto.
 * Used as fallback when backend doesn't return structured error.
 */
export function formatErrorForDisplay(error: any): ErrorResponseDto | null {
  // If already is ErrorResponseDto from backend
  if (error.pypeError) {
    return {
      ...error.pypeError,
      context: sanitizeErrorContext(error.pypeError.context),
    };
  }

  // If is Axios error with response
  if (error.response) {
    return {
      status: error.response.status,
      code: `HTTP_${error.response.status}`,
      title: error.response.statusText || 'Request Failed',
      detail: error.response.data?.error || error.message || 'An error occurred',
      suggestions: getDefaultSuggestions(error.response.status),
      context: {},
    };
  }

  // Network error
  return {
    status: 0,
    code: 'NETWORK_ERROR',
    title: 'Network Error',
    detail: error.message || 'Failed to connect to server',
    suggestions: [
      'Check your internet connection',
      'Verify the API URL is correct',
      'Contact support if the problem persists',
    ],
    context: {},
  };
}

/**
 * Provides default suggestions based on HTTP status code.
 */
function getDefaultSuggestions(status: number): string[] {
  switch (status) {
    case 400:
      return ['Check your request parameters', 'Validate your input data'];
    case 401:
      return ['Check your authentication credentials', 'Try logging in again'];
    case 403:
      return ['You may not have permission for this action', 'Contact an administrator'];
    case 404:
      return ['The requested resource was not found', 'Check the URL or ID'];
    case 429:
      return ['Too many requests', 'Wait a moment and try again'];
    case 500:
    case 502:
    case 503:
      return ['Server error occurred', 'Try again in a few moments', 'Contact support if the issue persists'];
    default:
      return ['An unexpected error occurred', 'Try again or contact support'];
  }
}

/**
 * Extracts line number from error context path (e.g., "steps[0].connector" -> 0).
 */
export function extractLineNumber(path?: string): number {
  if (!path) return 1;

  const match = path.match(/\[(\d+)\]/);
  return match ? parseInt(match[1], 10) + 1 : 1; // +1 for 1-based line numbers
}

/**
 * Type guard to check if data is ErrorResponseDto.
 */
export function isErrorResponseDto(data: any): data is ErrorResponseDto {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  return (
    typeof data.code === 'string' &&
    typeof data.title === 'string' &&
    typeof data.detail === 'string' &&
    typeof data.status === 'number'
  );
}
