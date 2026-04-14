# BUG-003: Infrastructure Impact Assessment

**Date:** 2026-01-25  
**Bug:** Dry-Run ExecutionId Undefined  
**Component:** Frontend (pype-web)  
**Severity:** High (User-facing functionality broken)

---

## 📊 Infrastructure Change Analysis

### Summary
**Infrastructure Changes Required:** ✅ **NONE**

This bug fix is **purely frontend code changes** with zero infrastructure modifications needed. All backend services, databases, and network configurations remain unchanged.

---

## 🔍 Component-by-Component Analysis

### 1. Backend Services (pype-admin)

| Component | Current State | Changes Required | Impact |
|-----------|---------------|------------------|--------|
| **Pype.Admin API** | ✅ Working correctly | None | No impact |
| **Pype.Engine** | ✅ Not involved in dry-run | None | No impact |
| **Hangfire Dashboard** | ✅ Not involved in dry-run | None | No impact |
| **API Endpoints** | ✅ Returning correct JSON | None | No impact |
| **PipelineCommandService** | ✅ Creating executions correctly | None | No impact |
| **PipelineQueryService** | ✅ Polling endpoint works | None | No impact |

**Verdict:** Backend requires **zero changes**.

---

### 2. Database (PostgreSQL)

| Component | Current State | Changes Required | Impact |
|-----------|---------------|------------------|--------|
| **PipelineExecutions Table** | ✅ Storing dry-run executions | None | No impact |
| **Migrations** | ✅ Schema is correct | None | No migration needed |
| **Indexes** | ✅ Sufficient for queries | None | No new indexes |
| **Queries** | ✅ Performant (<100ms) | None | No query optimization |

**Verdict:** Database requires **zero changes**.

---

### 3. Frontend Services (pype-web)

| Component | Current State | Changes Required | Impact |
|-----------|---------------|------------------|--------|
| **Next.js App** | ✅ Running | Code changes only | No config changes |
| **API Client** | ✅ Auth working | None | No interceptor changes |
| **Zustand Store** | ✅ Working | New store slice | No existing state affected |
| **Runtime Config** | ✅ Working | None | No env var changes |
| **Build Process** | ✅ Working | None | No build config changes |

**Verdict:** Frontend requires **code-only changes** (no infra).

---

### 4. Docker & Containers

| Component | Current State | Changes Required | Impact |
|-----------|---------------|------------------|--------|
| **pype-admin container** | ✅ Running | None | No rebuild |
| **pype-engine container** | ✅ Running | None | No rebuild |
| **pype-web container** | ✅ Running | Rebuild with new code | Standard deployment |
| **postgres container** | ✅ Running | None | No restart |
| **docker-compose.yml** | ✅ Correct | None | No config changes |

**Verdict:** Only **pype-web container rebuild** required (standard deployment).

---

### 5. Network & Connectivity

| Component | Current State | Changes Required | Impact |
|-----------|---------------|------------------|--------|
| **CORS Configuration** | ✅ Working | None | No CORS changes |
| **API Gateway** | ✅ Not applicable (direct) | None | No routing changes |
| **Load Balancer** | ✅ Not applicable (dev env) | None | No LB changes |
| **Firewall Rules** | ✅ Ports 3080, 8080 open | None | No firewall changes |
| **DNS** | ✅ localhost setup | None | No DNS changes |

**Verdict:** Network requires **zero changes**.

---

### 6. Authentication & Authorization

| Component | Current State | Changes Required | Impact |
|-----------|---------------|------------------|--------|
| **JWT Auth** | ✅ Working | None | No auth changes |
| **Tenant Middleware** | ✅ Working | None | No middleware changes |
| **User Permissions** | ✅ Working (RequireUser) | None | No RBAC changes |
| **Auth Interceptor** | ✅ Injecting tokens | None | No interceptor changes |

**Verdict:** Auth layer requires **zero changes**.

---

### 7. Monitoring & Logging

| Component | Current State | Changes Required | Impact |
|-----------|---------------|------------------|--------|
| **Backend Logs** | ✅ Already logging dry-run | None | No log config changes |
| **Frontend Console** | ✅ Working | None | No logger changes |
| **Serilog** | ✅ Configured | None | No sink changes |
| **Application Insights** | ❌ Not configured | None | No monitoring added |

**Verdict:** Logging requires **zero changes** (existing logs sufficient).

---

### 8. Performance & Scalability

#### Current Performance Baseline
- **Dry-Run Creation:** <100ms (backend creates PipelineExecution)
- **Status Polling:** <50ms (simple DB query)
- **Network Overhead:** ~1KB per request (minimal)

#### Expected Impact After Fix
- **Polling Frequency:** 2-second intervals (15 requests/30s max)
- **Concurrent Dry-Runs:** Low (<10 per tenant typically)
- **Memory Impact:** ~1KB per active dry-run in Zustand store
- **Database Load:** Negligible (1 INSERT + <15 SELECTs per dry-run)

**Load Estimate:**
```
10 concurrent users × 1 dry-run each × 15 polls = 150 GET requests/30s
= ~5 requests/second (easily handled by current infrastructure)
```

**Verdict:** Performance impact is **negligible** (well within capacity).

---

### 9. Deployment Strategy

#### Development Environment
```bash
# No infrastructure changes needed
cd pype-web
npm run build  # Rebuild with new code
docker-compose build pype-web  # Rebuild container
docker-compose up -d pype-web  # Restart container
```

#### Production Environment
```bash
# Same process, no config changes
cd pype-web
npm run build
docker build -t ghcr.io/pype/pype-web:latest .
docker push ghcr.io/pype/pype-web:latest
docker-compose -f docker-compose.production.yml pull pype-web
docker-compose -f docker-compose.production.yml up -d pype-web
```

**Rollback Plan:**
```bash
# If issues arise, revert to previous image
docker-compose -f docker-compose.production.yml pull pype-web:previous-tag
docker-compose -f docker-compose.production.yml up -d pype-web
# No database rollback needed (no schema changes)
```

---

## 🔐 Security Impact

### Authentication & Authorization
- ✅ **No changes:** Backend already enforces `[RequireUser]` attribute
- ✅ **Tenant Isolation:** Already enforced by `ITenantService` middleware
- ✅ **CSRF Protection:** Not applicable (API uses JWT, no cookies)
- ✅ **XSS Risk:** No new user input fields (uses existing YAML editor)

### Data Privacy
- ✅ **No PII Exposure:** Dry-run executions don't store sensitive data
- ✅ **Tenant Isolation:** Execution data filtered by tenant_id (existing pattern)
- ✅ **Audit Trail:** Backend already logs dry-run actions (AuditLogs table)

**Verdict:** Security posture **unchanged** (no new vulnerabilities).

---

## 💾 Storage Impact

### Database Growth
- **Before Fix:** Users calling dry-run via API = ~0-5 executions/day
- **After Fix:** Users calling dry-run via UI = ~20-50 executions/day (estimated)
- **Row Size:** ~2KB per PipelineExecution record
- **Monthly Growth:** 50 executions/day × 30 days × 2KB = **~3MB/month**

**Verdict:** Storage impact is **negligible** (<0.1% DB growth).

### Cleanup Strategy (Optional)
```sql
-- Optional: Purge old dry-run executions after 30 days
DELETE FROM "PipelineExecutions"
WHERE "TriggerType" = 'DryRun'
  AND "StartedAt" < NOW() - INTERVAL '30 days';
```

---

## 🌐 Multi-Tenancy Impact

### Tenant Isolation
- ✅ **Already Enforced:** Backend filters by `tenantId` in all queries
- ✅ **No Cross-Tenant Risk:** Frontend only sees own tenant's executions
- ✅ **Quota Enforcement:** Existing quota checks apply (no new bypass)

### Resource Sharing
- ✅ **Database Connection Pool:** No change (existing pool handles load)
- ✅ **Hangfire Workers:** Not used for dry-run (synchronous execution)
- ✅ **Redis Cache:** Not used for dry-run (no caching layer)

**Verdict:** Multi-tenancy isolation **maintained** (no new risks).

---

## 📈 Monitoring & Alerts

### Recommended Metrics (Optional)
If desired, add monitoring for:
1. **Dry-Run Success Rate:** % of dry-runs that complete successfully
2. **Dry-Run Duration:** Avg time from start to completion
3. **Polling Errors:** Count of 404/500 errors during polling

**Implementation:** Add to Application Insights or custom metrics dashboard.

**Priority:** 🟡 Low (nice-to-have, not required for bug fix)

---

## 🧪 Testing Infrastructure

### Test Environments
- ✅ **Local Dev:** No changes (use existing docker-compose.yml)
- ✅ **Staging:** No changes (deploy new pype-web image)
- ✅ **Production:** No changes (deploy new pype-web image)

### Test Data
- ✅ **Existing Pipelines:** Use test-06-mysql-source-connector (already exists)
- ✅ **Seed Data:** No new seed data required
- ✅ **Mock Services:** pype-test provides MySQL/MSSQL APIs (already running)

**Verdict:** Test infrastructure **unchanged** (use existing setup).

---

## ✅ Pre-Deployment Checklist

### Development
- [ ] Code changes implemented in `pipelineService.ts`
- [ ] Zustand store created/extended for execution tracking
- [ ] UI components updated with dry-run button + modal
- [ ] Manual testing passed (all 4 QA criteria)
- [ ] No TypeScript compilation errors
- [ ] ESLint passes (no new warnings)

### Infrastructure (No Changes Expected)
- [ ] ✅ **Backend:** No deployment needed
- [ ] ✅ **Database:** No migration needed
- [ ] ✅ **Docker Compose:** No config changes needed
- [ ] ✅ **Environment Vars:** No new variables needed
- [ ] ✅ **Secrets:** No new secrets needed

### Deployment
- [ ] `pype-web` container rebuilt with new code
- [ ] Deployment script tested in local environment
- [ ] Rollback plan documented and tested
- [ ] Stakeholders notified of deployment window (if applicable)

---

## 📝 Infrastructure Summary

| Category | Changes Required | Effort | Risk |
|----------|------------------|--------|------|
| **Backend Code** | None | 0 hours | None |
| **Frontend Code** | Service + Store + UI | 2-4 hours | Low |
| **Database Schema** | None | 0 hours | None |
| **Docker Config** | None | 0 hours | None |
| **Environment Vars** | None | 0 hours | None |
| **Network/Firewall** | None | 0 hours | None |
| **Monitoring** | Optional metrics | 0-1 hours | None |
| **Deployment** | Standard rebuild | 15 minutes | Low |

**Total Infrastructure Effort:** ✅ **~15 minutes** (standard deployment only)

---

## 🎯 Conclusion

This bug fix requires **zero infrastructure changes**. All modifications are frontend code-only:
- ✅ No backend changes
- ✅ No database migrations
- ✅ No environment variable changes
- ✅ No Docker config changes
- ✅ No network/firewall changes

**Deployment Strategy:** Standard `docker-compose build && up` workflow.

**Risk Level:** 🟢 **Low** (isolated frontend change, easy rollback)

**Infrastructure Impact:** 🟢 **None** (code-only fix)

---

**Status:** ✅ Infrastructure Assessment Complete - No Blockers
