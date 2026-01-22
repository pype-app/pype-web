/**
 * Dry-Run Types
 * 
 * Type definitions for pipeline dry-run (test execution) functionality.
 * Dry-runs simulate pipeline execution without persisting data to the sink.
 */

/**
 * Status of a dry-run execution
 */
export type DryRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * Complete dry-run execution status returned by polling endpoint
 */
export interface DryRunStatusResponse {
  /** Unique identifier for this dry-run execution */
  id: string
  
  /** Pipeline being tested */
  pipelineId: string
  pipelineName: string
  pipelineVersion: string
  
  /** Current execution status */
  status: DryRunStatus
  
  /** Number of sample messages to process */
  sampleSize: number
  
  /** Timestamps */
  createdAt: string
  startedAt?: string
  completedAt?: string
  
  /** Execution duration in milliseconds */
  durationMs?: number
  
  /** User who triggered the dry-run */
  triggeredBy?: string
  
  /** Detailed result (only present when status is 'completed') */
  result?: DryRunResult
  
  /** Error details (only present when status is 'failed') */
  errorMessage?: string
  errorStackTrace?: string
}

/**
 * Detailed result of a completed dry-run
 */
export interface DryRunResult {
  /** Pipeline identification */
  pipelineName: string
  version: string
  
  /** Overall success status */
  success: boolean
  
  /** Execution timestamps */
  startedAt: string
  completedAt?: string
  durationMs?: number
  
  /** Error information (if success is false) */
  errorMessage?: string
  errorStackTrace?: string
  
  /** Results from each pipeline step */
  steps: DryRunStepResult[]
  
  /** Total number of sample messages processed */
  totalSampleMessages: number
}

/**
 * Result from a single pipeline step execution
 */
export interface DryRunStepResult {
  /** Type of step executed */
  stepType: 'source' | 'transform' | 'validate' | 'sink' | 'auth'
  
  /** Connector type used (e.g., 'Http', 'MySql', 'Sankhya') */
  connectorType?: string
  
  /** Whether the step executed successfully */
  success: boolean
  
  /** Whether the step was skipped */
  skipped: boolean
  
  /** Human-readable status message */
  message: string
  
  /** Step execution timestamps */
  startedAt: string
  completedAt?: string
  durationMs?: number
  
  /** Number of messages processed by this step */
  messageCount: number
  
  /** Sample of data from this step (limited by sampleSize) */
  sampleData: any[]
  
  /** Error details (if success is false) */
  errorMessage?: string
  
  /** Additional metadata specific to the connector */
  metadata?: Record<string, any>
}

/**
 * Request payload for starting a dry-run
 */
export interface StartDryRunRequest {
  sampleSize: number
}

/**
 * Response when enqueueing a dry-run job
 */
export interface StartDryRunResponse {
  /** Unique identifier for tracking this dry-run */
  dryRunId: string
  
  /** Message confirming the dry-run was enqueued */
  message: string
}
