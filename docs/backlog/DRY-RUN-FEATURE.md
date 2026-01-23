# Feature: Pipeline Dry-Run Mode

## 📋 Visão Geral

Implementar interface no frontend para permitir que usuários testem pipelines em modo "dry-run" (execução de teste), onde:
- Source e Transform são executados normalmente
- Sink steps são **pulados** (nenhuma escrita externa)
- Usuário recebe amostras de dados e feedback de cada step
- Limite configurável de mensagens (sample size)

## 🎯 Objetivos

1. **Validação Segura**: Testar pipelines sem risco de escrever dados reais
2. **Debug Facilitado**: Ver amostras de dados após cada transformação
3. **Confiança**: Validar pipeline antes de executar em produção
4. **Educação**: Entender o que cada step faz com dados reais

## 📦 Entregáveis

### 1. API Service Layer
**Arquivo:** `src/services/api/pipelines.ts`

**Tarefas:**
- [ ] Criar interface TypeScript `DryRunStepResult`
  - Propriedades: stepType, connectorType, success, skipped, message, timing, messageCount, sampleData, errorMessage
- [ ] Criar interface TypeScript `DryRunResult`
  - Propriedades: pipelineName, version, success, timing, errorMessage, errorStackTrace, steps[], totalSampleMessages
- [ ] Implementar função `dryRunPipeline(pipelineId: string, sampleSize: number): Promise<DryRunResult>`
  - Endpoint: `POST /pipelines/crud/{id}/dry-run?sampleSize={size}`
  - Validação: sampleSize entre 1 e 1000
  - Error handling com mensagens amigáveis

**Estimativa:** 2h  
**Prioridade:** Alta

---

### 2. Pipeline Actions Component
**Arquivo:** `src/components/pipelines/PipelineActions.tsx` (novo ou adicionar a existente)

**Tarefas:**
- [ ] Criar componente `PipelineActions` com props `{ pipelineId: string; onDryRunComplete?: (result: DryRunResult) => void }`
- [ ] Adicionar input numérico para `sampleSize` (default: 10, min: 1, max: 1000)
- [ ] Adicionar botão "🧪 Test Run (Dry-Run)"
- [ ] Implementar estado `isRunning` para loading state
- [ ] Chamar API `dryRunPipeline()` ao clicar
- [ ] Emitir evento `onDryRunComplete` com resultado
- [ ] Tratamento de erros com toast/notification

**UI/UX:**
```
┌─────────────────────────────────────────┐
│ Sample Size: [  10  ] [🧪 Test Run]    │
└─────────────────────────────────────────┘
```

**Estimativa:** 3h  
**Prioridade:** Alta

---

### 3. Dry-Run Results Modal
**Arquivo:** `src/components/pipelines/DryRunResultsModal.tsx` (novo)

**Tarefas:**
- [ ] Criar modal responsivo com `{ result: DryRunResult; onClose: () => void }`
- [ ] Header com status (✅/❌), nome do pipeline, duração, total de amostras
- [ ] Exibir erro global se `result.errorMessage` existir
- [ ] Listar todos os steps em cards:
  - [ ] Badge de status (✅ Success / ⏭️ Skipped / ❌ Failed)
  - [ ] Tipo do step e connector
  - [ ] Mensagem do step
  - [ ] Timing e messageCount
  - [ ] Section colapsável "View Sample Data" com JSON formatado
  - [ ] Error message se step falhou
- [ ] Botão "Close" no rodapé
- [ ] Scroll interno se muitos steps
- [ ] Highlight diferente para steps pulados (sink)

**UI/UX:**
```
┌─────────────────────────────────────────────────┐
│  ✅ Dry-Run Results: my-pipeline                │
│  Duration: 234ms | Sample Messages: 10          │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ ✅ SOURCE (HttpJsonGetSourceConnector)   │  │
│  │ Extracted 10 sample messages from source │  │
│  │ 10 messages | 123ms                      │  │
│  │ ▼ View Sample Data (3 items)             │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ ✅ TRANSFORM                              │  │
│  │ Transformed 10 messages                   │  │
│  │ 10 messages | 45ms                        │  │
│  │ ▼ View Sample Data (3 items)             │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ ⏭️ SINK (MySqlSinkConnector) [SKIPPED]   │  │
│  │ [DRY-RUN] Would send 10 messages to ...  │  │
│  │ 10 messages | 1ms                         │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
├─────────────────────────────────────────────────┤
│                                    [Close]      │
└─────────────────────────────────────────────────┘
```

**Estimativa:** 5h  
**Prioridade:** Alta

---

### 4. Integration - Pipeline Detail Page
**Arquivo:** `src/app/pipelines/[id]/page.tsx` (ou equivalente)

**Tarefas:**
- [ ] Importar `PipelineActions` e `DryRunResultsModal`
- [ ] Adicionar state `dryRunResult` com tipo `DryRunResult | null`
- [ ] Renderizar `<PipelineActions>` com callback `onDryRunComplete`
- [ ] Renderizar modal condicionalmente: `{dryRunResult && <DryRunResultsModal ... />}`
- [ ] Integrar com UI existente (posicionar botão logicamente)

**Localização sugerida do botão:**
- Próximo aos botões "Execute" / "Pause" / "Resume"
- Ou em seção "Testing & Validation" separada

**Estimativa:** 2h  
**Prioridade:** Alta

---

### 5. YAML Editor Enhancement
**Arquivo:** `src/components/editor/YamlEditor.tsx`

**Tarefas:**
- [ ] Adicionar botão "🧪 Test YAML" na toolbar do editor
- [ ] Implementar lógica:
  1. Se pipeline não está salvo → mostrar modal "Save pipeline first"
  2. Se pipeline salvo → chamar dry-run automaticamente
  3. Mostrar results modal
- [ ] Desabilitar botão se YAML tem erros de validação
- [ ] Adicionar tooltip explicando o que é dry-run

**UI/UX:**
```
┌──────────────────────────────────────────┐
│ [Validate] [🧪 Test YAML] [Save]        │
│                                          │
│ pipeline: my-pipeline                    │
│ version: 1.0.0                           │
│ ...                                      │
└──────────────────────────────────────────┘
```

**Estimativa:** 2h  
**Prioridade:** Média

---

### 6. UI/UX Improvements
**Vários arquivos**

**Tarefas:**
- [ ] Adicionar loading skeleton enquanto dry-run executa
- [ ] Toast notification: "Dry-run completed successfully" / "Dry-run failed"
- [ ] Animação de "running" no botão (spinner ou dots)
- [ ] Badge no resultado modal indicando "Safe Test Mode"
- [ ] Syntax highlight no JSON sample data (opcional - usar lib como `react-json-view`)
- [ ] Export results como JSON (botão download)
- [ ] Share dry-run results via URL (opcional - salvar resultado temporário)

**Estimativa:** 4h  
**Prioridade:** Baixa

---

### 7. Testing
**Arquivos:** `src/__tests__/components/`, `src/__tests__/services/`

**Tarefas:**
- [ ] Unit test: `dryRunPipeline()` API call
- [ ] Unit test: `PipelineActions` component
- [ ] Unit test: `DryRunResultsModal` rendering
- [ ] Integration test: Full dry-run flow
- [ ] Edge cases:
  - [ ] Dry-run com erro de rede
  - [ ] Dry-run com pipeline inválido
  - [ ] Dry-run com sampleSize inválido
  - [ ] Modal com steps vazios
  - [ ] Modal com sample data muito grande

**Estimativa:** 4h  
**Prioridade:** Média

---

### 8. Documentation
**Arquivos:** `docs/features/`, `README.md`

**Tarefas:**
- [ ] Criar `docs/features/DRY-RUN-MODE.md` com:
  - [ ] O que é dry-run
  - [ ] Como usar (screenshots)
  - [ ] Quando usar vs execução real
  - [ ] Limitações (sample size, sem side effects)
  - [ ] FAQ
- [ ] Atualizar README.md com link para dry-run feature
- [ ] Adicionar badge "🧪 Test Mode Available"

**Estimativa:** 2h  
**Prioridade:** Baixa

---

## 📊 Estimativa Total

| Fase | Horas | Prioridade |
|------|-------|-----------|
| API Service | 2h | Alta |
| Actions Component | 3h | Alta |
| Results Modal | 5h | Alta |
| Integration | 2h | Alta |
| Editor Enhancement | 2h | Média |
| UI/UX Improvements | 4h | Baixa |
| Testing | 4h | Média |
| Documentation | 2h | Baixa |
| **TOTAL** | **24h** | - |

**Sprint sugerido:** 1 semana (3-4 dias de dev + 1-2 dias de teste/polish)

---

## 🚀 Roadmap de Implementação

### Sprint 1: Core Functionality (12h - 2 dias)
1. API Service Layer
2. Pipeline Actions Component
3. Dry-Run Results Modal
4. Integration na Pipeline Detail Page

**Entregável:** Usuário consegue executar dry-run e ver resultados

---

### Sprint 2: Enhanced UX (8h - 1 dia)
1. YAML Editor Enhancement
2. UI/UX Improvements (loading, toast, animations)

**Entregável:** Experiência polida e intuitiva

---

### Sprint 3: Quality & Docs (4h - 0.5 dia)
1. Testing
2. Documentation

**Entregável:** Feature 100% testada e documentada

---

## ✅ Critérios de Aceitação

- [ ] Usuário consegue executar dry-run de qualquer pipeline salvo
- [ ] Usuário vê progresso em tempo real (loading state)
- [ ] Usuário vê resultados detalhados de cada step
- [ ] Usuário vê amostras de dados após transformações
- [ ] Sink steps são **sempre** marcados como "SKIPPED"
- [ ] Errors são exibidos de forma clara e acionável
- [ ] Interface é responsiva (mobile + desktop)
- [ ] Dry-run não persiste dados no banco (validado via API)
- [ ] Sample size é configurável (1-1000)
- [ ] Resultados são exportáveis (JSON download)

---

## 🔗 Recursos

- **Backend API:** `POST /pipelines/crud/{id}/dry-run?sampleSize={n}`
- **Response Type:** `DryRunResult` (ver docs backend)
- **Figma/Design:** TBD (criar mockup antes de implementar modal)
- **Related Issues:** [Link para issue do GitHub]

---

## 📝 Notas Técnicas

### Considerações de Performance
- Dry-run pode demorar segundos/minutos dependendo do source
- Implementar timeout (ex: 60s) para evitar requests pendentes
- Loading state deve mostrar "Fetching data from source..." → "Transforming..." → "Done"

### Segurança
- Validar `sampleSize` no frontend (1-1000) antes de enviar
- Não expor credentials/secrets nos sample data
- Verificar permissões (usuário só pode dry-run pipelines do seu tenant)

### Acessibilidade
- Modal deve ser navegável via teclado (Tab, Esc para fechar)
- ARIA labels adequados ("Test run button", "Dry-run results dialog")
- Contrast ratio adequado para badges de status

### Localização (Futuro)
- Textos hardcoded devem ser externalizados para i18n
- Preparar para PT-BR e EN-US

---

## 🐛 Possíveis Problemas e Soluções

| Problema | Solução |
|----------|---------|
| Dry-run demora muito | Adicionar timeout + cancelamento via AbortController |
| Sample data muito grande | Limitar exibição a 3 primeiras mensagens por step |
| Modal não cabe na tela | Scroll interno + max-height: 80vh |
| Usuário esquece de salvar pipeline | Validar se pipeline existe antes de dry-run |
| Network error durante dry-run | Retry logic + mensagem clara de erro |

---

**Última atualização:** 2026-01-21  
**Status:** Aguardando aprovação para início  
**Owner:** TBD
