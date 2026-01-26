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

/**
 * ✅ ARCH-001: Format API error into a human-readable message
 * Handles multiple error response formats from the backend
 * 
 * @param error - Axios error object or any error
 * @returns Formatted error message string
 */
export function formatApiError(error: any): string {
  // ✅ MÉDIO 5 (CR): Sanitizar mensagens para prevenir XSS
  const sanitize = (text: string): string => {
    if (typeof text !== 'string') return String(text);
    
    // Remover tags HTML/script (básico)
    return text
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };
  
  // Case 1: ErrorResponseDto format (IMP-011 standard)
  if (error.response?.data && isErrorResponseDto(error.response.data)) {
    const { title, detail, suggestions } = error.response.data;
    
    let message = `${sanitize(title)}: ${sanitize(detail)}`;
    if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
      message += '\n\n💡 Sugestões:\n' + suggestions
        .filter(s => typeof s === 'string')
        .map(s => `  • ${sanitize(s)}`)
        .join('\n');
    }
    
    return message;
  }
  
  // Case 2: Standardized format from ARCH-001 (success: false, message, errors)
  if (error.response?.data && 
      'success' in error.response.data && 
      error.response.data.success === false &&
      'message' in error.response.data) {
    const { message, errors } = error.response.data;
    
    if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
      const errorList = Object.entries(errors)
        .map(([field, messages]) => {
          const msgArray = Array.isArray(messages) ? messages : [messages];
          const sanitizedMessages = msgArray
            .filter(m => m != null)
            .map(m => sanitize(String(m)));
          return `• ${sanitize(field)}: ${sanitizedMessages.join(', ')}`;
        })
        .join('\n');
      
      return `${sanitize(String(message))}\n\n${errorList}`;
    }
    
    return sanitize(String(message));
  }
  
  // Case 3: Legacy format with "error" field (backward compatibility)
  if (error.response?.data?.error) {
    const { error: errorMsg, detail, hint, missingVariables } = error.response.data;
    
    let message = sanitize(String(errorMsg));
    if (detail) message += `\n${sanitize(String(detail))}`;
    if (hint) message += `\n💡 ${sanitize(String(hint))}`;
    if (missingVariables && Array.isArray(missingVariables)) {
      message += `\n\nVariáveis faltando:\n${missingVariables
        .filter(v => v != null)
        .map((v: any) => `  • ${sanitize(String(v))}`)
        .join('\n')}`;
    }
    
    return message;
  }
  
  // Case 4: HTTP error without structured body
  if (error.response?.status) {
    const statusMessages: Record<number, string> = {
      400: 'Dados inválidos. Verifique os campos e tente novamente.',
      401: 'Sessão expirada. Faça login novamente.',
      403: 'Acesso negado para esta operação.',
      404: 'Recurso não encontrado.',
      409: 'Conflito: o recurso já existe ou está em uso.',
      422: 'Dados não processáveis. Verifique o formato.',
      500: 'Erro interno do servidor. Tente novamente mais tarde.',
      502: 'Serviço indisponível. Gateway error.',
      503: 'Serviço temporariamente indisponível.',
      504: 'Tempo limite de requisição excedido.',
    };
    
    return statusMessages[error.response.status] || 
           `Erro HTTP ${error.response.status}: ${error.response.statusText || 'Erro desconhecido'}`;
  }
  
  // Case 5: Network error (no response from server)
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.response) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Case 6: Request timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Tempo limite de requisição excedido. Tente novamente.';
  }
  
  // Fallback
  return error.message || 'Erro desconhecido';
}

/**
 * Extract error details for logging/debugging purposes
 * @param error - Axios error object
 * @returns Object with structured error details
 */
export function extractErrorDetails(error: any): {
  url?: string;
  method?: string;
  status?: number;
  statusText?: string;
  message: string;
  data?: any;
  requestData?: any;
} {
  return {
    url: error.config?.url,
    method: error.config?.method?.toUpperCase(),
    status: error.response?.status,
    statusText: error.response?.statusText,
    message: formatApiError(error),
    data: error.response?.data,
    requestData: error.config?.data ? JSON.parse(error.config.data) : undefined,
  };
}

/**
 * Check if error is due to authentication failure
 */
export function isAuthError(error: any): boolean {
  return error.response?.status === 401;
}

/**
 * Check if error is due to authorization failure (forbidden)
 */
export function isForbiddenError(error: any): boolean {
  return error.response?.status === 403;
}

/**
 * Check if error is due to network/connectivity issues
 */
export function isNetworkError(error: any): boolean {
  return !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
}

/**
 * Check if error is due to validation failure
 */
export function isValidationError(error: any): boolean {
  return error.response?.status === 400;
}
