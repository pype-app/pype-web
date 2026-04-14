# BUG-003: Executive Summary - Dry-Run ExecutionId Undefined

**Date:** 2026-01-25  
**Severity:** High  
**Component:** Frontend (pype-web)  
**Estimated Effort:** 2-4 hours (Small)

---

## 🎯 Problem Statement

Users cannot monitor dry-run pipeline execution progress through the web interface. After initiating a dry-run, the frontend attempts to poll execution status with `undefined` instead of the valid `executionId` returned by the backend API.

---

## 🔍 Root Cause Analysis

### Backend Investigation (pype-admin)
✅ **Backend is working correctly:**

**Endpoint:** `POST /pipelines/crud/{id}/dry-run`  
**Location:** `Pipelines.Crud.Endpoints.cs` (Lines 445-478)  
**Service:** `PipelineCommandService.ExecuteDryRunAsync()` (Lines 399-463)

**Response Structure:**
```json
{
  "executionId": "cc9487d4-18e2-431a-a030-b32a4db5df14",
  "status": "completed",
  "message": "Dry-run criado com sucesso"
}
```

**Polling Endpoint:** `GET /pipelines/crud/dry-runs/{dryRunId}`  
Also properly implemented and returns execution details.

### Frontend Investigation (pype-web)
❌ **Frontend is missing implementation:**

**Current State:**
- `pipelineService.ts` **does not have** `executeDryRun()` method
- No component code exists to call dry-run endpoint
- No Zustand store state tracking dry-run executions
- No polling mechanism implemented

**Evidence from Network Logs:**
```bash
# Request that worked (backend perspective):
POST /pipelines/crud/7a3b6e24-9399-4dd1-b4f5-5d16eb7e2aa3/dry-run?sampleSize=10
Response: HTTP 200 { executionId: "cc9487d4-18e2-431a-a030-b32a4db5df14", ... }

# Failed polling attempt (frontend tried to call):
GET /pipelines/crud/dry-runs/undefined
```

---

## 🏗️ Technical Architecture Gap

### API Contract Mismatch

| Layer | Expected Implementation | Current Status |
|-------|------------------------|----------------|
| **Backend Endpoint** | POST `/pipelines/crud/{id}/dry-run` | ✅ Implemented |
| **Backend Response** | `{ executionId, status, message }` | ✅ Returns correctly |
| **Frontend Service** | `pipelineService.executeDryRun(id)` | ❌ Missing |
| **Frontend Polling** | `pipelineService.getDryRunStatus(executionId)` | ❌ Missing |
| **Zustand Store** | State tracking dry-run execution | ❌ Missing |
| **UI Component** | Trigger dry-run + display progress | ❌ Partial/broken |

### Critical Missing Code Pattern

**Expected Implementation (Not Present):**
```typescript
// pipelineService.ts - MISSING
async executeDryRun(
  pipelineId: string, 
  options?: { yamlOverride?: string; sampleSize?: number }
): Promise<{ executionId: string; status: string; message: string }> {
  const params = new URLSearchParams();
  if (options?.sampleSize) params.append('sampleSize', options.sampleSize.toString());
  
  return await apiClient.post<{ executionId: string; status: string; message: string }>(
    `${this.baseUrl}/${pipelineId}/dry-run?${params}`,
    { yamlOverride: options?.yamlOverride }
  );
}

async getDryRunStatus(executionId: string): Promise<DryRunExecution> {
  return await apiClient.get<DryRunExecution>(
    `${this.baseUrl}/dry-runs/${executionId}`
  );
}
```

---

## 📊 Impact Assessment

### Severity: HIGH
- **User Impact:** Blocks pipeline validation workflow (cannot test before activating)
- **Workaround Available:** Yes (use curl/Postman to call API directly)
- **Data Loss Risk:** None (read-only operation)
- **Multi-Tenancy Impact:** None (isolated to single user session)

### Scope: FRONTEND ONLY
- **Backend Changes Required:** None (already working)
- **Database Schema Changes:** None
- **Infrastructure Changes:** None
- **API Contract Changes:** None (backend already compliant)

---

## ✅ Proposed Solution

### Phase 1: Service Layer (pipelineService.ts)
**Effort:** 1 hour  
**Files Modified:** 1

1. Add `executeDryRun(id, options)` method
2. Add `getDryRunStatus(executionId)` method
3. Add proper TypeScript types for dry-run responses

### Phase 2: State Management (Zustand Store)
**Effort:** 30 minutes  
**Files Modified:** 1 (create new `src/store/executions.ts` or extend existing store)

1. Add state slice for tracking dry-run execution
2. Implement polling mechanism with interval timer
3. Handle execution lifecycle (pending → running → completed/failed)

### Phase 3: UI Integration
**Effort:** 1-2 hours  
**Files Modified:** 2-3 (pipeline detail/editor components)

1. Add "Dry-Run" button to pipeline UI
2. Implement modal/drawer showing dry-run progress
3. Real-time log streaming from polling endpoint
4. Error handling with user-friendly messages

### Phase 4: Testing
**Effort:** 30 minutes

1. Manual test with existing pipeline (test-06-mysql-source-connector)
2. Verify executionId is captured from response
3. Verify polling works with valid UUID
4. Verify error states display correctly

---

## 🔐 Security & Performance Considerations

### Security
- ✅ No new security concerns (uses existing auth middleware)
- ✅ Tenant isolation already enforced by backend
- ✅ User permissions already validated (RequireUser attribute)

### Performance
- **Polling Frequency:** Recommend 2-second interval (not aggressive)
- **Auto-stop Polling:** After 30 seconds or when status = completed/failed
- **Memory Impact:** Negligible (~1KB state per active dry-run)
- **Network Impact:** ~0.5KB per poll request (minimal)

---

## 📋 Acceptance Criteria Mapping

All 4 criteria from business spec are addressable with proposed solution:

| Criterion | Implementation | Validation |
|-----------|----------------|------------|
| **CA-01:** ExecutionId Captured | Extract `response.data.executionId` | DevTools Network tab shows correct UUID |
| **CA-02:** Polling with Valid UUID | Use captured executionId in GET request | URL contains actual UUID, not "undefined" |
| **CA-03:** Progress Display | Render execution status from polling response | UI shows Running → Completed |
| **CA-04:** Error Handling | Try-catch around API calls + display error message | User sees error toast, no undefined crash |

---

## 🚀 Implementation Sequence

### Developer Workflow
1. **Read Business Spec:** [BUG-003-dry-run-executionid-undefined.md](../../01-business/BUG-003-dry-run-executionid-undefined.md)
2. **Read ADR:** [ADR-003-fix-dry-run-response-handling.md](./decisions/ADR-003-fix-dry-run-response-handling.md)
3. **Review Diagrams:** [BUG-003-dry-run-flow.md](./diagrams/BUG-003-dry-run-flow.md)
4. **Implement Service Layer:** Add methods to `pipelineService.ts`
5. **Implement State Management:** Create/extend Zustand store
6. **Implement UI:** Add dry-run trigger + progress display
7. **Test Manually:** Use test-06-mysql-source-connector pipeline
8. **Validate QA Criteria:** Check all 4 acceptance criteria pass

### QA Validation Workflow
1. Login to web interface (http://localhost:3080)
2. Navigate to any pipeline
3. Click "Dry-Run" button
4. Open Browser DevTools → Network tab
5. Verify POST `/dry-run` returns 200 with executionId
6. Verify subsequent GET `/dry-runs/{uuid}` uses actual UUID
7. Verify UI displays execution progress
8. Test error scenario (invalid pipeline ID) shows error message

---

## 📚 Reference Documents

- **Business Spec:** [BUG-003-dry-run-executionid-undefined.md](../../01-business/BUG-003-dry-run-executionid-undefined.md)
- **Architecture Decision:** [ADR-003-fix-dry-run-response-handling.md](./decisions/ADR-003-fix-dry-run-response-handling.md)
- **Flow Diagram:** [BUG-003-dry-run-flow.md](./diagrams/BUG-003-dry-run-flow.md)
- **Backend Code:** `pype-admin/src/Pype.Admin/Routes/Pipelines.Crud.Endpoints.cs` (Lines 445-478)
- **Lessons Learned:** `pype-admin/docs/LESSONS_LEARNED.md` (BUG-001 similar pattern)

---

**Status:** ✅ Architecture Analysis Complete - Ready for Development Handoff
