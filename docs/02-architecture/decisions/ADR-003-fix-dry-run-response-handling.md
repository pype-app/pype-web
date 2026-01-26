# ADR-003: Fix Dry-Run Response Handling in Frontend

**Status:** ✅ Accepted  
**Date:** 2026-01-25  
**Deciders:** Architecture Team  
**Context:** BUG-003 - Frontend fails to capture executionId from dry-run API response

---

## Context and Problem Statement

The Pype backend correctly implements dry-run pipeline execution endpoints and returns a JSON response containing an `executionId` field. However, the frontend application attempts to poll the execution status endpoint with `undefined` instead of the actual UUID, causing the dry-run monitoring feature to fail.

**Evidence:**
- Backend logs show: `Dry-run created for pipeline ... (ExecutionId: cc9487d4-18e2-431a-a030-b32a4db5df14)`
- Frontend attempts: `GET /pipelines/crud/dry-runs/undefined`

**User Impact:**
- Users cannot validate pipeline YAML before enabling scheduled execution
- No visibility into dry-run progress or results
- Forces users to use external tools (curl/Postman) for validation

---

## Decision Drivers

### Technical Requirements
- ✅ Backend API contract is stable and correct (no changes allowed)
- ✅ Must maintain multi-tenant isolation (already enforced by backend)
- ✅ Must work with existing Zustand state management pattern
- ✅ Must follow existing API client conventions (apiClient wrapper)
- ✅ Polling must be efficient (avoid aggressive refresh rates)

### Business Requirements
- ⏱️ Fix must be deliverable in < 1 day (small scope)
- 🔒 No breaking changes to existing pipelines functionality
- 🎯 Must support CA-01 through CA-04 from business spec
- 📊 Must provide real-time execution feedback to users

### Constraints
- **Pattern Consistency:** Solution must follow existing `pipelineService.ts` patterns
- **State Management:** Must use Zustand (no Redux/MobX)
- **Type Safety:** All API responses must have TypeScript interfaces
- **Error Handling:** Must gracefully handle network/API errors
- **No Backend Changes:** Backend is working correctly, frontend-only fix

---

## Considered Options

### Option 1: Add Methods to Existing pipelineService.ts (CHOSEN ✅)

**Description:**  
Extend `pipelineService.ts` with `executeDryRun()` and `getDryRunStatus()` methods, following the same pattern as existing service methods (e.g., `runPipeline()`, `getPipeline()`).

**Pros:**
- ✅ Consistent with existing architecture
- ✅ Minimal code changes (2 new methods + 2 TypeScript types)
- ✅ Reuses existing `apiClient` infrastructure (auth, interceptors)
- ✅ Easy to test and maintain
- ✅ No breaking changes to existing code

**Cons:**
- ⚠️ `pipelineService.ts` grows slightly (acceptable tradeoff)

**Implementation:**
```typescript
// pipelineService.ts
export interface DryRunOptions {
  yamlOverride?: string;
  sampleSize?: number;
}

export interface DryRunResponse {
  executionId: string;
  status: string;
  message: string;
}

export interface DryRunExecution {
  id: string;
  pipelineId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  logs?: string;
  outputData?: string;
  errorMessage?: string;
}

class PipelineService {
  // ... existing methods ...

  async executeDryRun(id: string, options?: DryRunOptions): Promise<DryRunResponse> {
    const params = new URLSearchParams();
    if (options?.sampleSize) params.append('sampleSize', options.sampleSize.toString());
    
    const url = `${this.baseUrl}/${id}/dry-run${params.toString() ? '?' + params : ''}`;
    return await apiClient.post<DryRunResponse>(url, {
      yamlOverride: options?.yamlOverride
    });
  }

  async getDryRunStatus(executionId: string): Promise<DryRunExecution> {
    return await apiClient.get<DryRunExecution>(`${this.baseUrl}/dry-runs/${executionId}`);
  }
}
```

---

### Option 2: Create Separate dryRunService.ts

**Description:**  
Create a new service file `src/services/dryRunService.ts` to handle all dry-run-related operations.

**Pros:**
- ✅ Separation of concerns (dry-run logic isolated)
- ✅ Easier to extend with dry-run-specific features later

**Cons:**
- ❌ Breaks consistency (no other pipeline operations have separate services)
- ❌ Requires additional import statements across codebase
- ❌ More files to maintain
- ❌ Overkill for 2 simple methods

**Verdict:** ❌ Rejected (over-engineering)

---

### Option 3: Inline API Calls in React Component

**Description:**  
Call `apiClient.post()` and `apiClient.get()` directly from React components without service layer abstraction.

**Pros:**
- ✅ Fastest to implement (no service file changes)

**Cons:**
- ❌ Violates separation of concerns
- ❌ Makes testing harder (can't mock service)
- ❌ Duplicates API logic if multiple components need dry-run
- ❌ Breaks existing architecture pattern

**Verdict:** ❌ Rejected (anti-pattern)

---

## Decision Outcome

**Chosen Option:** **Option 1 - Add Methods to Existing pipelineService.ts**

### Rationale
1. **Consistency:** Matches existing `runPipeline()`, `getPipeline()`, etc. methods
2. **Simplicity:** Minimal code changes, easy to review and test
3. **Maintainability:** All pipeline-related API calls remain in one service
4. **Type Safety:** TypeScript interfaces ensure compile-time validation
5. **Reusability:** Service methods can be used by any component

### Implementation Plan

#### Phase 1: Service Layer (pipelineService.ts)
**File:** `src/services/pipelineService.ts`

1. Add TypeScript interfaces:
   ```typescript
   DryRunOptions { yamlOverride?, sampleSize? }
   DryRunResponse { executionId, status, message }
   DryRunExecution { id, pipelineId, status, logs, ... }
   ```

2. Add service methods:
   ```typescript
   executeDryRun(id, options?) → DryRunResponse
   getDryRunStatus(executionId) → DryRunExecution
   ```

**Estimated Effort:** 1 hour

#### Phase 2: State Management (Zustand Store)
**File:** `src/store/executions.ts` (new) OR extend existing store

1. Create execution tracking state:
   ```typescript
   interface ExecutionStore {
     activeDryRuns: Map<string, DryRunExecution>;
     startDryRun: (pipelineId: string, options?) => Promise<void>;
     pollDryRunStatus: (executionId: string) => Promise<void>;
     stopPolling: (executionId: string) => void;
   }
   ```

2. Implement polling logic:
   - Interval: 2 seconds
   - Auto-stop: After 30s or when status = completed/failed
   - Cleanup: Clear intervals on component unmount

**Estimated Effort:** 30 minutes

#### Phase 3: UI Integration
**Files:** Pipeline detail/editor components (TBD based on where dry-run button exists)

1. Add "Dry-Run" button to pipeline UI
2. Call `useExecutionStore().startDryRun(pipelineId)` on click
3. Display modal/drawer with:
   - Execution status badge
   - Real-time logs (streamed from polling)
   - Error messages (if failed)
   - Success message + output data (if completed)

**Estimated Effort:** 1-2 hours

---

## Consequences

### Positive
- ✅ Users can validate pipelines before enabling schedules
- ✅ Reduced support burden (no more "how do I test my pipeline?" questions)
- ✅ Improved user experience with real-time feedback
- ✅ No backend changes required (leverages existing API)
- ✅ Type-safe implementation (catches errors at compile time)

### Negative
- ⚠️ `pipelineService.ts` grows by ~40 lines (acceptable)
- ⚠️ New polling logic adds slight complexity (mitigated by auto-stop)

### Neutral
- 🔄 Establishes pattern for future execution monitoring features (manual runs, scheduled runs)

---

## Validation & Testing

### Developer Testing
1. **Unit Tests (Optional):**
   - Mock `apiClient.post()` and `apiClient.get()`
   - Verify `executeDryRun()` passes correct parameters
   - Verify `getDryRunStatus()` handles errors

2. **Integration Testing:**
   - Start pype-admin backend (localhost:8080)
   - Start pype-web frontend (localhost:3080)
   - Login with valid credentials
   - Navigate to test-06-mysql-source-connector pipeline
   - Click "Dry-Run" button
   - Verify Network tab shows POST → GET with valid UUID
   - Verify UI displays execution progress

### QA Acceptance Criteria
- ✅ **CA-01:** ExecutionId extracted correctly from POST response
- ✅ **CA-02:** Polling uses valid UUID (not "undefined")
- ✅ **CA-03:** UI displays status changes (Running → Completed)
- ✅ **CA-04:** Error scenarios show user-friendly messages

---

## Monitoring & Rollback

### Monitoring
- **Frontend Logs:** Browser console should show no errors during dry-run flow
- **Backend Logs:** Should show successful dry-run creation + status polls
- **Network Tab:** Validate HTTP 200 responses for POST + GET requests

### Rollback Plan
If critical issues arise (unlikely for frontend-only change):
1. Remove dry-run button from UI (users can't trigger broken feature)
2. Revert `pipelineService.ts` changes via git
3. No database rollback needed (no schema changes)
4. No backend rollback needed (no changes made)

---

## Lessons Learned Integration

### From BUG-001 (DbContext Concurrency)
**Lesson Applied:** This bug also involves proper response handling. We ensure:
- ✅ API responses are fully awaited before processing
- ✅ No concurrent state mutations (polling uses single source of truth)
- ✅ Clear separation between API layer and UI layer

### Pattern Consistency
**Existing Pattern (runPipeline):**
```typescript
async runPipeline(id: string): Promise<{ executionId: string; enqueued: boolean }> {
  return await apiClient.post<{ executionId: string; enqueued: boolean }>(...);
}
```

**New Pattern (executeDryRun):**
```typescript
async executeDryRun(id: string, options?: DryRunOptions): Promise<DryRunResponse> {
  return await apiClient.post<DryRunResponse>(..., { yamlOverride: ... });
}
```

**Consistency Check:** ✅ Both follow same async/await + typed response pattern

---

## References

- **Bug Report:** [BUG-003-dry-run-executionid-undefined.md](../../01-business/BUG-003-dry-run-executionid-undefined.md)
- **Executive Summary:** [BUG-003-executive-summary.md](../BUG-003-executive-summary.md)
- **Flow Diagram:** [BUG-003-dry-run-flow.md](../diagrams/BUG-003-dry-run-flow.md)
- **Backend Implementation:** `pype-admin/src/Pype.Admin/Routes/Pipelines.Crud.Endpoints.cs` (Lines 445-478)
- **Existing Service Pattern:** `pype-web/src/services/pipelineService.ts`
- **Related ADR:** ADR-002 (Fix Concurrent DbContext Bug) - same root cause analysis approach

---

**Approved By:** Architecture Team  
**Implementation:** Assigned to Development Team  
**Review Date:** 2026-01-25
