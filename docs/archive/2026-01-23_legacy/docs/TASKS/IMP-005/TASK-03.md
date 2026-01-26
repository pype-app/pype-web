# TASK-03: Modal de Resultados Dry-Run

**Prioridade**: MÉDIA  
**Estimativa**: 4-5 horas  
**Status**: 🔴 Pendente  
**Dependências**: [TASK-02](./TASK-02.md) (useDryRun hook)

---

## 📋 Objetivo

Criar modal completo para exibição dos resultados do dry-run, incluindo timeline de steps executados, sample data com syntax highlighting, e métricas de execução.

---

## 🎯 Critérios de Aceitação

- [ ] Modal fullscreen ou large exibe resultados completos
- [ ] Header com resumo: nome do pipeline, duração, total de samples, status
- [ ] Timeline vertical de steps executados
- [ ] Cada step mostra: tipo, conector, status (success/failed/skipped), duração
- [ ] Ícones visuais: ✓ (success), ✗ (failed), ↪ (skipped)
- [ ] Sample data expandível/colapsável por step
- [ ] JSON viewer com syntax highlighting
- [ ] Botão "Execute Pipeline" se dry-run bem-sucedido
- [ ] Botão "Copy Sample Data" para cada step
- [ ] Mensagens de erro claras se dry-run falhou

---

## 📁 Arquivos a Criar

### 1. Criar: `src/components/pipelines/JSONViewer.tsx`

```tsx
'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Importação dinâmica para evitar SSR issues
const ReactJson = dynamic(() => import('react-json-view'), { 
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />
})

interface JSONViewerProps {
  data: any
  collapsed?: number
  name?: string | false
}

/**
 * Component para visualização de JSON com syntax highlighting
 * Usa react-json-view com importação dinâmica
 */
export function JSONViewer({ 
  data, 
  collapsed = 1, 
  name = false 
}: JSONViewerProps) {
  return (
    <div className="rounded-md border bg-gray-50 dark:bg-gray-900 p-3 overflow-x-auto">
      <ReactJson
        src={data}
        theme="rjv-default"
        collapsed={collapsed}
        displayDataTypes={false}
        enableClipboard={true}
        name={name}
        iconStyle="triangle"
        collapseStringsAfterLength={100}
      />
    </div>
  )
}
```

**Dependência NPM**:
```bash
npm install react-json-view
npm install --save-dev @types/react-json-view
```

---

### 2. Criar: `src/components/pipelines/DryRunResultModal.tsx`

```tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle,
  XCircle,
  SkipForward,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Play
} from 'lucide-react'
import { DryRunResult, DryRunStepResult } from '@/types/dry-run'
import { JSONViewer } from './JSONViewer'
import { useToast } from '@/hooks/use-toast'

interface DryRunResultModalProps {
  result: DryRunResult | null
  isOpen: boolean
  onClose: () => void
  onExecute?: () => void
}

export function DryRunResultModal({
  result,
  isOpen,
  onClose,
  onExecute
}: DryRunResultModalProps) {
  if (!result) return null
  
  const { toast } = useToast()
  
  const formatDuration = (ms?: number) => {
    if (!ms) return '0ms'
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }
  
  const handleExecute = () => {
    onClose()
    onExecute?.()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">Dry Run Results</span>
            <Badge 
              variant={result.success ? 'default' : 'destructive'}
              className="text-sm"
            >
              {result.success ? 'Success' : 'Failed'}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-base">
            {result.pipelineName} <span className="text-muted-foreground">v{result.version}</span>
          </DialogDescription>
        </DialogHeader>
        
        {/* Resumo de métricas */}
        <div className="grid grid-cols-3 gap-4 py-3 px-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="font-semibold">{formatDuration(result.durationMs)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <div className="text-xs text-muted-foreground">Sample Messages</div>
              <div className="font-semibold">{result.totalSampleMessages}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <div className="text-xs text-muted-foreground">Steps Executed</div>
              <div className="font-semibold">{result.steps.length}</div>
            </div>
          </div>
        </div>
        
        {/* Timeline de steps */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {result.steps.map((step, idx) => (
              <StepCard 
                key={idx} 
                step={step} 
                stepNumber={idx + 1}
                totalSteps={result.steps.length}
              />
            ))}
          </div>
        </ScrollArea>
        
        {/* Erro geral se falhou */}
        {!result.success && result.errorMessage && (
          <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
              Pipeline Failed
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {result.errorMessage}
            </p>
            {result.errorStackTrace && (
              <details className="mt-2">
                <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                  Stack trace
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                  {result.errorStackTrace}
                </pre>
              </details>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {result.success && onExecute && (
            <Button onClick={handleExecute}>
              <Play className="mr-2 h-4 w-4" />
              Execute Pipeline
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Card individual para cada step do pipeline
 */
function StepCard({ 
  step, 
  stepNumber,
  totalSteps 
}: { 
  step: DryRunStepResult
  stepNumber: number
  totalSteps: number
}) {
  const [expanded, setExpanded] = useState(false)
  const { toast } = useToast()
  
  const icon = step.skipped ? SkipForward : 
               step.success ? CheckCircle : XCircle
               
  const iconColor = step.skipped ? 'text-gray-400' :
                    step.success ? 'text-green-500' : 'text-red-500'
  
  const Icon = icon
  
  const formatDuration = (ms?: number) => {
    if (!ms) return '0ms'
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }
  
  const handleCopySampleData = () => {
    const json = JSON.stringify(step.sampleData, null, 2)
    navigator.clipboard.writeText(json)
    toast({
      title: 'Copied!',
      description: 'Sample data copied to clipboard',
    })
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
            {stepNumber < totalSteps && (
              <div className="w-px h-full min-h-[40px] bg-border mt-2" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {step.stepType}
                </Badge>
                {step.connectorType && (
                  <span className="text-sm text-muted-foreground font-mono">
                    {step.connectorType}
                  </span>
                )}
                {step.skipped && (
                  <Badge variant="secondary" className="text-xs">
                    Skipped
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(step.durationMs)}
              </div>
            </div>
            
            {/* Message */}
            <p className="text-sm mb-2">{step.message}</p>
            
            {/* Message count */}
            {step.messageCount > 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                {step.messageCount} message{step.messageCount !== 1 ? 's' : ''}
              </div>
            )}
            
            {/* Sample data toggle */}
            {step.sampleData && step.sampleData.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {expanded ? 'Hide' : 'Show'} sample data 
                      ({step.sampleData.length} item{step.sampleData.length !== 1 ? 's' : ''})
                    </span>
                  </Button>
                  
                  {expanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopySampleData}
                      className="h-7"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  )}
                </div>
                
                {expanded && (
                  <JSONViewer 
                    data={step.sampleData}
                    collapsed={2}
                  />
                )}
              </div>
            )}
            
            {/* Error message */}
            {step.errorMessage && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {step.errorMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🔧 Componentes shadcn/ui Necessários

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add skeleton
```

---

## ✅ Checklist de Implementação

### Setup
- [ ] Instalar react-json-view: `npm install react-json-view @types/react-json-view`
- [ ] Instalar componentes shadcn/ui (card, badge, scroll-area, skeleton)

### Desenvolvimento - JSONViewer
- [ ] Criar JSONViewer.tsx
- [ ] Importação dinâmica para evitar SSR
- [ ] Configurar tema e opções de react-json-view
- [ ] Adicionar skeleton durante loading

### Desenvolvimento - DryRunResultModal
- [ ] Criar DryRunResultModal.tsx
- [ ] Implementar header com resumo
- [ ] Implementar grid de métricas
- [ ] Implementar ScrollArea para timeline
- [ ] Criar StepCard component
- [ ] Implementar ícones por status (success/failed/skipped)
- [ ] Implementar expand/collapse de sample data
- [ ] Implementar botão "Copy Sample Data"
- [ ] Implementar botão "Execute Pipeline"
- [ ] Exibir erro geral se pipeline falhou

### UI/UX
- [ ] Timeline visual com conectores verticais
- [ ] Cores consistentes (verde=success, vermelho=failed, cinza=skipped)
- [ ] Badges para step type e status
- [ ] Formatação de duração (ms/segundos)
- [ ] Responsivo para telas menores
- [ ] Dark mode support

### Testes Manuais
- [ ] Abrir modal com resultado de sucesso
- [ ] Expandir/colapsar sample data
- [ ] Copiar sample data para clipboard
- [ ] Verificar formatação de JSON
- [ ] Testar com pipeline que falhou
- [ ] Testar com steps skipped (sink)
- [ ] Verificar scroll em pipelines com muitos steps

---

## 🎨 Design Tokens

### Cores de Status
```tsx
const statusColors = {
  success: 'text-green-500',
  failed: 'text-red-500',
  skipped: 'text-gray-400'
}
```

### Badges
- Step Type: `variant="outline"`
- Status: `variant="default"` (success) | `variant="destructive"` (failed)
- Skipped: `variant="secondary"`

### Timeline
- Conector vertical: `w-px h-full bg-border`
- Ícones: 20px (h-5 w-5)

---

## 📚 Referências

- **react-json-view**: https://www.npmjs.com/package/react-json-view
- **shadcn/ui Card**: https://ui.shadcn.com/docs/components/card
- **shadcn/ui Badge**: https://ui.shadcn.com/docs/components/badge
- **Types**: [TASK-02 - dry-run.ts](./TASK-02.md#1-criar-srctypesdry-runts)

---

## 🚀 Integração

Este modal será usado em:
- **[TASK-05](./TASK-05.md)**: Integrado na página de pipeline após polling completar

```tsx
// Exemplo de uso
const { result } = useDryRun()
const [showResult, setShowResult] = useState(false)

<DryRunResultModal
  result={result}
  isOpen={showResult}
  onClose={() => setShowResult(false)}
  onExecute={() => {
    // Executar pipeline de verdade
    executePipeline(pipelineId)
  }}
/>
```

---

**Criado em**: 2026-01-21  
**Atualizado em**: 2026-01-21
