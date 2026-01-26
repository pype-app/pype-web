# REFACTOR-001: Type Guards para Error Handling

**Priority:** 🟡 Low (Technical Debt)  
**Category:** Code Quality  
**Component:** Frontend - Error Handling  
**Effort:** 1-2 hours  
**Created:** 2026-01-25  
**Source:** Code Review BUG-003

---

## 📋 Description

Durante code review do BUG-003, identificamos uso de `any` em error handling devido à falta de type guards para validar estrutura de erros retornados pela API.

**Current Code:**
```typescript
// src/hooks/useDryRun.ts linha ~270
const errorData = err.response?.data
if (errorData?.errors && Array.isArray(errorData.errors)) {
  const details = errorData.errors.map((e: any) =>  // ⚠️ Uso de 'any'
    `  • ${e.path || 'Unknown'}: ${e.message || 'Validation error'}`
  ).join('\n')
}
```

**Issue:**
- TypeScript não conhece a estrutura de `errorData.errors[i]`
- Força uso de `any` para acessar campos `.path` e `.message`
- Defensive programming com `||` funciona, mas não é type-safe

---

## 🎯 Proposed Solution

Utilizar type guard `isErrorResponseDto` que já existe em `@/lib/error-formatter`.

**Improved Code:**
```typescript
import { isErrorResponseDto } from '@/lib/error-formatter'

const errorData = err.response?.data
if (isErrorResponseDto(errorData)) {
  // TypeScript agora sabe que errorData.errors tem tipo ValidationError[]
  const details = errorData.errors.map((e) =>  // ✅ Sem 'any'
    `  • ${e.path || 'Unknown'}: ${e.message || 'Validation error'}`
  ).join('\n')
}
```

---

## 📦 Scope

### Files to Modify
1. `src/hooks/useDryRun.ts` (linha ~270)
2. Outros hooks que fazem error handling similar (TBD - audit necessário)

### Tasks
- [ ] Audit: Grep workspace por `err.response?.data` para encontrar todos os casos
- [ ] Adicionar import de `isErrorResponseDto` onde necessário
- [ ] Substituir checks manuais por type guard
- [ ] Remover usos desnecessários de `any` em error handling
- [ ] Validar que error messages ainda funcionam corretamente

---

## ✅ Acceptance Criteria

### AC-01: Type Safety
- **Dado** que uma API retorna erro com validation errors
- **Quando** o código processa o erro
- **Então** TypeScript deve conhecer a estrutura de `errors[]` sem usar `any`

### AC-02: Backwards Compatibility
- **Dado** que código existente usa defensive programming (`?.` e `||`)
- **Quando** aplicamos type guards
- **Então** comportamento em runtime deve permanecer idêntico

### AC-03: Code Coverage
- **Dado** que múltiplos hooks podem ter error handling similar
- **Quando** auditamos o codebase
- **Então** todos os casos devem usar type guard consistentemente

---

## 🔍 Impact Assessment

### Severity
🟡 **Low** - Não é bug, é melhoria de code quality

### Risk
🟢 **Very Low**
- Mudança cosmética (não afeta runtime behavior)
- Type guard já existe e é testado
- Apenas remove `any`, não altera lógica

### Benefits
- ✅ Melhor IntelliSense (autocomplete de campos)
- ✅ Refactoring mais seguro (TypeScript detecta breaking changes)
- ✅ Menos `any` no codebase (melhora score de type coverage)

---

## 📚 Related Documentation

- **Code Review:** `docs/04-qa/BUG-003-code-review.md` (Observação OBS-01)
- **Error Formatter:** `src/lib/error-formatter.ts` (type guard existente)
- **Business Spec:** [IMP-011-mensagens-erro-frontend.md](../01-business/IMP-011-mensagens-erro-frontend.md)

---

## 🚀 Implementation Notes

### Example of `isErrorResponseDto` Usage
```typescript
// src/lib/error-formatter.ts (já existe)
export function isErrorResponseDto(data: any): data is ErrorResponseDto {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.message === 'string' &&
    Array.isArray(data.errors)
  );
}

export interface ErrorResponseDto {
  message: string
  errors: ValidationError[]
  statusCode: number
  timestamp?: string
}

export interface ValidationError {
  path: string
  message: string
  kind?: string
  suggestion?: string
}
```

### Audit Strategy
```bash
# Find all potential cases
grep -r "err.response?.data" src/
grep -r "error.response?.data" src/
grep -r "e: any" src/ | grep -i error
```

---

## ⏰ Timeline

**Estimated Effort:** 1-2 hours

- [ ] **30 min** - Audit codebase (find all error handling cases)
- [ ] **30 min** - Apply type guards to identified files
- [ ] **15 min** - Test error scenarios (validation error, network error, etc.)
- [ ] **15 min** - Update documentation if needed

---

**Priority:** 🟡 Low (Nice-to-have, not urgent)  
**Status:** 📋 Backlog  
**Assignee:** TBD
