# IMP-011 Frontend - Architecture Documentation

**Navigation Index**

## 📚 Documentation Structure

### Business Layer
- [IMP-011-mensagens-erro-frontend.md](../01-business/IMP-011-mensagens-erro-frontend.md) - User Story com critérios Gherkin

### Architecture Layer (Current)
- [IMP-011-frontend-architecture.md](IMP-011-frontend-architecture.md) - **Especificação Técnica Completa**
- [IMP-011-impact-analysis.md](IMP-011-impact-analysis.md) - Análise de Impacto e Riscos
- [IMP-011-architecture-decisions.md](IMP-011-architecture-decisions.md) - Architecture Decision Records (ADRs)
- [IMP-011-executive-summary.md](IMP-011-executive-summary.md) - Resumo Executivo (5 min read)

### Development Layer
- Implementation code in `src/components/errors/`
- Integration in `src/lib/api-client.ts`
- Tests in `src/__tests__/components/errors/`

### QA Layer
- QA validation report (to be created)
- E2E Gherkin test scenarios

---

## 🎯 Quick Links

**Backend Dependency**: [pype-admin#151](https://github.com/daniel-buona/pype-admin/pull/151) (✅ Merged)  
**API Contract**: `ErrorResponseDto` (RFC 7807-inspired)  
**Frontend Branch**: `feature/imp-011-frontend-error-display`

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    PYPE WEB (Next.js 16)                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           UI Components (React)                  │  │
│  │  ┌────────────┐  ┌──────────────────────────┐   │  │
│  │  │ErrorDisplay│  │ PipelineEditor (Monaco)  │   │  │
│  │  │  Component │  │  + YAMLErrorProvider     │   │  │
│  │  └────────────┘  └──────────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │    ExecutionTimeline Component             │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                         ▲                               │
│                         │                               │
│  ┌──────────────────────┴───────────────────────────┐  │
│  │      Custom Hooks (useErrorHandler)              │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │   API Client (Axios + Interceptors)              │  │
│  │   - ErrorResponseDto Parser                      │  │
│  │   - Auto-retry logic                             │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │
                          ▼ HTTP/REST
                ┌─────────────────────┐
                │  PYPE ADMIN API     │
                │  (ErrorResponseDto) │
                └─────────────────────┘
```

---

## 🔑 Key Architectural Decisions

1. **Component Library**: Usar componentes nativos (sem shadcn/ui adicional) + Tailwind
2. **State Management**: Zustand para error state global
3. **Toast Notifications**: react-hot-toast (já instalado)
4. **Monaco Integration**: Validação assíncrona via `@monaco-editor/react`
5. **Error Parsing**: Centralizado no interceptor do apiClient

---

## 📦 Dependencies Status

| Package | Current | Required | Status |
|---------|---------|----------|--------|
| axios | ✅ 1.6.2 | >= 1.6.0 | OK |
| react-hot-toast | ✅ 2.6.0 | >= 2.0.0 | OK |
| @monaco-editor/react | ✅ 4.7.0 | >= 4.0.0 | OK |
| lucide-react | ✅ 0.553.0 | >= 0.400.0 | OK |
| zustand | ✅ 4.4.7 | >= 4.0.0 | OK |
| zod | ✅ 3.22.4 | >= 3.0.0 | OK |

**Conclusão**: ✅ Nenhuma dependência adicional necessária

---

## 🚀 Implementation Phases

**Fase 1**: Error Display Component (2h)  
**Fase 2**: useErrorHandler Hook + apiClient Integration (1h)  
**Fase 3**: Monaco Editor Integration (2h)  
**Fase 4**: ExecutionTimeline Component (2h)  
**Fase 5**: Tests + Gherkin Validation (2h)

**Total Estimado**: 9h (~1 dia útil)

---

**Status**: 📝 In Review  
**Architect**: GitHub Copilot  
**Date**: 2026-01-23
