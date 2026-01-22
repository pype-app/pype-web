'use client'

import { useState, useEffect } from 'react'
import { DryRunButton } from './DryRunButton'
import { DryRunProgress } from './DryRunProgress'
import { DryRunResultModal } from './DryRunResultModal'
import { useDryRun } from '@/hooks/useDryRun'

interface DryRunManagerProps {
  pipelineId: string
  pipelineName: string
  disabled?: boolean
  className?: string
  /** Optional: Custom YAML to use instead of saved pipeline YAML */
  yamlContent?: string
}

/**
 * Complete dry-run management component
 * 
 * Orchestrates the entire dry-run flow:
 * 1. User clicks "Test Run" button
 * 2. Configures sample size in modal
 * 3. Monitors progress with polling
 * 4. Displays comprehensive results
 * 
 * This is a convenience component that combines:
 * - DryRunButton (trigger + config)
 * - DryRunProgress (status feedback)
 * - DryRunResultModal (results display)
 * - useDryRun hook (state management)
 */
export function DryRunManager({
  pipelineId,
  pipelineName,
  disabled = false,
  className = '',
  yamlContent,
}: DryRunManagerProps) {
  const [showResults, setShowResults] = useState(false)

  // Single shared instance of useDryRun hook
  const dryRunState = useDryRun({
    onStart: () => {
      // Open results modal immediately when dry-run starts
      setShowResults(true)
    },
    onComplete: () => {
      // Ensure results modal stays open when dry-run completes
      setShowResults(true)
    },
    onError: () => {
      // Also open results modal on error (will show error details)
      setShowResults(true)
    },
  })

  const handleDryRunStart = () => {
    // No need to reset modal here - it will open via onStart callback
    // and stay open until user manually closes it
  }

  // Also open results modal when status becomes 'completed' or 'failed'
  // This provides a safety net if callbacks don't fire
  useEffect(() => {
    if (dryRunState.status === 'completed' || dryRunState.status === 'failed') {
      setShowResults(true)
    }
  }, [dryRunState.status])

  return (
    <div className={className}>
      {/* Trigger Button - pass the hook state down */}
      <DryRunButton
        pipelineId={pipelineId}
        pipelineName={pipelineName}
        disabled={disabled}
        onDryRunStart={handleDryRunStart}
        dryRunState={dryRunState}
        yamlContent={yamlContent}
      />

      {/* Results Modal (opens immediately on dry-run start) */}
      <DryRunResultModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        result={dryRunState.result}
        status={dryRunState.status}
        pipelineName={pipelineName}
      />
    </div>
  )
}
