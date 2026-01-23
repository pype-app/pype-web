# IMP-005: Dry-Run Mode - Frontend Tasks

**Feature**: Pipeline Dry-Run Mode  
**Backend Status**: ✅ Completo ([PR #146](https://github.com/daniel-buona/pype-admin/pull/146))  
**Frontend Status**: 🔴 Pendente  
**Estimativa Total**: 17-22 horas (~3 dias)

---

## 📋 Overview

Este documento organiza as tarefas necessárias para implementar a interface frontend da funcionalidade de Dry-Run (execução simulada de pipelines).

### Contexto

O backend já implementa a arquitetura completa via Job Pattern:
- **POST** `/pipelines/crud/{id}/dry-run?sampleSize={n}` - Enfileira job e retorna 202 Accepted com `dryRunId`
- **GET** `/pipelines/crud/dry-runs/{id}` - Retorna status e resultado (polling endpoint)

O frontend precisa implementar a UX completa do fluxo:
1. Botão "Test Run" → Modal de configuração (sample size)
2. Enfileirar dry-run → Progress indicator com polling
3. Exibir resultados → Timeline de steps + sample data

---

## 🎯 Tasks

| # | Task | Prioridade | Estimativa | Status |
|---|------|-----------|-----------|---------|
| [01](./TASK-01.md) | Botão e Modal de Configuração | MÉDIA | 2-3h | 🔴 Pendente |
| [02](./TASK-02.md) | Hook useDryRun com Polling | **ALTA** | 3-4h | 🔴 Pendente |
| [03](./TASK-03.md) | Modal de Resultados | MÉDIA | 4-5h | 🔴 Pendente |
| [04](./TASK-04.md) | Indicador de Progresso | MÉDIA | 2h | 🔴 Pendente |
| [05](./TASK-05.md) | Integração e Fluxo Completo | ALTA | 2-3h | 🔴 Pendente |
| [06](./TASK-06.md) | Testes Automatizados | MÉDIA | 4-5h | 🔴 Pendente |

**Total**: 17-22 horas

---

## 🔄 Ordem Recomendada de Execução

### Fase 1: Fundação (Dia 1)
1. **TASK-02** (useDryRun hook) - **COMEÇAR AQUI** 
   - Base para todos os outros componentes
   - Define interfaces TypeScript e lógica de polling
   - ~4h

### Fase 2: Componentes Básicos (Dia 1-2)
2. **TASK-01** (DryRunButton + Modal)
   - Interface de entrada do usuário
   - ~3h

3. **TASK-04** (DryRunProgress)
   - Feedback visual durante polling
   - ~2h

### Fase 3: Visualização (Dia 2)
4. **TASK-03** (DryRunResultModal)
   - Componente mais complexo
   - Timeline, sample data, JSON viewer
   - ~5h

### Fase 4: Integração (Dia 2-3)
5. **TASK-05** (Integração Completa)
   - Conectar todos os componentes
   - Testar fluxo end-to-end
   - ~3h

### Fase 5: Qualidade (Dia 3)
6. **TASK-06** (Testes)
   - Testes unitários e integração
   - ~5h

---

## 📦 Dependências

### NPM Packages Necessários
```bash
npm install react-json-view
```

### shadcn/ui Components
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
```

---

## 🔗 Arquitetura

### Fluxo de Dados

```
User Click "Test Run"
    ↓
DryRunButton → Open Modal
    ↓
User Configures Sample Size (10)
    ↓
useDryRun.startDryRun(pipelineId, 10)
    ↓
POST /pipelines/crud/{id}/dry-run
    ← 202 Accepted { dryRunId }
    ↓
Start Polling (every 2s)
    ↓
GET /pipelines/crud/dry-runs/{dryRunId}
    ← { status: 'running' }
    ↓
DryRunProgress (show loading)
    ↓
GET /pipelines/crud/dry-runs/{dryRunId}
    ← { status: 'completed', result: {...} }
    ↓
Stop Polling
    ↓
DryRunResultModal (show results)
    ↓
User Reviews Steps + Sample Data
    ↓
Optional: Execute for Real
```

### Estrutura de Arquivos

```
pype-web/
├── src/
│   ├── types/
│   │   └── dry-run.ts                 ← TASK-02 (interfaces)
│   ├── hooks/
│   │   └── useDryRun.ts               ← TASK-02 (hook)
│   ├── components/
│   │   └── pipelines/
│   │       ├── DryRunButton.tsx       ← TASK-01
│   │       ├── DryRunProgress.tsx     ← TASK-04
│   │       ├── DryRunResultModal.tsx  ← TASK-03
│   │       └── JSONViewer.tsx         ← TASK-03
│   ├── app/
│   │   └── (dashboard)/
│   │       └── pipelines/
│   │           ├── [id]/
│   │           │   └── page.tsx       ← TASK-05 (integração)
│   │           └── page.tsx           ← TASK-01 (quick test)
│   └── __tests__/
│       ├── hooks/
│       │   └── useDryRun.test.ts      ← TASK-06
│       └── components/
│           ├── DryRunButton.test.tsx  ← TASK-06
│           └── DryRunResultModal.test.tsx ← TASK-06
```

---

## 🎨 UI/UX Mockup

### 1. Botão "Test Run"
```
┌─────────────────────────────────────────┐
│ Pipeline: api-to-mysql-sync             │
│ Status: Active                          │
│                                         │
│ [🧪 Test Run] [▶ Execute] [✏️ Edit]   │
└─────────────────────────────────────────┘
```

### 2. Modal de Configuração
```
┌──────────────────────────────────────┐
│  Test Run Configuration              │
│                                      │
│  Sample Size:  [10      ] messages  │
│  (1-1000 messages)                   │
│                                      │
│  This will execute source and        │
│  transform steps without writing     │
│  to the sink.                        │
│                                      │
│        [Cancel]  [Start Test Run]    │
└──────────────────────────────────────┘
```

### 3. Progress Indicator
```
┌──────────────────────────────────────┐
│         Running pipeline test...     │
│                                      │
│         [===========    ] 50%        │
│                                      │
│         Elapsed time: 0:15           │
│                                      │
│              [Cancel]                │
└──────────────────────────────────────┘
```

### 4. Results Timeline
```
┌──────────────────────────────────────────────────┐
│  Dry Run Results: api-to-mysql-sync              │
│  ⏱ Duration: 2.5s  📊 Samples: 10 messages       │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ ✓ Source (httpjsonget)           1.2s   │   │
│  │   Extracted 10 sample messages           │   │
│  │   [Show sample data ▼]                   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ ✓ Transform (map)                0.3s   │   │
│  │   Transformed 10 messages                │   │
│  │   [Show sample data ▼]                   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ ↪ Sink (MySql.MySqlSinkConnector) 0.0s  │   │
│  │   [DRY-RUN] Would send 10 messages       │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│       [Close]  [Execute Pipeline]                │
└──────────────────────────────────────────────────┘
```

---

## 📚 Recursos Adicionais

- **Backend PR**: [#146 - Dry-Run Job Pattern](https://github.com/daniel-buona/pype-admin/pull/146)
- **Arquitetura**: [DRY-RUN-ARCHITECTURE.md](../../../pype-admin/docs/architecture/DRY-RUN-ARCHITECTURE.md)
- **API Endpoints**: Ver [Pype.Admin Routes](../../../pype-admin/src/Pype.Admin/Routes/Pipelines.Crud.Endpoints.cs)

---

**Última Atualização**: 2026-01-21  
**Responsável**: Frontend Team
