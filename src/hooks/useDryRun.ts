import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api-client'
import type { 
  DryRunStatusResponse, 
  DryRunResult, 
  DryRunStatus,
  StartDryRunResponse 
} from '@/types/dry-run'

/**
 * Configuration options for the useDryRun hook
 */
interface UseDryRunOptions {
  /** Polling interval in milliseconds (default: 2000ms) */
  pollingInterval?: number
  
  /** Maximum polling duration in milliseconds (default: 300000ms / 5 minutes) */
  maxPollingDuration?: number
  
  /** Callback when dry-run starts (execution queued) */
  onStart?: (dryRunId: string) => void
  
  /** Callback when dry-run completes successfully */
  onComplete?: (result: DryRunResult) => void
  
  /** Callback when dry-run fails */
  onError?: (error: string) => void
}

/**
 * Return type for the useDryRun hook
 */
export interface UseDryRunReturn {
  /** Start a new dry-run execution */
  startDryRun: (pipelineId: string, sampleSize: number, yamlOverride?: string) => Promise<void>
  reset: () => void
  
  /** Whether initial API call is in progress */
  isLoading: boolean
  
  /** Whether polling is active */
  isPolling: boolean
  
  /** Current dry-run ID (set after startDryRun) */
  dryRunId: string | null
  
  /** Current execution status */
  status: DryRunStatus | null
  
  /** Complete status response from polling */
  statusResponse: DryRunStatusResponse | null
  
  /** Dry-run result (only present when completed) */
  result: DryRunResult | null
  
  /** Error message if any operation failed */
  error: string | null
}

/**
 * Custom hook for managing pipeline dry-run lifecycle
 * 
 * Features:
 * - Starts dry-run execution via API
 * - Automatic polling for status updates
 * - Timeout handling (5 minutes default)
 * - Error handling and notifications
 * 
 * @param options - Configuration options
 * @returns Hook state and methods
 * 
 * @example
 * ```tsx
 * const { startDryRun, isPolling, result, error } = useDryRun({
 *   onComplete: (result) => console.log('Dry-run completed:', result),
 *   onError: (error) => console.error('Dry-run failed:', error)
 * })
 * 
 * // Start dry-run
 * await startDryRun('pipeline-123', 10)
 * ```
 */
export function useDryRun(options: UseDryRunOptions = {}): UseDryRunReturn {
  const {
    pollingInterval = 2000,
    maxPollingDuration = 300000, // 5 minutes
    onStart,
    onComplete,
    onError,
  } = options

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [dryRunId, setDryRunId] = useState<string | null>(null)
  const [status, setStatus] = useState<DryRunStatus | null>(null)
  const [statusResponse, setStatusResponse] = useState<DryRunStatusResponse | null>(null)
  const [result, setResult] = useState<DryRunResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Refs for cleanup and error tracking
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTimeRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)
  const consecutiveErrorsRef = useRef<number>(0)
  const MAX_CONSECUTIVE_ERRORS = 3

  /**
   * Clear polling interval
   */
  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    pollingStartTimeRef.current = null
    consecutiveErrorsRef.current = 0
  }, [])

  /**
   * Fetch current dry-run status
   */
  const fetchStatus = useCallback(async (id: string): Promise<DryRunStatusResponse | null> => {
    try {
      const response = await apiClient.get<DryRunStatusResponse>(
        `/pipelines/crud/dry-runs/${id}`
      )
      
      // Reset consecutive errors on successful fetch
      consecutiveErrorsRef.current = 0
      
      return response
    } catch (err: any) {
      console.error('Failed to fetch dry-run status:', err)
      
      consecutiveErrorsRef.current++
      
      // Stop polling after too many consecutive errors
      if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
        clearPolling()
        setIsPolling(false)
        
        const errorMessage = `Polling stopped after ${MAX_CONSECUTIVE_ERRORS} consecutive errors. Last error: ${err.response?.data?.message || err.message}`
        setError(errorMessage)
        onError?.(errorMessage)
        
        return null
      }
      
      // Only track first error (no toast)
      if (consecutiveErrorsRef.current === 1 && isMountedRef.current) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dry-run status'
        setError(errorMessage)
      }
      
      return null
    }
  }, [clearPolling])

  /**
   * Start polling for status updates
   */
  const startPolling = useCallback((id: string) => {
    // Clear any existing polling
    clearPolling()
    
    setIsPolling(true)
    pollingStartTimeRef.current = Date.now()

    // Poll immediately
    fetchStatus(id).then((response) => {
      if (!isMountedRef.current) return
      
      if (response) {
        setStatusResponse(response)
        setStatus(response.status)
        
        if (response.result) {
          setResult(response.result)
        }
      }
    })

    // Set up interval
    pollingIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) {
        clearPolling()
        return
      }

      // Check timeout
      const elapsedTime = Date.now() - (pollingStartTimeRef.current || 0)
      if (elapsedTime > maxPollingDuration) {
        clearPolling()
        setIsPolling(false)
        const timeoutError = 'Dry-run polling timed out after 5 minutes'
        setError(timeoutError)
        onError?.(timeoutError)
        return
      }

      // Fetch status
      const response = await fetchStatus(id)
      if (!response || !isMountedRef.current) return

      setStatusResponse(response)
      setStatus(response.status)

      // Update result if available
      if (response.result) {
        setResult(response.result)
      }

      // Handle terminal states
      if (response.status === 'completed') {
        clearPolling()
        setIsPolling(false)
        
        if (response.result) {
          onComplete?.(response.result)
        }
      } else if (response.status === 'failed') {
        clearPolling()
        setIsPolling(false)
        
        const failureError = response.errorMessage || 'Dry-run execution failed'
        setError(failureError)
        onError?.(failureError)
      } else if (response.status === 'cancelled') {
        clearPolling()
        setIsPolling(false)
      }
    }, pollingInterval)
  }, [clearPolling, fetchStatus, maxPollingDuration, pollingInterval, onComplete, onError])

  /**
   * Start a new dry-run execution
   */
  const startDryRun = useCallback(async (pipelineId: string, sampleSize: number, yamlOverride?: string) => {
    // Reset previous state
    setError(null)
    setResult(null)
    setStatus(null)
    setStatusResponse(null)
    setDryRunId(null)
    
    setIsLoading(true)

    try {
      // Enqueue dry-run job via new endpoint (BUG-002)
      const response = await apiClient.post<StartDryRunResponse>(
        '/pipelines/crud/dry-run',
        {
          pipelineId: pipelineId,
          yamlContent: yamlOverride || null,
          sampleSize: sampleSize
        }
      )

      if (!isMountedRef.current) return

      // Backend retorna 'executionId', não 'dryRunId'
      const { executionId: newExecutionId, status: responseStatus } = response
      
      setDryRunId(newExecutionId)
      // Validar se status é um DryRunStatus válido, fallback para 'pending'
      const validStatus = (['pending', 'running', 'completed', 'failed', 'cancelled'] as const)
        .includes(responseStatus as any) ? responseStatus as DryRunStatus : 'pending'
      setStatus(validStatus)
      
      // Notify parent that dry-run has started
      onStart?.(newExecutionId)

      // Start polling for status
      startPolling(newExecutionId)
    } catch (err: any) {
      if (!isMountedRef.current) return
      
      console.error('Failed to start dry-run:', err)
      
      // Handle validation errors with details
      const errorData = err.response?.data
      let errorMessage = errorData?.error || errorData?.message || err.message || 'Failed to start dry-run'
      
      // If there are validation errors, format them nicely
      if (errorData?.errors && typeof errorData.errors === 'object') {
        // Handle both Schema errors (array) and other error formats
        if (errorData.errors.Schema && Array.isArray(errorData.errors.Schema)) {
          const schemaErrors = errorData.errors.Schema.join('\n\n')
          errorMessage = `YAML Validation Failed:\n\n${schemaErrors}`
        } else if (Array.isArray(errorData.errors)) {
          const details = errorData.errors.map((e: any) => 
            `  • ${e.path || 'Unknown'}: ${e.message || 'Validation error'}`
          ).join('\n')
          errorMessage = `${errorMessage}\n\n${details}`
        }
      }
      
      setError(errorMessage)
      setStatus('failed')  // ✅ Set status so modal can render error state
      onError?.(errorMessage)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [startPolling, onStart, onError])

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    clearPolling()
    setIsLoading(false)
    setIsPolling(false)
    setDryRunId(null)
    setStatus(null)
    setStatusResponse(null)
    setResult(null)
    setError(null)
  }, [clearPolling])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      clearPolling()
    }
  }, [clearPolling])

  return {
    startDryRun,
    reset,
    isLoading,
    isPolling,
    dryRunId,
    status,
    statusResponse,
    result,
    error,
  }
}
