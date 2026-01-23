import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { ErrorResponseDto } from '@/types/errors';
import { sanitizeErrorContext } from '@/lib/error-formatter';

interface ErrorState {
  currentError: ErrorResponseDto | null;
  errorHistory: ErrorResponseDto[];
  isErrorVisible: boolean;
  showError: (error: ErrorResponseDto) => void;
  clearError: () => void;
  getErrorById: (traceId: string) => ErrorResponseDto | undefined;
  _lastErrorTime: number; // Exposed for testing
}

/**
 * Global error state management using Zustand.
 * Follows ADR-002: Error State Management.
 * 
 * Features:
 * - Current error state for inline display
 * - Error history (last 50 errors) with persist
 * - Toast notifications via react-hot-toast
 * - TraceId-based error lookup
 * - Rate limiting (1 error/second)
 */
export const useErrorHandler = create<ErrorState>()(
  persist(
    (set, get) => ({
      currentError: null,
      errorHistory: [],
      isErrorVisible: false,
      _lastErrorTime: 0,

      showError: (error: ErrorResponseDto) => {
        const state = get();
        const now = Date.now();
        const ERROR_RATE_LIMIT_MS = 1000; // Max 1 error per second
        
        // SECURITY: Rate limiting to prevent DoS attacks (CRÍTICO #4)
        if (now - state._lastErrorTime < ERROR_RATE_LIMIT_MS) {
          // Silently ignore if rate limited (prevent spam)
          return;
        }

        // Sanitize context (ADR-007: Security Model)
        const sanitizedError: ErrorResponseDto = {
          ...error,
          context: sanitizeErrorContext(error.context),
        };

        // Update state
        set((state) => ({
          currentError: sanitizedError,
          isErrorVisible: true,
          _lastErrorTime: now,
          errorHistory: [
            sanitizedError,
            ...state.errorHistory.filter((e) => e.traceId !== sanitizedError.traceId).slice(0, 49), // Pre-slice to prevent memory leak
          ].slice(0, 50), // Keep last 50
        }));

        // SECURITY: Log only in development (CRÍTICO #3 - Prevent information disclosure)
        if (process.env.NODE_ENV === 'development') {
          console.info('[ErrorHandler] Displaying error:', {
            code: sanitizedError.code,
            status: sanitizedError.status,
            traceId: sanitizedError.traceId,
            // DO NOT log context (may have sensitive data)
          });
        }

        // Show toast notification
        // Duration: 10s for critical errors (5xx), 5s for others
        const duration = sanitizedError.status >= 500 ? 10000 : 5000;

        // Show simple toast (avoiding JSX in hook for testing compatibility)
        toast.error(
          `${sanitizedError.title}: ${sanitizedError.detail.slice(0, 100)}${
            sanitizedError.detail.length > 100 ? '...' : ''
          }`,
          {
            duration,
            position: 'top-right',
            id: sanitizedError.code, // Dedupe by error code
          }
        );
      },

      clearError: () =>
        set({
          currentError: null,
          isErrorVisible: false,
        }),

      getErrorById: (traceId: string) => {
        return get().errorHistory.find((e) => e.traceId === traceId);
      },
    }),
    {
      name: 'pype-error-store',
      partialize: (state) => ({
        // Persist only error history (not current error or lastErrorTime)
        errorHistory: state.errorHistory,
      }),
    }
  )
);
