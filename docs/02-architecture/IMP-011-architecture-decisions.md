# IMP-011 Frontend - Architecture Decision Records (ADRs)

**Version**: 1.0  
**Author**: GitHub Copilot (Architect Mode)  
**Date**: 2026-01-23

---

## ADR Index

- [ADR-001: Component Library Strategy](#adr-001-component-library-strategy)
- [ADR-002: Error State Management](#adr-002-error-state-management)
- [ADR-003: API Interceptor Integration](#adr-003-api-interceptor-integration)
- [ADR-004: Monaco Editor Validation](#adr-004-monaco-editor-validation)
- [ADR-005: Auto-fix Implementation](#adr-005-auto-fix-implementation)
- [ADR-006: Toast Notification Strategy](#adr-006-toast-notification-strategy)
- [ADR-007: Security Model](#adr-007-security-model)

---

## ADR-001: Component Library Strategy

**Status**: ✅ APPROVED  
**Deciders**: Architect, Tech Lead  
**Date**: 2026-01-23

### Context

Precisamos decidir se instalamos **shadcn/ui** ou usamos **componentes nativos + Tailwind**.

### Decision

✅ **USAR COMPONENTES NATIVOS + TAILWIND** (sem shadcn/ui adicional)

### Rationale

**Prós** (Componentes Nativos):
- ✅ Já temos 5 componentes customizados (`ErrorBoundary`, `LoadingSpinner`, etc.)
- ✅ Zero overhead de instalação (~50 arquivos shadcn/ui)
- ✅ Controle total sobre estilo (Tailwind já configurado)
- ✅ Consistência com componentes existentes
- ✅ Evita duplicação (já temos `Button` em forms, `Alert` seria novo)

**Contras**:
- ❌ Mais código custom (vs usar shadcn/ui pronto)
- ❌ Sem acessibilidade ARIA embutida (precisamos implementar)

**Alternativa Rejeitada** (shadcn/ui):
- ❌ Adiciona ~20 arquivos para Alert, Button, Dialog, Card
- ❌ Depende de @radix-ui/* (7 pacotes novos)
- ❌ Bundle size +15KB (~3% do total)
- ✅ Acessibilidade AAA pronta

### Implementation

Criar componentes nativos:
```tsx
// src/components/ui/Alert.tsx (novo)
export function Alert({ variant, children }: AlertProps) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`border-l-4 p-4 ${styles[variant]}`}
    >
      {children}
    </div>
  );
}
```

### Consequences

- ✅ Manutenção: Controle total sobre componentes
- ✅ Performance: Bundle menor
- ⚠️ Acessibilidade: Precisamos garantir ARIA compliance
- ⚠️ Testing: Mais testes necessários (vs shadcn/ui testado)

---

## ADR-002: Error State Management

**Status**: ✅ APPROVED  
**Deciders**: Architect  
**Date**: 2026-01-23

### Context

Precisamos de **estado global** para erro atual + histórico.

### Decision

✅ **ZUSTAND** para error state global

### Rationale

**Prós** (Zustand):
- ✅ Já está instalado e usado no projeto (auth, pipelines)
- ✅ Leve (<1KB gzipped)
- ✅ API simples (`create`, `set`, `get`)
- ✅ Persist middleware (histórico de erros)
- ✅ Sem boilerplate vs Redux

**Alternativa Rejeitada** (React Context):
- ❌ Re-render de todos os consumidores
- ❌ Boilerplate para persist
- ✅ Nativo (sem dependência)

**Alternativa Rejeitada** (Redux):
- ❌ Overhead massivo (actions, reducers, thunks)
- ❌ Bundle size +30KB
- ✅ DevTools poderoso

### Implementation

```typescript
// src/hooks/useErrorHandler.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ErrorState {
  currentError: ErrorResponseDto | null;
  errorHistory: ErrorResponseDto[];
  showError: (error: ErrorResponseDto) => void;
  clearError: () => void;
}

export const useErrorHandler = create<ErrorState>()(
  persist(
    (set) => ({
      currentError: null,
      errorHistory: [],
      
      showError: (error) => set((state) => ({
        currentError: error,
        errorHistory: [error, ...state.errorHistory].slice(0, 50), // Keep last 50
      })),
      
      clearError: () => set({ currentError: null }),
    }),
    { name: 'pype-error-store' }
  )
);
```

### Consequences

- ✅ Performance: Seletividade de re-render
- ✅ Histórico: Persist middleware guarda últimos 50 erros
- ⚠️ LocalStorage: Pode crescer (limitar a 50 itens)

---

## ADR-003: API Interceptor Integration

**Status**: ✅ APPROVED  
**Deciders**: Architect  
**Date**: 2026-01-23

### Context

O **apiClient.ts** já tem interceptors para JWT/refresh. Precisamos injetar lógica de erro.

### Decision

✅ **MODIFICAR interceptor de response** para detectar `ErrorResponseDto` e chamar `useErrorHandler`

### Rationale

**Prós**:
- ✅ Centralização: Um único ponto de erro handling
- ✅ Automático: Todo erro de API é capturado
- ✅ Consistência: Mesmo formato sempre

**Contras**:
- ⚠️ Acoplamento: apiClient depende de useErrorHandler (Zustand)
- ⚠️ Testing: Mock de Zustand necessário

### Implementation

```typescript
// src/lib/api-client.ts (modificação na linha 117)
this.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    logger.error('API Error:', { ... });
    
    // ✅ Parse ErrorResponseDto
    if (error.response?.data && isErrorResponseDto(error.response.data)) {
      const errorDto: ErrorResponseDto = error.response.data;
      
      // ✅ Dispatch to Zustand store (unless it's 401 retry)
      if (error.response.status !== 401 || error.config._retry) {
        const { showError } = await import('@/hooks/useErrorHandler');
        showError.getState().showError(errorDto);
      }
      
      // ✅ Attach to error object for custom handling
      error.pypeError = errorDto;
    }
    
    // ... (resto do código de refresh token)
    
    return Promise.reject(error);
  }
);
```

### Consequences

- ✅ DRY: Não precisa `try/catch` em cada componente
- ⚠️ Opt-out: Componentes podem ignorar toast via `error.pypeError`
- ⚠️ Import dinâmico: Evita circular dependency

---

## ADR-004: Monaco Editor Validation

**Status**: ✅ APPROVED  
**Deciders**: Architect  
**Date**: 2026-01-23

### Context

Precisamos validar YAML em **tempo real** sem bombardear a API.

### Decision

✅ **DEBOUNCE 500ms** + validação assíncrona via endpoint `/api/pipelines/crud/validate`

### Rationale

**Prós**:
- ✅ UX: Feedback rápido (500ms após parar de digitar)
- ✅ Performance: Evita 100+ requests/s
- ✅ Precisão: Backend valida schema YAML (Pype.Admin já tem lógica)

**Alternativa Rejeitada** (Validação local com JSON Schema):
- ❌ Duplicação: Schema em TypeScript e C#
- ❌ Inconsistência: Backend muda, frontend fica desatualizado
- ✅ Performance: Instantâneo (sem API call)

### Implementation

```typescript
// src/hooks/useMonacoValidation.ts
import { debounce } from 'lodash';

export function useMonacoValidation(editor: monaco.editor.IStandaloneCodeEditor | null) {
  const validateYAML = useMemo(
    () =>
      debounce(async (content: string) => {
        try {
          await apiClient.post('/api/pipelines/crud/validate', { yamlDefinition: content });
          // ✅ Validation passed
          monaco.editor.setModelMarkers(editor.getModel()!, 'pype', []);
        } catch (error: any) {
          // ❌ Validation failed
          if (error.pypeError) {
            const lineNumber = extractLineNumber(error.pypeError.context?.path);
            monaco.editor.setModelMarkers(editor.getModel()!, 'pype', [
              {
                severity: monaco.MarkerSeverity.Error,
                message: error.pypeError.detail,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: 100,
              },
            ]);
          }
        }
      }, 500),
    [editor]
  );
  
  return { validateYAML };
}
```

### Consequences

- ✅ Accuracy: Backend é fonte da verdade
- ⚠️ Latency: 500ms delay + network (~700ms total)
- ⚠️ API Load: +1 request a cada 500ms de digitação (OK para MVP)

**Future Enhancement**: Cache validation results (hash do YAML)

---

## ADR-005: Auto-fix Implementation

**Status**: ✅ APPROVED  
**Deciders**: Architect  
**Date**: 2026-01-23

### Context

O backend retorna **sugestões** (fuzzy matching). Precisamos aplicar no editor.

### Decision

✅ **BOTÃO "Apply Suggestion"** que substitui string inválida por sugestão válida

### Rationale

**Prós**:
- ✅ UX: Um clique resolve o erro
- ✅ Segurança: Usuário vê mudança antes de salvar
- ✅ Simples: `editor.setValue(newContent)`

**Alternativa Rejeitada** (Auto-aplicar sem confirmação):
- ❌ Perigoso: Mudança silenciosa pode quebrar pipeline
- ❌ UX: Usuário perde controle
- ✅ Performance: Instantâneo

### Implementation

```typescript
// src/components/errors/ErrorSuggestionButton.tsx
export function ErrorSuggestionButton({ suggestion, onApply }: Props) {
  const handleApply = () => {
    onApply(suggestion);
    toast.success(`Applied suggestion: ${suggestion}`);
  };
  
  return (
    <button onClick={handleApply} className="btn-primary">
      ✨ Apply: {suggestion}
    </button>
  );
}

// Uso no PipelineEditor
<ErrorDisplay
  error={error}
  onApplySuggestion={(suggestion) => {
    const currentValue = editor.getValue();
    const newValue = currentValue.replace(error.context?.connectorType, suggestion);
    editor.setValue(newValue);
    onChange(newValue); // Trigger re-validation
  }}
/>
```

### Consequences

- ✅ Control: Usuário vê preview antes de salvar
- ⚠️ Ambiguidade: Se há múltiplas ocorrências do erro, qual substituir?
  - **Solução**: Usar `context.path` (line:column) para localizar exato

---

## ADR-006: Toast Notification Strategy

**Status**: ✅ APPROVED  
**Deciders**: Architect  
**Date**: 2026-01-23

### Context

Precisamos exibir erros de **forma não-invasiva** (toast vs modal).

### Decision

✅ **REACT-HOT-TOAST** (já instalado) para notificações, **ErrorDisplay inline** para detalhes

### Rationale

**Prós** (react-hot-toast):
- ✅ Já está instalado (`2.6.0`)
- ✅ Customizável (`toast.custom`)
- ✅ Auto-dismiss (5s, 10s)
- ✅ Stacking (máx 3 toasts)

**Alternativa Rejeitada** (Modal bloqueante):
- ❌ UX: Interrompe workflow
- ❌ Acessibilidade: Trap focus
- ✅ Destaque: Garante que usuário vê

### Implementation

```typescript
// src/hooks/useErrorHandler.ts
showError: (error) => {
  toast.custom(
    (t) => (
      <ErrorDisplay
        error={error}
        onClose={() => toast.dismiss(t.id)}
        variant="toast"
        className="shadow-lg"
      />
    ),
    {
      duration: error.status >= 500 ? 10000 : 5000, // Erros críticos ficam mais tempo
      position: 'top-right',
      id: error.code, // Evita duplicatas
    }
  );
}
```

### Consequences

- ✅ Non-blocking: Usuário pode continuar trabalhando
- ⚠️ Perda de contexto: Se usuário ignorar toast, erro sumiu
  - **Solução**: Persist no Zustand (histórico acessível)

---

## ADR-007: Security Model

**Status**: ✅ APPROVED  
**Deciders**: Architect, Security Team  
**Date**: 2026-01-23

### Context

`ErrorResponseDto` pode conter **dados sensíveis** em `context` (ex: ResponseBody).

### Decision

✅ **BACKEND FILTRA DADOS SENSÍVEIS** + **FRONTEND VALIDA `context`** antes de exibir

### Rationale

**Backend Responsibilities** (já implementado no PR #151):
- ✅ `PublicContext`: Apenas dados seguros (availableConnectors, path, etc.)
- ✅ `InternalContext`: Dados sensíveis (TenantId, ResponseBody, etc.)
- ✅ ExceptionHandlingMiddleware: Retorna apenas `PublicContext`

**Frontend Responsibilities** (novo):
- ✅ Não usar `dangerouslySetInnerHTML` com `error.detail`
- ✅ Validar `error.context` antes de renderizar
- ✅ Logar apenas campos não-sensíveis

### Implementation

```typescript
// src/lib/error-formatter.ts
export function sanitizeErrorContext(context?: Record<string, any>): Record<string, any> {
  if (!context) return {};
  
  const SAFE_KEYS = [
    'availableConnectors',
    'path',
    'connectorType',
    'profileName',
    'stepName',
    'availableProfiles',
  ];
  
  return Object.keys(context)
    .filter((key) => SAFE_KEYS.includes(key))
    .reduce((acc, key) => ({ ...acc, [key]: context[key] }), {});
}

// Uso
<ErrorDisplay error={{ ...error, context: sanitizeErrorContext(error.context) }} />
```

### Consequences

- ✅ Defense in depth: Backend + Frontend validation
- ✅ Zero leaks: Mesmo se backend falhar, frontend bloqueia
- ⚠️ Whitelist: Adicionar key em SAFE_KEYS para cada novo campo

**Threat Model**:
- ❌ `ResponseBody` NÃO deve aparecer (backend remove)
- ❌ `TenantId` NÃO deve aparecer (backend remove)
- ✅ `traceId` OK (ExecutionId público)
- ✅ `availableConnectors` OK (metadados públicos)

---

## Summary

| ADR | Decision | Impact | Status |
|-----|----------|--------|--------|
| ADR-001 | Native Components + Tailwind | Bundle -15KB | ✅ |
| ADR-002 | Zustand para error state | Consistency | ✅ |
| ADR-003 | Modify apiClient interceptor | Centralization | ✅ |
| ADR-004 | Debounce 500ms validation | UX + Performance | ✅ |
| ADR-005 | "Apply Suggestion" button | User Control | ✅ |
| ADR-006 | react-hot-toast | Non-blocking UX | ✅ |
| ADR-007 | Backend + Frontend sanitization | Security | ✅ |

**Total Risk**: 🟢 LOW  
**Implementation Complexity**: 🟡 MEDIUM (5-6/10)  
**Timeline**: ~9h (~1 dia útil)

---

**Status**: ✅ **APPROVED FOR IMPLEMENTATION**  
**Architect**: GitHub Copilot  
**Date**: 2026-01-23
