# TASK-05: Integração e Fluxo Completo

**Prioridade**: ALTA  
**Estimativa**: 2-3 horas  
**Status**: 🔴 Pendente  
**Dependências**: 
- [TASK-01](./TASK-01.md) (DryRunButton)
- [TASK-02](./TASK-02.md) (useDryRun)
- [TASK-03](./TASK-03.md) (DryRunResultModal)
- [TASK-04](./TASK-04.md) (DryRunProgress)

---

## 📋 Objetivo

Integrar todos os componentes criados nas tasks anteriores para criar o fluxo end-to-end completo da funcionalidade de dry-run. Esta task conecta todos os pontos e garante que o workflow funcione perfeitamente.

---

## 🎯 Critérios de Aceitação

- [ ] Fluxo completo funcional: Botão → Config → Progress → Results
- [ ] Tratamento de erros com toast notifications
- [ ] Modal de resultado abre automaticamente quando polling termina
- [ ] Botão "Execute Pipeline" funcional no modal de resultados
- [ ] Estados gerenciados corretamente (sem memory leaks)
- [ ] Loading states em todos os pontos
- [ ] Navegação entre modals (config → progress → results) fluída

---

## 📁 Arquivos a Modificar

### 1. Modificar: `src/app/(dashboard)/pipelines/[id]/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Edit, Settings } from 'lucide-react'

// Dry-Run Components
import { DryRunButton } from '@/components/pipelines/DryRunButton'
import { DryRunProgress } from '@/components/pipelines/DryRunProgress'
import { DryRunResultModal } from '@/components/pipelines/DryRunResultModal'
import { useDryRun } from '@/hooks/useDryRun'
import { useToast } from '@/hooks/use-toast'

// Outros componentes existentes...

export default function PipelineDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Estado do pipeline (carregado da API)
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(true)
  
  // Hook de dry-run
  const { 
    result, 
    status, 
    isPolling, 
    error: dryRunError,
    cancelPolling,
    resetState
  } = useDryRun()
  
  // Estado do modal de resultados
  const [showResultModal, setShowResultModal] = useState(false)
  
  // Carregar dados do pipeline
  useEffect(() => {
    async function loadPipeline() {
      try {
        const response = await apiClient.get(`/pipelines/crud/${params.id}`)
        setPipeline(response.data)
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to load pipeline',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingPipeline(false)
      }
    }
    
    loadPipeline()
  }, [params.id, toast])
  
  // Quando polling terminar, abrir modal de resultado
  useEffect(() => {
    if (result && !isPolling) {
      setShowResultModal(true)
      
      // Notificação de sucesso/erro
      toast({
        title: result.success ? 'Test Run Completed' : 'Test Run Failed',
        description: result.success 
          ? `${result.totalSampleMessages} messages processed successfully`
          : result.errorMessage || 'Check results for details',
        variant: result.success ? 'default' : 'destructive'
      })
    }
  }, [result, isPolling, toast])
  
  // Tratar erros do dry-run
  useEffect(() => {
    if (dryRunError) {
      toast({
        title: 'Dry-Run Error',
        description: dryRunError,
        variant: 'destructive'
      })
    }
  }, [dryRunError, toast])
  
  // Executar pipeline de verdade (após dry-run bem-sucedido)
  const handleExecutePipeline = async () => {
    try {
      await apiClient.post(`/pipelines/crud/${params.id}/execute`)
      
      toast({
        title: 'Pipeline Execution Started',
        description: 'Pipeline is now running in production mode'
      })
      
      // Navegar para página de execuções
      router.push(`/pipelines/${params.id}/executions`)
    } catch (err: any) {
      toast({
        title: 'Execution Failed',
        description: err.response?.data?.error || 'Failed to start pipeline',
        variant: 'destructive'
      })
    }
  }
  
  // Fechar modal e limpar estado
  const handleCloseResultModal = () => {
    setShowResultModal(false)
    resetState() // Limpar estado do dry-run
  }
  
  if (isLoadingPipeline) {
    return <div>Loading...</div>
  }
  
  if (!pipeline) {
    return <div>Pipeline not found</div>
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{pipeline.name}</h1>
          <p className="text-muted-foreground mt-1">{pipeline.description}</p>
        </div>
        <Badge variant={pipeline.enabled ? 'default' : 'secondary'}>
          {pipeline.enabled ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      
      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          {/* Botão de Dry-Run */}
          <DryRunButton
            pipelineId={params.id}
            pipelineName={pipeline.name}
            disabled={!pipeline.enabled}
          />
          
          {/* Botão de Execução Normal */}
          <Button
            onClick={handleExecutePipeline}
            disabled={!pipeline.enabled}
          >
            <Play className="mr-2 h-4 w-4" />
            Execute
          </Button>
          
          {/* Botão de Edição */}
          <Button
            variant="outline"
            onClick={() => router.push(`/pipelines/${params.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          
          {/* Botão de Settings */}
          <Button
            variant="outline"
            onClick={() => router.push(`/pipelines/${params.id}/settings`)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </CardContent>
      </Card>
      
      {/* Pipeline Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Exibir detalhes do pipeline existentes */}
          {/* ... código existente ... */}
        </CardContent>
      </Card>
      
      {/* Progress Overlay */}
      <DryRunProgress
        isPolling={isPolling}
        status={status}
        onCancel={cancelPolling}
      />
      
      {/* Result Modal */}
      <DryRunResultModal
        result={result}
        isOpen={showResultModal}
        onClose={handleCloseResultModal}
        onExecute={handleExecutePipeline}
      />
    </div>
  )
}
```

---

### 2. Modificar (Opcional): `src/app/(dashboard)/pipelines/page.tsx`

Adicionar quick test na listagem de pipelines.

```tsx
'use client'

import { useState } from 'react'
import { DryRunButton } from '@/components/pipelines/DryRunButton'
import { DryRunProgress } from '@/components/pipelines/DryRunProgress'
import { DryRunResultModal } from '@/components/pipelines/DryRunResultModal'
import { useDryRun } from '@/hooks/useDryRun'

export default function PipelinesListPage() {
  const { result, isPolling, status, resetState } = useDryRun()
  const [showResultModal, setShowResultModal] = useState(false)
  
  // useEffect para abrir modal quando polling terminar
  // ... (similar ao código acima)
  
  return (
    <div>
      {/* Tabela de pipelines existente */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pipelines.map((pipeline) => (
            <TableRow key={pipeline.id}>
              <TableCell>{pipeline.name}</TableCell>
              <TableCell>
                <Badge>{pipeline.enabled ? 'Active' : 'Inactive'}</Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                {/* Quick Test */}
                <DryRunButton
                  pipelineId={pipeline.id}
                  pipelineName={pipeline.name}
                  disabled={!pipeline.enabled}
                />
                <Button size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Components globais */}
      <DryRunProgress isPolling={isPolling} status={status} />
      <DryRunResultModal
        result={result}
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false)
          resetState()
        }}
      />
    </div>
  )
}
```

---

### 3. Verificar: `package.json`

Garantir que todas as dependências estão instaladas:

```json
{
  "dependencies": {
    "react-json-view": "^1.21.3",
    "lucide-react": "^0.294.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react-json-view": "^1.19.3"
  }
}
```

```bash
npm install react-json-view @types/react-json-view
```

---

### 4. Verificar: `src/lib/api-client.ts`

Confirmar que API client está configurado corretamente:

```typescript
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de autenticação
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de erro
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## ✅ Checklist de Implementação

### Integração
- [ ] Importar todos os componentes dry-run na página de detalhes
- [ ] Importar useDryRun hook
- [ ] Importar useToast para notificações
- [ ] Adicionar DryRunButton ao layout de ações
- [ ] Adicionar DryRunProgress ao root da página
- [ ] Adicionar DryRunResultModal ao root da página

### Gerenciamento de Estado
- [ ] useEffect para abrir modal quando polling terminar
- [ ] useEffect para notificações de sucesso/erro
- [ ] Estado `showResultModal` para controlar modal de resultados
- [ ] Método `resetState()` ao fechar modal

### Fluxo de Execução
- [ ] Implementar `handleExecutePipeline()` para execução real
- [ ] Implementar `handleCloseResultModal()` com cleanup
- [ ] Integrar botão "Execute Pipeline" do modal
- [ ] Navegação para página de execuções após executar

### Tratamento de Erros
- [ ] Toast notification para erro ao iniciar dry-run
- [ ] Toast notification para erro durante polling
- [ ] Toast notification para timeout
- [ ] Exibir erro no modal se dry-run falhou

### UI/UX
- [ ] Loading state durante carregamento do pipeline
- [ ] Desabilitar botões se pipeline inativo
- [ ] Transições suaves entre modals
- [ ] Prevenir múltiplas execuções simultâneas

### Testes Manuais
- [ ] Clicar em "Test Run" → modal de config abre
- [ ] Configurar sample size → clicar "Start" → progress overlay aparece
- [ ] Aguardar polling → modal de resultado abre automaticamente
- [ ] Verificar toast notification de sucesso
- [ ] Clicar em "Execute Pipeline" → navegar para execuções
- [ ] Testar com pipeline que falha → verificar erro exibido
- [ ] Testar cancelamento de polling
- [ ] Fechar modal → estado limpo

---

## 🎨 Flow Diagram Completo

```
[Pipeline Detail Page]
    ↓
User clicks "Test Run" button
    ↓
<DryRunButton> → Opens modal
    ↓
User configures sample size (10)
    ↓
User clicks "Start Test Run"
    ↓
useDryRun.startDryRun(pipelineId, 10)
    ↓
POST /pipelines/crud/{id}/dry-run
    ← 202 Accepted { dryRunId }
    ↓
isPolling = true
    ↓
<DryRunProgress> appears (overlay)
    ↓
Polling every 2s...
GET /pipelines/crud/dry-runs/{dryRunId}
    ← { status: 'pending' }
    ↓
Progress shows: "Queued for execution..."
    ↓
GET /pipelines/crud/dry-runs/{dryRunId}
    ← { status: 'running' }
    ↓
Progress shows: "Running pipeline test..."
    ↓
GET /pipelines/crud/dry-runs/{dryRunId}
    ← { status: 'completed', result: {...} }
    ↓
isPolling = false
result != null
    ↓
useEffect triggers
    ↓
Toast: "Test Run Completed"
setShowResultModal(true)
    ↓
<DryRunProgress> disappears
<DryRunResultModal> appears
    ↓
User reviews results
    ↓
[Option A] User clicks "Execute Pipeline"
    → handleExecutePipeline()
    → POST /pipelines/crud/{id}/execute
    → Navigate to executions page
    
[Option B] User clicks "Close"
    → handleCloseResultModal()
    → resetState()
    → Modal closes
```

---

## 📚 Dependências de Tasks

Este é o grafo de dependências completo:

```
TASK-02 (useDryRun hook)
    ↓
    ├── TASK-01 (DryRunButton) ────────┐
    ├── TASK-04 (DryRunProgress) ──────┤
    └── TASK-03 (DryRunResultModal) ───┤
                                       ↓
                            TASK-05 (Integração)
                                       ↓
                            TASK-06 (Testes)
```

---

## 🚀 Próxima Task

Após completar integração:
- **[TASK-06](./TASK-06.md)**: Testes Automatizados (cobertura completa do fluxo)

---

## 📝 Notas de Implementação

### Memory Leaks
- Sempre limpar intervals no cleanup do useEffect
- Sempre resetar estado do hook ao desmontar componentes
- Usar `resetState()` ao fechar modal de resultados

### Performance
- Não fazer polling se componente não está montado
- Cancelar polling ao navegar para outra página
- Limpar cache de resultados após fechar modal

### Acessibilidade
- Focar no modal quando abrir
- Permitir fechar modal com ESC
- Leitura de screen readers para status

---

**Criado em**: 2026-01-21  
**Atualizado em**: 2026-01-21
