# TASK-02: Hook useDryRun com Polling

**Prioridade**: ⭐ **ALTA - CRÍTICA**  
**Estimativa**: 3-4 horas  
**Status**: 🔴 Pendente  
**Dependências**: Nenhuma (COMEÇAR POR ESTA TASK)

---

## 📋 Objetivo

Criar hook React customizado para gerenciar todo o lifecycle do dry-run: iniciar execução, polling automático de status, e controle de estado.

**CRÍTICO**: Esta task é a fundação de toda a funcionalidade. Todos os componentes (DryRunButton, DryRunProgress, DryRunResultModal) dependem deste hook.

---

## 🎯 Critérios de Aceitação

- [ ] Hook `useDryRun` exportado e funcional
- [ ] Método `startDryRun(pipelineId, sampleSize)` enfileira dry-run
- [ ] Polling automático a cada 2 segundos após enfileirar
- [ ] Polling para quando status = 'completed' ou 'failed'
- [ ] Timeout de 5 minutos (300s) para evitar polling infinito
- [ ] Método `cancelPolling()` para cancelamento manual
- [ ] Estados expostos: `isLoading`, `isPolling`, `status`, `result`, `error`
- [ ] Interfaces TypeScript completas para tipos de dry-run
- [ ] Tratamento robusto de erros

---

## 📁 Arquivos a Criar

### 1. Criar: `src/types/dry-run.ts`

```typescript
/**
 * Status do dry-run retornado pelo endpoint de polling
 */
export interface DryRunStatus {
  id: string
  pipelineId: string
  pipelineName: string
  pipelineVersion: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  sampleSize: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  durationMs?: number
  triggeredBy?: string
  result?: DryRunResult
  errorMessage?: string
  errorStackTrace?: string
}

/**
 * Resultado completo do dry-run (incluído em DryRunStatus quando completed)
 */
export interface DryRunResult {
  pipelineName: string
  version: string
  success: boolean
  startedAt: string
  completedAt?: string
  durationMs?: number
  errorMessage?: string
  errorStackTrace?: string
  steps: DryRunStepResult[]
  totalSampleMessages: number
}

/**
 * Resultado de um step individual (source, transform, sink, etc)
 */
export interface DryRunStepResult {
  stepType: 'source' | 'transform' | 'validate' | 'sink' | 'auth'
  connectorType?: string
  success: boolean
  skipped: boolean
  message: string
  startedAt: string
  completedAt?: string
  durationMs?: number
  messageCount: number
  sampleData: any[]
  errorMessage?: string
  metadata?: Record<string, any>
}
```

---

### 2. Criar: `src/hooks/useDryRun.ts`

```typescript
import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api-client'
import { DryRunResult, DryRunStatus } from '@/types/dry-run'

interface UseDryRunReturn {
  startDryRun: (pipelineId: string, sampleSize: number) => Promise<void>
  result: DryRunResult | null
  status: DryRunStatus | null
  isLoading: boolean
  isPolling: boolean
  error: string | null
  cancelPolling: () => void
  resetState: () => void
}

/**
 * Hook customizado para gerenciar dry-run de pipelines
 * 
 * Workflow:
 * 1. startDryRun() → POST /pipelines/crud/{id}/dry-run
 * 2. Inicia polling automático a cada 2s
 * 3. GET /pipelines/crud/dry-runs/{id}
 * 4. Quando status = completed/failed → para polling
 * 5. Expõe result para exibição
 * 
 * @example
 * const { startDryRun, result, isPolling } = useDryRun()
 * 
 * await startDryRun('pipeline-123', 10)
 * // Polling automático inicia
 * 
 * if (result) {
 *   // Exibir resultado
 * }
 */
export function useDryRun(): UseDryRunReturn {
  const [dryRunId, setDryRunId] = useState<string | null>(null)
  const [status, setStatus] = useState<DryRunStatus | null>(null)
  const [result, setResult] = useState<DryRunResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTimeRef = useRef<number | null>(null)
  
  /**
   * Inicia execução de dry-run
   * POST /pipelines/crud/{id}/dry-run?sampleSize={n}
   * Retorna 202 Accepted com dryRunId
   */
  const startDryRun = useCallback(async (pipelineId: string, sampleSize: number) => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setStatus(null)
    
    try {
      const response = await apiClient.post(
        `/pipelines/crud/${pipelineId}/dry-run?sampleSize=${sampleSize}`
      )
      
      const { dryRunId } = response.data
      
      if (!dryRunId) {
        throw new Error('Backend did not return dryRunId')
      }
      
      setDryRunId(dryRunId)
      setIsPolling(true)
      pollingStartTimeRef.current = Date.now()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message ||
                          'Failed to start dry-run'
      setError(errorMessage)
      console.error('startDryRun error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  /**
   * Polling automático do status
   * GET /pipelines/crud/dry-runs/{id}
   */
  useEffect(() => {
    if (!dryRunId || !isPolling) return
    
    const poll = async () => {
      try {
        // Verificar timeout (5 minutos)
        if (pollingStartTimeRef.current) {
          const elapsed = Date.now() - pollingStartTimeRef.current
          if (elapsed > 5 * 60 * 1000) {
            setError('Dry-run timeout after 5 minutes')
            setIsPolling(false)
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
            }
            return
          }
        }
        
        const response = await apiClient.get(`/pipelines/crud/dry-runs/${dryRunId}`)
        const data: DryRunStatus = response.data
        
        setStatus(data)
        
        // Parar polling se status final
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
          setResult(data.result || null)
          setIsPolling(false)
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          
          // Capturar erro se failed
          if (data.status === 'failed') {
            setError(data.errorMessage || 'Dry-run failed')
          }
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 
                            err.response?.data?.message || 
                            err.message ||
                            'Failed to poll dry-run status'
        setError(errorMessage)
        setIsPolling(false)
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        
        console.error('polling error:', err)
      }
    }
    
    // Poll inicial imediato
    poll()
    
    // Polling a cada 2 segundos
    pollingIntervalRef.current = setInterval(poll, 2000)
    
    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [dryRunId, isPolling])
  
  /**
   * Cancelar polling manualmente
   */
  const cancelPolling = useCallback(() => {
    setIsPolling(false)
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])
  
  /**
   * Resetar todo o estado do hook
   */
  const resetState = useCallback(() => {
    cancelPolling()
    setDryRunId(null)
    setStatus(null)
    setResult(null)
    setError(null)
    pollingStartTimeRef.current = null
  }, [cancelPolling])
  
  return {
    startDryRun,
    result,
    status,
    isLoading,
    isPolling,
    error,
    cancelPolling,
    resetState
  }
}
```

---

## 🔧 Dependências

### API Client
Verificar que `src/lib/api-client.ts` está configurado corretamente:
- Interceptor de autenticação (JWT)
- Base URL configurada
- Tratamento de erros 401/403

```typescript
// Exemplo de configuração esperada
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## ✅ Checklist de Implementação

### Setup
- [ ] Criar arquivo `src/types/dry-run.ts`
- [ ] Definir interface `DryRunStatus`
- [ ] Definir interface `DryRunResult`
- [ ] Definir interface `DryRunStepResult`
- [ ] Criar arquivo `src/hooks/useDryRun.ts`

### Lógica do Hook
- [ ] Implementar método `startDryRun`
- [ ] Implementar polling automático no useEffect
- [ ] Implementar timeout de 5 minutos
- [ ] Implementar método `cancelPolling`
- [ ] Implementar método `resetState`
- [ ] Adicionar limpeza de interval no cleanup do useEffect

### Estados
- [ ] Estado `dryRunId` (string | null)
- [ ] Estado `status` (DryRunStatus | null)
- [ ] Estado `result` (DryRunResult | null)
- [ ] Estado `isLoading` (boolean)
- [ ] Estado `isPolling` (boolean)
- [ ] Estado `error` (string | null)

### Tratamento de Erros
- [ ] Try/catch em startDryRun
- [ ] Try/catch em polling
- [ ] Mensagens de erro amigáveis
- [ ] Logging de erros no console
- [ ] Parar polling em caso de erro

### Refs
- [ ] Usar useRef para interval (evitar stale closure)
- [ ] Usar useRef para tempo de início do polling (timeout)
- [ ] Limpar refs no cleanup

### TypeScript
- [ ] Tipar todos os parâmetros
- [ ] Tipar todos os estados
- [ ] Tipar response das APIs
- [ ] Interface `UseDryRunReturn` completa

---

## 🧪 Testes Manuais

### Cenário 1: Dry-run bem-sucedido
1. Chamar `startDryRun('pipeline-id', 10)`
2. Verificar que `isLoading = true` → `false`
3. Verificar que `isPolling = true`
4. Aguardar polling (verificar console para requests GET)
5. Quando backend retornar `status: 'completed'`:
   - `isPolling = false`
   - `result != null`
   - `error = null`

### Cenário 2: Dry-run falhado
1. Chamar `startDryRun` com pipeline inválido
2. Verificar que `error` é definido
3. Verificar que `isPolling = false`

### Cenário 3: Timeout
1. Mock backend para nunca completar
2. Aguardar 5 minutos
3. Verificar que `error = 'Dry-run timeout after 5 minutes'`
4. Verificar que polling parou

### Cenário 4: Cancelamento manual
1. Iniciar dry-run
2. Chamar `cancelPolling()`
3. Verificar que `isPolling = false`
4. Verificar que polling parou (não mais requests)

---

## 📊 Flow Diagram

```
startDryRun(pipelineId, sampleSize)
    ↓
isLoading = true
    ↓
POST /pipelines/crud/{pipelineId}/dry-run?sampleSize={n}
    ↓
← { dryRunId: "abc-123" }
    ↓
isLoading = false
isPolling = true
dryRunId = "abc-123"
    ↓
[useEffect triggered - polling starts]
    ↓
GET /pipelines/crud/dry-runs/abc-123
    ↓
← { status: 'pending', ... }
    ↓
setStatus(...)
    ↓
[Wait 2s]
    ↓
GET /pipelines/crud/dry-runs/abc-123
    ↓
← { status: 'running', ... }
    ↓
setStatus(...)
    ↓
[Wait 2s]
    ↓
GET /pipelines/crud/dry-runs/abc-123
    ↓
← { status: 'completed', result: {...} }
    ↓
setStatus(...)
setResult(...)
isPolling = false
clearInterval()
    ↓
[Components can now display result]
```

---

## 🚀 Próximas Tasks

Após completar este hook, ele será usado por:
1. **[TASK-01](./TASK-01.md)**: DryRunButton (usa `startDryRun`, `isLoading`, `error`)
2. **[TASK-04](./TASK-04.md)**: DryRunProgress (usa `isPolling`, `status`)
3. **[TASK-03](./TASK-03.md)**: DryRunResultModal (usa `result`)

---

## 📚 Referências

- **Backend Endpoints**: [Pipelines.Crud.Endpoints.cs](../../../../pype-admin/src/Pype.Admin/Routes/Pipelines.Crud.Endpoints.cs)
- **Arquitetura**: [DRY-RUN-ARCHITECTURE.md](../../../../pype-admin/docs/architecture/DRY-RUN-ARCHITECTURE.md)
- **React Hooks**: https://react.dev/reference/react/hooks

---

**Criado em**: 2026-01-21  
**Atualizado em**: 2026-01-21
