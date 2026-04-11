import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorResponseDto } from '@/types/errors';
import toast from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    custom: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock sanitizeErrorContext
jest.mock('@/lib/error-formatter', () => ({
  sanitizeErrorContext: jest.fn((context) => context),
}));

describe('useErrorHandler Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-23T00:00:00Z'));
    
    // Reset Zustand store completely
    const { result } = renderHook(() => useErrorHandler());
    act(() => {
      result.current.clearError();
      // Reset rate limiting timestamp
      useErrorHandler.setState({ _lastErrorTime: 0 });
    });
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  const mockError: ErrorResponseDto = {
    status: 400,
    code: 'TEST_ERROR',
    title: 'Test Error',
    detail: 'This is a test error message.',
    suggestions: ['Fix the issue', 'Try again'],
    traceId: 'trace-123',
  };

  it('initializes with null current error', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(result.current.currentError).toBeNull();
    expect(result.current.isErrorVisible).toBe(false);
  });

  it('displays error and updates state when showError is called', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError(mockError);
    });

    expect(result.current.currentError).toEqual(mockError);
    expect(result.current.isErrorVisible).toBe(true);
  });

  it('adds error to history when showError is called', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError(mockError);
    });

    expect(result.current.errorHistory).toHaveLength(1);
    expect(result.current.errorHistory[0]).toEqual(mockError);
  });

  it('calls toast.custom when showing error', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError(mockError);
    });

    expect(toast.custom).toHaveBeenCalled();
  });

  it('uses longer duration for 5xx errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const serverError: ErrorResponseDto = {
      ...mockError,
      status: 500,
    };
    
    act(() => {
      result.current.showError(serverError);
    });

    expect(toast.custom).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ duration: 10000 })
    );
  });

  it('uses shorter duration for 4xx errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError(mockError);
    });

    expect(toast.custom).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ duration: 5000 })
    );
  });

  it('clears current error when clearError is called', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError(mockError);
    });

    expect(result.current.currentError).not.toBeNull();
    
    act(() => {
      result.current.clearError();
    });

    expect(result.current.currentError).toBeNull();
    expect(result.current.isErrorVisible).toBe(false);
  });

  it('deduplicates errors by traceId in history', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError(mockError);
      result.current.showError(mockError); // Same error again
    });

    expect(result.current.errorHistory).toHaveLength(1);
  });

  it('limits error history to 50 items', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    for (let i = 0; i < 60; i++) {
      act(() => {
        result.current.showError({
          ...mockError,
          traceId: `trace-${i}`,
        });
      });
      
      // Advance time to bypass rate limiting (1000ms)
      jest.advanceTimersByTime(1001);
    }

    expect(result.current.errorHistory).toHaveLength(50);
  });

  it('retrieves error by traceId using getErrorById', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError(mockError);
    });

    const retrieved = result.current.getErrorById('trace-123');
    expect(retrieved).toEqual(mockError);
  });

  it('returns undefined for non-existent traceId', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const retrieved = result.current.getErrorById('non-existent');
    expect(retrieved).toBeUndefined();
  });
});
