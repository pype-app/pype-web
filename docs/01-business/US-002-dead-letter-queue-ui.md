# US-002: Dead Letter Queue Browser (Frontend)

**ID**: US-002  
**Origem**: IMP-002  
**Prioridade**: Alta  
**Esforço**: 3-4 dias  
**Tipo**: Feature  
**Componente**: Frontend (pype-web)

---

## 📋 História de Usuário

**Como** Administrador do Pype  
**Quero** visualizar e gerenciar mensagens na Dead Letter Queue  
**Para** investigar falhas e reprocessar mensagens corrigidas

---

## 🎯 Contexto de Negócio

Com a DLQ implementada no backend (US-002-backend), o frontend precisa fornecer:
- Interface para visualizar mensagens falhadas
- Comparação visual entre payload original e erro
- Ações para retry individual ou em lote
- Dashboard com métricas de DLQ

---

## 🔧 Requisitos Funcionais

### RF-001: Página Dead Letter Queue Browser
- DEVE existir página `/pipelines/{id}/executions/{executionId}/dlq`
- DEVE exibir tabela com:
  - Timestamp da falha
  - Step que falhou
  - Connector type
  - Preview da mensagem (truncado)
  - Mensagem de erro (truncado)
  - Retry count
  - Status (badge colorido)
  - Ações (View, Retry, Discard)

### RF-002: Modal de Detalhes de Item DLQ
- Ao clicar em "View", DEVE abrir modal com:
  - **Aba "Message"**: JSON viewer com syntax highlighting do payload
  - **Aba "Error"**: Stack trace completo formatado
  - **Aba "Retry History"**: Timeline de tentativas (se retry_count > 0)
  - Botões: "Retry Now", "Discard", "Download JSON"

### RF-003: Ação de Retry Individual
- Botão "Retry Now" DEVE:
  - Mostrar confirmação: "Retry this message?"
  - Chamar POST /api/dlq/{id}/retry
  - Mostrar loading spinner
  - Atualizar status para "Retrying"
  - Mostrar toast de sucesso/erro
  - Auto-refresh após 5 segundos

### RF-004: Ação de Retry All
- Botão "Retry All Pending" DEVE:
  - Mostrar confirmação: "Retry all {count} pending messages?"
  - Chamar POST /api/pipelines/{id}/executions/{executionId}/dlq/retry-all
  - Mostrar progress bar
  - Exibir "X items queued for retry"

### RF-005: Ação de Discard
- Botão "Discard" DEVE:
  - Mostrar confirmação: "Mark as discarded? This cannot be undone."
  - Chamar DELETE /api/dlq/{id}
  - Remover item da lista visualmente
  - Mostrar toast "Item discarded"

### RF-006: Filtros e Busca
- DEVE permitir filtrar por:
  - Status (Pending, Success, Failed, Discarded)
  - Connector Type (dropdown)
  - Data Range (date picker)
- DEVE permitir buscar por texto no error_message

### RF-007: Widget de DLQ no Dashboard
- Dashboard principal DEVE exibir card:
  - "Dead Letter Queue"
  - Total de items Pending (badge vermelho se > 0)
  - Botão "View DLQ"

### RF-008: Badge na Execution Details
- Página de detalhes de execução DEVE mostrar:
  - Badge "X items in DLQ" se > 0
  - Cor: amarelo (< 10), vermelho (>= 10)
  - Link direto para página DLQ

### RF-009: Estatísticas de DLQ
- Página `/dlq/stats` DEVE exibir:
  - Chart: DLQ items por dia (últimos 30 dias)
  - Top 5 erros mais comuns (bar chart)
  - Taxa de sucesso após retry (percentage)
  - Top pipelines com mais DLQ items

---

## 🚫 Requisitos Não Funcionais

### RNF-001: Performance
- Tabela DEVE virtualizar se > 100 items
- Auto-refresh NÃO DEVE ocorrer se página não estiver visível

### RNF-002: Responsividade
- Tabela DEVE ter scroll horizontal em mobile
- Modal DEVE ser fullscreen em telas < 768px

### RNF-003: UX
- Ações destrutivas (Discard) DEVEM ter dupla confirmação
- Syntax highlighting DEVE usar tema consistente com editor YAML

---

## ✅ Critérios de Aceite (Gherkin)

```gherkin
Feature: Dead Letter Queue Browser
  Como usuário do Pype
  Eu preciso visualizar e gerenciar mensagens na DLQ
  Para investigar e corrigir problemas

  Background:
    Dado que estou logado como Administrador
    E existe execução "exec-123" do pipeline "sync-products"
    E a execução tem 10 items na DLQ:
      | ID      | Status   | Error Message           | Retry Count |
      | item-1  | Pending  | Duplicate entry 'ABC'   | 0           |
      | item-2  | Pending  | NULL constraint         | 0           |
      | item-3  | Success  | Duplicate entry 'XYZ'   | 1           |
      | item-4  | Discarded| Invalid data            | 3           |

  Scenario: Visualizar lista de DLQ items
    Dado que estou em /pipelines/{id}/executions/exec-123/dlq
    Quando a página carregar
    Então DEVO ver tabela com 4 linhas
    E DEVO ver colunas: Timestamp, Step, Connector, Message Preview, Error, Retry Count, Status, Actions
    E linha 1 DEVO ver:
      | Status        | Badge amarelo "Pending"        |
      | Error Preview | "Duplicate entry 'ABC'"        |
      | Retry Count   | 0                              |
      | Actions       | View, Retry, Discard buttons   |

  Scenario: Abrir modal de detalhes
    Dado que estou na página DLQ
    Quando eu clicar no botão "View" do item-1
    Então DEVO ver modal com título "DLQ Item Details"
    E DEVO ver 3 abas: Message, Error, Retry History
    E aba "Message" DEVO ver:
      | JSON Viewer   | Syntax highlighted             |
      | Payload       | {"id": 123, "sku": "ABC", ...} |
    E aba "Error" DEVO ver:
      | Error Message | Duplicate entry 'ABC' for key 'sku' |
      | Stack Trace   | Formatado com quebras de linha     |

  Scenario: Retry individual bem-sucedido
    Dado que estou no modal de detalhes do item-1
    Quando eu clicar em "Retry Now"
    Então DEVO ver confirmação "Retry this message?"
    E ao confirmar, DEVO ver loading spinner
    E o sistema DEVE chamar POST /api/dlq/item-1/retry
    E após resposta, DEVO ver toast "Item queued for retry"
    E o status na tabela DEVE mudar para "Retrying"
    E após 5 segundos, a tabela DEVE auto-refresh

  Scenario: Retry all pending
    Dado que estou na página DLQ
    E existem 2 items com status "Pending"
    Quando eu clicar no botão "Retry All Pending"
    Então DEVO ver confirmação "Retry all 2 pending messages?"
    E ao confirmar, DEVO ver loading spinner
    E o sistema DEVE chamar POST /api/pipelines/{id}/executions/exec-123/dlq/retry-all
    E DEVO ver toast "2 items queued for retry"

  Scenario: Discard item
    Dado que estou no modal de detalhes do item-1
    Quando eu clicar em "Discard"
    Então DEVO ver confirmação "Mark as discarded? This cannot be undone."
    E ao confirmar, o sistema DEVE chamar DELETE /api/dlq/item-1
    E o modal DEVE fechar
    E o item DEVE desaparecer da tabela
    E DEVO ver toast "Item discarded"

  Scenario: Filtrar por status
    Dado que estou na página DLQ
    Quando eu selecionar filtro Status = "Pending"
    E clicar em "Apply"
    Então DEVO ver apenas 2 linhas (item-1 e item-2)
    E items com status Success/Discarded NÃO DEVEM aparecer

  Scenario: Buscar por texto de erro
    Dado que estou na página DLQ
    Quando eu digitar "Duplicate" no campo de busca
    E pressionar Enter
    Então DEVO ver apenas 2 linhas (item-1 e item-3)
    E items com erros diferentes NÃO DEVEM aparecer

  Scenario: Dashboard mostra badge de DLQ
    Dado que estou no Dashboard
    E existem 5 items Pending na DLQ
    Quando a página carregar
    Então DEVO ver card "Dead Letter Queue"
    E DEVO ver badge vermelho com número "5"
    E ao clicar em "View DLQ", DEVO ser redirecionado para /dlq/stats

  Scenario: Execution details mostra badge de DLQ
    Dado que estou em /pipelines/{id}/executions/exec-123
    E a execução tem 3 items na DLQ
    Quando a página carregar
    Então DEVO ver badge amarelo "3 items in DLQ"
    E ao clicar no badge, DEVO ser redirecionado para /pipelines/{id}/executions/exec-123/dlq

  Scenario: Página de estatísticas
    Dado que estou em /dlq/stats
    Quando a página carregar
    Então DEVO ver:
      | Chart 1       | Line chart: DLQ items por dia (últimos 30 dias) |
      | Chart 2       | Bar chart: Top 5 erros mais comuns              |
      | Metric 1      | Taxa de sucesso após retry: 88%                 |
      | Table 1       | Top pipelines com mais DLQ items                |

  Scenario: Download JSON do payload
    Dado que estou no modal de detalhes do item-1
    E estou na aba "Message"
    Quando eu clicar no botão "Download JSON"
    Então DEVO baixar arquivo "dlq-item-1.json"
    E o arquivo DEVO conter o payload original formatado

  Scenario: Auto-refresh desabilitado quando página não visível
    Dado que estou na página DLQ
    E auto-refresh está ativado (5 segundos)
    Quando eu mudar para outra aba do navegador
    E aguardar 10 segundos
    Então NÃO DEVE ocorrer nenhuma request de refresh
    E ao voltar para a aba, auto-refresh DEVE retomar
```

---

## 📐 Especificações Técnicas

### Estrutura de Componentes

```
src/components/dlq/
├── DLQTable.tsx                  # Tabela principal
├── DLQItemDetailModal.tsx        # Modal de detalhes
├── DLQFilters.tsx                # Filtros e busca
├── DLQRetryButton.tsx            # Botão retry individual
├── DLQBulkActions.tsx            # Retry all, discard all
├── DLQStats.tsx                  # Estatísticas e charts
└── DLQBadge.tsx                  # Badge de contador

src/app/(dashboard)/
├── dlq/
│   └── stats/
│       └── page.tsx              # /dlq/stats
└── pipelines/
    └── [id]/
        └── executions/
            └── [executionId]/
                └── dlq/
                    └── page.tsx  # /pipelines/{id}/executions/{executionId}/dlq

src/hooks/
├── useDLQ.ts                     # Hook para queries DLQ
└── useDLQStats.ts                # Hook para estatísticas
```

### API Types

```typescript
// src/types/dlq.ts
export interface DLQItem {
  id: string;
  executionId: string;
  pipelineName: string;
  stepName: string;
  connectorType: string;
  failedMessage: object;
  errorMessage: string;
  errorStackTrace?: string;
  retryCount: number;
  status: 'Pending' | 'Retrying' | 'Success' | 'Failed' | 'Discarded';
  failedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DLQStats {
  totalByStatus: Record<string, number>;
  retrySuccessRate: number;
  topErrors: Array<{ message: string; count: number }>;
  topPipelines: Array<{ name: string; dlqCount: number }>;
}
```

### Componentes Principais

#### DLQTable.tsx
```typescript
interface Props {
  items: DLQItem[];
  onRetry: (id: string) => void;
  onDiscard: (id: string) => void;
  onViewDetails: (item: DLQItem) => void;
}
```

#### DLQItemDetailModal.tsx
```typescript
interface Props {
  item: DLQItem | null;
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  onDiscard: () => void;
}

// Abas: Message (JSON viewer), Error (stack trace), Retry History
```

---

## 🧪 Cenários de Teste

### Testes Unitários
1. **DLQTable**: Renderização de items
2. **DLQFilters**: Aplicação de filtros
3. **DLQBadge**: Cores por quantidade
4. **useDLQ**: Queries e mutations

### Testes E2E (Playwright)
1. **Visualizar DLQ**: Navegar e verificar tabela
2. **Retry individual**: Clicar e verificar API call
3. **Retry all**: Verificar confirmação e request
4. **Discard**: Verificar confirmação e remoção
5. **Filtros**: Aplicar e verificar resultados
6. **Download JSON**: Verificar download

---

## 📊 Impacto

### Páginas Afetadas
- ✅ Nova página: /pipelines/{id}/executions/{executionId}/dlq
- ✅ Nova página: /dlq/stats
- ✅ Dashboard (novo widget DLQ)
- ✅ Execution Details (badge DLQ)

### Dependências
- **react-json-view** ou **@uiw/react-json-view**: JSON viewer
- **recharts**: Charts para estatísticas
- **react-virtualized** ou **@tanstack/react-virtual**: Virtualização de tabela

---

## 🔗 Relacionamentos

- **Depende de**: US-002-backend (API endpoints)
- **Preparação para**: US-004 (Integração com Grafana)

---

## ✅ Checklist de Conclusão

- [ ] DLQTable implementada com virtualização
- [ ] DLQItemDetailModal criado com 3 abas
- [ ] Página /dlq/stats funcional
- [ ] Filtros e busca implementados
- [ ] Retry individual funcionando
- [ ] Retry all funcionando
- [ ] Discard funcionando
- [ ] Download JSON implementado
- [ ] Auto-refresh implementado com visibility detection
- [ ] Badge no Dashboard adicionado
- [ ] Badge em Execution Details adicionado
- [ ] Testes unitários passando (>80% coverage)
- [ ] Testes E2E passando
- [ ] Code review aprovado
- [ ] Merged para branch developer
