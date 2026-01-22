# TASK-04: Indicador de Progresso Dry-Run

**Prioridade**: MÉDIA  
**Estimativa**: 2 horas  
**Status**: 🔴 Pendente  
**Dependências**: [TASK-02](./TASK-02.md) (useDryRun hook)

---

## 📋 Objetivo

Criar indicador visual de progresso (overlay/modal) que é exibido enquanto o dry-run está em execução, com status em tempo real e contador de tempo decorrido.

---

## 🎯 Critérios de Aceitação

- [ ] Modal/overlay exibido durante polling (`isPolling = true`)
- [ ] Spinner animado
- [ ] Status text dinâmico: "Queued...", "Running...", "Processing..."
- [ ] Contador de tempo decorrido (mm:ss)
- [ ] Progress bar ou indicador de progresso
- [ ] Botão de cancelamento (opcional)
- [ ] Não bloqueia UI completamente (usuário pode clicar fora se necessário)

---

## 📁 Arquivos a Criar

### 1. Criar: `src/components/pipelines/DryRunProgress.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, Clock } from 'lucide-react'
import { DryRunStatus } from '@/types/dry-run'

interface DryRunProgressProps {
  isPolling: boolean
  status: DryRunStatus | null
  onCancel?: () => void
}

/**
 * Indicador de progresso exibido durante execução de dry-run
 * Mostra status em tempo real, tempo decorrido e opção de cancelamento
 */
export function DryRunProgress({ 
  isPolling, 
  status, 
  onCancel 
}: DryRunProgressProps) {
  const [elapsed, setElapsed] = useState(0)
  
  // Contador de tempo decorrido
  useEffect(() => {
    if (!isPolling) {
      setElapsed(0)
      return
    }
    
    const startTime = Date.now()
    
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - startTime) / 1000)
      setElapsed(elapsedSeconds)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isPolling])
  
  /**
   * Traduz status do backend para texto amigável
   */
  const getStatusText = (): string => {
    if (!status) return 'Initializing dry-run...'
    
    switch (status.status) {
      case 'pending':
        return 'Queued for execution...'
      case 'running':
        return 'Running pipeline test...'
      default:
        return 'Processing...'
    }
  }
  
  /**
   * Calcula progresso aproximado baseado em status
   * pending = 25%, running = 50%, completed/failed = 100%
   */
  const getProgressValue = (): number => {
    if (!status) return 10
    
    switch (status.status) {
      case 'pending':
        return 25
      case 'running':
        return 50
      default:
        return 100
    }
  }
  
  /**
   * Formata tempo em mm:ss
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <Dialog open={isPolling} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Test Run in Progress</DialogTitle>
          <DialogDescription className="text-center">
            {status?.pipelineName || 'Pipeline'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          {/* Spinner animado */}
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
          
          {/* Status text */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">
              {getStatusText()}
            </h3>
            
            {/* Tempo decorrido */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Elapsed time: {formatTime(elapsed)}</span>
            </div>
            
            {/* Sample size info */}
            {status?.sampleSize && (
              <p className="text-xs text-muted-foreground">
                Sample size: {status.sampleSize} messages
              </p>
            )}
          </div>
          
          {/* Progress bar */}
          <Progress 
            value={getProgressValue()} 
            className="w-full"
          />
          
          {/* Info sobre o que está acontecendo */}
          <div className="w-full rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              {status?.status === 'pending' && 
                'Your test run is queued. It will start shortly.'}
              {status?.status === 'running' && 
                'Executing source and transform steps. Sink will be simulated.'}
              {!status && 
                'Setting up test environment...'}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🔧 Componentes shadcn/ui Necessários

```bash
npx shadcn-ui@latest add progress
```

**Já deve existir**: Dialog, Button (usados em tasks anteriores)

---

## ✅ Checklist de Implementação

### Setup
- [ ] Instalar componente Progress do shadcn/ui
- [ ] Criar arquivo DryRunProgress.tsx

### Desenvolvimento
- [ ] Implementar modal com Dialog
- [ ] Adicionar spinner animado (Loader2)
- [ ] Implementar contador de tempo com useEffect
- [ ] Implementar formatação de tempo (mm:ss)
- [ ] Implementar função getStatusText()
- [ ] Implementar função getProgressValue()
- [ ] Adicionar progress bar
- [ ] Adicionar mensagem contextual por status
- [ ] Implementar botão de cancelamento (opcional)

### UI/UX
- [ ] Spinner centralizado e grande (h-16 w-16)
- [ ] Animação suave do spinner
- [ ] Progress bar responsiva
- [ ] Info box com dicas para o usuário
- [ ] Prevenir fechamento acidental do modal (onPointerDownOutside)
- [ ] Desabilitar ESC para fechar (onEscapeKeyDown)

### Estados
- [ ] Estado `elapsed` para contador de tempo
- [ ] Resetar elapsed quando polling para
- [ ] Limpar interval no cleanup

### Testes Manuais
- [ ] Modal abre quando isPolling = true
- [ ] Contador de tempo inicia e incrementa
- [ ] Status text atualiza conforme status muda
- [ ] Progress bar atualiza (25% → 50%)
- [ ] Modal fecha quando isPolling = false
- [ ] Botão de cancelamento funciona (se implementado)
- [ ] Não fecha ao clicar fora

---

## 🎨 Design Tokens

### Cores
- Spinner: `text-blue-600`
- Progress bar: Default (azul)
- Info box: `bg-blue-50 border-blue-200 text-blue-700` (light mode)
- Info box: `bg-blue-950 border-blue-800 text-blue-300` (dark mode)

### Tamanhos
- Spinner: `h-16 w-16` (grande e visível)
- Modal: `sm:max-w-md` (tamanho médio)
- Ícone Clock: `h-4 w-4`

### Animações
- Spinner: `animate-spin` (lucide-react built-in)
- Progress: Transição suave automática

---

## 🧪 Casos de Teste

### 1. Modal Aparece
```tsx
// isPolling = true
expect(screen.getByText('Test Run in Progress')).toBeInTheDocument()
```

### 2. Contador de Tempo
```tsx
// Após 3 segundos
expect(screen.getByText(/0:03/)).toBeInTheDocument()
```

### 3. Status Text
```tsx
// status.status = 'pending'
expect(screen.getByText('Queued for execution...')).toBeInTheDocument()

// status.status = 'running'
expect(screen.getByText('Running pipeline test...')).toBeInTheDocument()
```

### 4. Progress Value
```tsx
// status.status = 'pending'
expect(progressBar).toHaveAttribute('value', '25')

// status.status = 'running'
expect(progressBar).toHaveAttribute('value', '50')
```

---

## 📊 Flow Diagram

```
DryRunButton → startDryRun()
    ↓
isPolling = true
    ↓
<DryRunProgress isPolling={true} />
    ↓
Modal Opens
    ↓
Start Timer (elapsed++)
    ↓
Display: "Queued for execution..."
Progress: 25%
    ↓
Status Updates: { status: 'running' }
    ↓
Display: "Running pipeline test..."
Progress: 50%
    ↓
Status Updates: { status: 'completed' }
    ↓
isPolling = false
    ↓
Modal Closes
Timer Resets
    ↓
<DryRunResultModal /> Opens
```

---

## 🚀 Integração

Este componente será usado em:
- **[TASK-05](./TASK-05.md)**: Integrado na página de pipeline

```tsx
import { DryRunProgress } from '@/components/pipelines/DryRunProgress'

const { isPolling, status, cancelPolling } = useDryRun()

<DryRunProgress
  isPolling={isPolling}
  status={status}
  onCancel={cancelPolling}
/>
```

---

## 📚 Referências

- **shadcn/ui Progress**: https://ui.shadcn.com/docs/components/progress
- **lucide-react Loader2**: https://lucide.dev/icons/loader-2
- **Hook useDryRun**: [TASK-02.md](./TASK-02.md)

---

**Criado em**: 2026-01-21  
**Atualizado em**: 2026-01-21
