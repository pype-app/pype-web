# TASK-01: Botão e Modal de Configuração Dry-Run

**Prioridade**: MÉDIA  
**Estimativa**: 2-3 horas  
**Status**: 🔴 Pendente  
**Dependências**: Nenhuma (pode iniciar imediatamente)

---

## 📋 Objetivo

Criar botão "Test Run" e modal de configuração para permitir usuário iniciar dry-run de um pipeline com configuração de sample size.

---

## 🎯 Critérios de Aceitação

- [ ] Botão "Test Run" visível na página de detalhes do pipeline
- [ ] Botão desabilitado se pipeline está inativo
- [ ] Modal abre ao clicar no botão
- [ ] Input numérico para sample size (1-1000, default: 10)
- [ ] Validação de input (não aceita valores fora do range)
- [ ] Botões "Cancel" e "Start Dry Run"
- [ ] Integração com hook `useDryRun`
- [ ] Loading state durante enfileiramento
- [ ] Tooltip explicativo sobre dry-run

---

## 📁 Arquivos a Criar/Modificar

### 1. Criar: `src/components/pipelines/DryRunButton.tsx`

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Flask } from 'lucide-react'
import { useDryRun } from '@/hooks/useDryRun'

interface DryRunButtonProps {
  pipelineId: string
  pipelineName: string
  disabled?: boolean
}

export function DryRunButton({ 
  pipelineId, 
  pipelineName,
  disabled = false 
}: DryRunButtonProps) {
  const [open, setOpen] = useState(false)
  const [sampleSize, setSampleSize] = useState(10)
  const { startDryRun, isLoading, error } = useDryRun()
  
  const handleStart = async () => {
    try {
      await startDryRun(pipelineId, sampleSize)
      setOpen(false)
    } catch (err) {
      // Error já tratado no hook
      console.error('Failed to start dry-run:', err)
    }
  }
  
  const handleSampleSizeChange = (value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num)) return
    
    // Clamp entre 1 e 1000
    if (num < 1) setSampleSize(1)
    else if (num > 1000) setSampleSize(1000)
    else setSampleSize(num)
  }
  
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        disabled={disabled}
        title="Run pipeline test without writing to sink"
      >
        <Flask className="mr-2 h-4 w-4" />
        Test Run
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test Run Configuration</DialogTitle>
            <DialogDescription>
              Run a simulation of <strong>{pipelineName}</strong> without 
              writing to the sink. This will execute source and transform 
              steps with a limited sample of data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sampleSize" className="text-right">
                Sample Size
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="sampleSize"
                  type="number"
                  min={1}
                  max={1000}
                  value={sampleSize}
                  onChange={(e) => handleSampleSizeChange(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  messages (1-1000)
                </span>
              </div>
            </div>
            
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Source and transform steps will run 
                normally. Sink step will be simulated (no data will be written).
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              disabled={isLoading || sampleSize < 1 || sampleSize > 1000}
            >
              {isLoading ? 'Starting...' : 'Start Test Run'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

---

### 2. Modificar: `src/app/(dashboard)/pipelines/[id]/page.tsx`

**Localização**: Aproximadamente linhas 50-80 (seção de ações do pipeline)

**Antes**:
```tsx
<div className="flex gap-2">
  <Button>Execute</Button>
  <Button variant="outline">Edit</Button>
</div>
```

**Depois**:
```tsx
import { DryRunButton } from '@/components/pipelines/DryRunButton'

// ... dentro do component

<div className="flex gap-2">
  <DryRunButton
    pipelineId={params.id}
    pipelineName={pipeline.name}
    disabled={!pipeline.enabled}
  />
  <Button>Execute</Button>
  <Button variant="outline">Edit</Button>
</div>
```

---

### 3. Modificar (Opcional): `src/app/(dashboard)/pipelines/page.tsx`

Adicionar botão de quick test na listagem de pipelines (opcional - para UX avançada).

**Localização**: Tabela de pipelines, coluna de ações

```tsx
// Na célula de ações da tabela
<div className="flex gap-1">
  <Button variant="ghost" size="sm" title="Quick Test">
    <Flask className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="sm">Edit</Button>
</div>
```

---

## 🔧 Componentes shadcn/ui Necessários

```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
```

**Verificar se já existem**: Button, já deve estar disponível.

---

## ✅ Checklist de Implementação

### Setup
- [ ] Instalar componentes shadcn/ui necessários (dialog, input, label)
- [ ] Importar ícone Flask do lucide-react

### Desenvolvimento
- [ ] Criar arquivo DryRunButton.tsx
- [ ] Implementar estado local (open, sampleSize)
- [ ] Implementar validação de sampleSize (1-1000)
- [ ] Integrar com useDryRun hook (Task-02)
- [ ] Adicionar mensagens de erro
- [ ] Adicionar loading state
- [ ] Modificar página de detalhes do pipeline
- [ ] Adicionar props disabled baseado em pipeline.enabled

### UI/UX
- [ ] Tooltip explicativo no botão
- [ ] Validação visual de input inválido
- [ ] Nota informativa sobre comportamento do dry-run
- [ ] Desabilitar botão durante loading
- [ ] Fechar modal automaticamente após sucesso

### Testes Manuais
- [ ] Abrir modal ao clicar no botão
- [ ] Validar que sampleSize não aceita < 1
- [ ] Validar que sampleSize não aceita > 1000
- [ ] Testar cancelamento
- [ ] Testar submissão com valores válidos
- [ ] Verificar loading state

---

## 🎨 Design System

### Cores
- Botão: `variant="outline"` (secundário)
- Ícone: Flask (experimento/teste)
- Nota informativa: `bg-blue-50 border-blue-200 text-blue-700`
- Erro: `bg-red-50 border-red-200 text-red-700`

### Tamanhos
- Input de sampleSize: `w-24` (largura fixa)
- Modal: `sm:max-w-md` (médio)

### Acessibilidade
- Label associado ao input (`htmlFor`)
- Tooltip no botão (`title` attribute)
- Disabled state claro

---

## 📚 Referências

- **Hook useDryRun**: [TASK-02.md](./TASK-02.md)
- **shadcn/ui Dialog**: https://ui.shadcn.com/docs/components/dialog
- **lucide-react Icons**: https://lucide.dev/icons/flask

---

## 🚀 Próxima Task

Após completar esta task, prosseguir para:
- **[TASK-02](./TASK-02.md)**: Hook useDryRun com Polling (CRÍTICO - base para funcionalidade)

---

**Criado em**: 2026-01-21  
**Atualizado em**: 2026-01-21
