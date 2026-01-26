# US-001: Circuit Breaker Status UI (Frontend)

**ID**: US-001  
**Origem**: IMP-001  
**Prioridade**: Alta  
**Esforço**: 1-2 dias  
**Tipo**: Feature  
**Componente**: Frontend (pype-web)

---

## 📋 História de Usuário

**Como** Administrador do Pype  
**Quero** visualizar o status dos Circuit Breakers na interface  
**Para** monitorar a saúde das integrações e tomar ações quando necessário

---

## 🎯 Contexto de Negócio

Com o Circuit Breaker implementado no backend (US-001-backend), o frontend precisa:
- Mostrar visualmente quando um conector está com circuito aberto
- Alertar usuários quando pipelines falham por Circuit Breaker
- Fornecer dashboard para monitorar saúde das integrações

---

## 🔧 Requisitos Funcionais

### RF-001: Indicador Visual no Dashboard
- O dashboard DEVE exibir status de Circuit Breakers por conector
- Cada conector DEVE ter um badge indicando estado:
  - 🟢 **Closed**: Verde, tudo operacional
  - 🟡 **Half-Open**: Amarelo, em teste
  - 🔴 **Open**: Vermelho, circuito aberto

### RF-002: Notificação em Falha por Circuit Breaker
- Quando uma execução falhar por `CircuitBreakerOpenException`, o sistema DEVE:
  - Mostrar toast notification com mensagem clara
  - Exibir tempo restante até próxima tentativa
  - Fornecer link para página de status de conectores

### RF-003: Página de Status de Conectores
- DEVE existir uma página `/connectors/status` com:
  - Lista de todos os conectores HTTP configurados
  - Status atual de cada Circuit Breaker
  - Histórico de transições de estado (últimas 24h)
  - Contador de falhas recentes
  - Próximo tempo de recuperação (se Open)

### RF-004: Tooltip Informativo
- Badges de status DEVEM ter tooltips explicando:
  - O que significa cada estado
  - Quantas falhas causaram abertura (se Open)
  - Quando o circuito foi aberto (se Open)
  - Próximo teste previsto (se Open)

### RF-005: Filtro de Execuções
- A página de histórico de execuções DEVE permitir filtrar por:
  - "Falhadas por Circuit Breaker"
- Execuções filtradas DEVEM mostrar ícone específico ⚡

### RF-006: Integração com Logs
- Ao clicar em execução falhada por Circuit Breaker, DEVE:
  - Expandir seção de logs automaticamente
  - Destacar logs da categoria "CircuitBreaker"
  - Mostrar sugestão de ação (ex: "Verifique a API externa")

---

## 🚫 Requisitos Não Funcionais

### RNF-001: Performance
- Polling de status NÃO DEVE ocorrer mais de 1x por minuto
- Usar cache local para evitar chamadas desnecessárias

### RNF-002: Real-Time
- Notificações DEVEM aparecer em < 2 segundos após evento
- Usar SignalR para atualizações em tempo real (futuro)

### RNF-003: Responsividade
- Dashboard DEVE funcionar em mobile (320px+)
- Tabela de status DEVE ter scroll horizontal em telas pequenas

---

## ✅ Critérios de Aceite (Gherkin)

```gherkin
Feature: Visualização de Circuit Breaker Status
  Como usuário do Pype
  Eu preciso ver o status dos Circuit Breakers
  Para monitorar saúde das integrações

  Background:
    Dado que estou logado como Administrador
    E existem os seguintes conectores configurados:
      | Tipo          | URL                   | Status      |
      | httpjsonget   | https://api-a.com     | Closed      |
      | httpjsonpost  | https://api-b.com     | Open        |
      | httpjsonget   | https://api-c.com     | Half-Open   |

  Scenario: Dashboard exibe badges de status
    Dado que estou na página do Dashboard
    Quando a página carregar
    Então eu DEVO ver seção "Connector Health"
    E DEVO ver badge verde com texto "Closed" para https://api-a.com
    E DEVO ver badge vermelho com texto "Open" para https://api-b.com
    E DEVO ver badge amarelo com texto "Half-Open" para https://api-c.com

  Scenario: Tooltip mostra detalhes do Circuit Breaker
    Dado que estou no Dashboard
    Quando eu passar o mouse sobre o badge vermelho "Open" de https://api-b.com
    Então DEVO ver tooltip com:
      """
      Circuit Breaker: Open
      Failed 5 times consecutively
      Opened at: 23/01/2026 14:30:15
      Next retry: in 25 seconds
      """

  Scenario: Notificação em execução falhada por Circuit Breaker
    Dado que estou visualizando a página de um pipeline
    Quando eu clicar em "Execute Now"
    E a execução falhar com CircuitBreakerOpenException
    Então DEVO ver toast notification com:
      | Tipo      | Error                                        |
      | Título    | Circuit Breaker is Open                      |
      | Mensagem  | Connector https://api-b.com is unavailable   |
      | Ação      | View Connector Status                        |
    E ao clicar em "View Connector Status" DEVO ser redirecionado para /connectors/status

  Scenario: Página de status de conectores
    Dado que estou em /connectors/status
    Quando a página carregar
    Então DEVO ver tabela com colunas:
      | Connector Type | URL              | Status    | Failures | Last Updated |
    E DEVO ver linha com:
      | httpjsonpost   | https://api-b.com | 🔴 Open  | 5/5      | 2 min ago    |
    E DEVO poder clicar na linha para ver detalhes

  Scenario: Detalhes de conector mostram histórico
    Dado que estou em /connectors/status
    Quando eu clicar na linha do conector https://api-b.com
    Então DEVO ver modal com:
      | Título        | Circuit Breaker Status: https://api-b.com |
      | Estado Atual  | 🔴 Open                                    |
      | Falhas        | 5 consecutivas (últimas 60s)              |
      | Próximo Teste | em 18 segundos                             |
    E DEVO ver timeline com:
      | Timestamp          | Event                    |
      | 14:30:15          | Circuit Opened           |
      | 14:29:50          | Failure #5 (HTTP 503)    |
      | 14:29:45          | Failure #4 (HTTP 503)    |

  Scenario: Filtrar execuções por Circuit Breaker
    Dado que estou na página /pipelines/{id}/executions
    Quando eu selecionar filtro "Failed by Circuit Breaker"
    E clicar em "Apply"
    Então DEVO ver apenas execuções que falharam com CircuitBreakerOpenException
    E cada execução DEVO ter ícone ⚡ ao lado do status

  Scenario: Logs destacados para Circuit Breaker
    Dado que estou visualizando detalhes de uma execução
    E a execução falhou por CircuitBreakerOpenException
    Quando a página carregar
    Então a seção de logs DEVE estar expandida automaticamente
    E logs com categoria "CircuitBreaker" DEVEM estar destacados em amarelo
    E DEVO ver sugestão: "💡 The external API might be down. Check connector status."

  Scenario: Auto-refresh de status
    Dado que estou em /connectors/status
    E o conector https://api-b.com está "Open"
    Quando 30 segundos se passarem
    E o Circuit Breaker mudar para "Half-Open" no backend
    Então a UI DEVE atualizar automaticamente para mostrar "🟡 Half-Open"
    Sem eu precisar recarregar a página
```

---

## 📐 Especificações Técnicas

### Estrutura de Componentes
```
src/components/
├── connectors/
│   ├── CircuitBreakerBadge.tsx        # Badge de status
│   ├── CircuitBreakerTooltip.tsx      # Tooltip informativo
│   ├── ConnectorStatusTable.tsx       # Tabela de status
│   ├── ConnectorDetailModal.tsx       # Modal com detalhes
│   └── CircuitBreakerTimeline.tsx     # Timeline de eventos

src/app/(dashboard)/
├── connectors/
│   └── status/
│       └── page.tsx                   # Página /connectors/status

src/hooks/
├── useCircuitBreakerStatus.ts         # Hook para polling de status
└── useConnectorHealth.ts              # Hook para métricas de saúde

src/lib/
└── api/
    └── connectors.ts                  # API calls para status
```

### Novos Endpoints Necessários (Backend)

```typescript
// GET /api/connectors/circuit-breaker/status
interface CircuitBreakerStatus {
  connectorType: string;
  url: string;
  state: 'Closed' | 'Open' | 'Half-Open';
  failureCount: number;
  lastFailureAt?: string;
  openedAt?: string;
  nextRetryAt?: string;
}

// GET /api/connectors/circuit-breaker/history?connectorUrl={url}&hours=24
interface CircuitBreakerEvent {
  timestamp: string;
  event: 'Opened' | 'Closed' | 'HalfOpen' | 'Failure';
  details: string;
}
```

### State Management (Zustand)

```typescript
// src/store/connectors.ts
interface ConnectorStore {
  circuitBreakerStatus: CircuitBreakerStatus[];
  lastUpdated: Date | null;
  
  fetchCircuitBreakerStatus: () => Promise<void>;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}
```

### Componentes Principais

#### CircuitBreakerBadge.tsx
```typescript
interface Props {
  state: 'Closed' | 'Open' | 'Half-Open';
  size?: 'sm' | 'md' | 'lg';
}

// Renderiza badge colorido com ícone
```

#### ConnectorStatusTable.tsx
```typescript
interface Props {
  statuses: CircuitBreakerStatus[];
  onRowClick: (connector: CircuitBreakerStatus) => void;
}

// Tabela responsiva com sort/filter
```

---

## 🧪 Cenários de Teste

### Testes Unitários
1. **CircuitBreakerBadge**: Renderização correta de cores por estado
2. **CircuitBreakerTooltip**: Formatação de tempo restante
3. **ConnectorStatusTable**: Ordenação e filtragem
4. **useCircuitBreakerStatus**: Polling e cache

### Testes E2E (Playwright)
1. **Dashboard mostra badges**: Verificar presença de badges
2. **Notificação aparece**: Simular falha e verificar toast
3. **Página de status carrega**: Navegar e verificar tabela
4. **Modal de detalhes abre**: Clicar e verificar timeline
5. **Auto-refresh funciona**: Aguardar e verificar atualização

---

## 📊 Impacto

### Páginas Afetadas
- ✅ Dashboard (adicionar seção Connector Health)
- ✅ Pipeline Details (adicionar notificações)
- ✅ Execution History (adicionar filtro)
- ✅ Nova página: /connectors/status

### Dependências Frontend
- **Nenhuma lib nova necessária** (usa Tailwind + shadcn/ui existentes)
- **Polling**: setInterval com cleanup no useEffect
- **Futuro**: SignalR para real-time (IMP-004)

---

## 🔗 Relacionamentos

- **Depende de**: US-001-backend (API endpoints)
- **Preparação para**: US-004 (Metrics Dashboard)
- **Complementa**: US-011 (Melhores Mensagens de Erro)

---

## 📝 Notas para Implementação

1. **Polling Interval**: Usar 60 segundos, configurável via env var
2. **Cache**: Usar SWR ou React Query para caching automático
3. **Cores**: Seguir paleta Tailwind (green-500, yellow-500, red-500)
4. **Acessibilidade**: Adicionar aria-labels nos badges
5. **Mobile**: Garantir touch targets >= 44px

---

## ✅ Checklist de Conclusão

- [ ] CircuitBreakerBadge criado e testado
- [ ] ConnectorStatusTable implementada
- [ ] Página /connectors/status funcional
- [ ] Notificações toast aparecem corretamente
- [ ] Filtro em Execution History implementado
- [ ] Tooltips informativos adicionados
- [ ] Testes unitários passando (>80% coverage)
- [ ] Testes E2E passando
- [ ] Responsividade verificada (mobile + desktop)
- [ ] Code review aprovado
- [ ] Merged para branch developer
