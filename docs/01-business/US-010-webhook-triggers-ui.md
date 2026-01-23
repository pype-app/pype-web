# US-010: Webhook Configuration UI (Frontend)

**ID**: US-010  
**Origem**: IMP-010  
**Prioridade**: Média  
**Esforço**: 2 dias  
**Tipo**: Feature  
**Componente**: Frontend (pype-web)

---

## 📋 História de Usuário

**Como** Desenvolvedor de Pipelines  
**Quero** configurar e testar webhooks pela interface  
**Para** integrar com APIs externas facilmente

---

## 🎯 Contexto de Negócio

Com webhooks implementados no backend (US-010-backend), o frontend precisa:
- Exibir URL pública do webhook
- Testar webhook manualmente
- Visualizar histórico de requests
- Copiar snippet de integração

---

## 🔧 Requisitos Funcionais

### RF-001: Exibir Webhook URL
- Na página de detalhes do pipeline, DEVE mostrar:
  - Card "Webhook Trigger"
  - URL pública com botão "Copy"
  - Status: Enabled/Disabled

### RF-002: Test Webhook
- Botão "Test Webhook" DEVE abrir modal com:
  - Editor JSON para payload
  - Campo para headers customizados
  - Botão "Send Test Request"
  - Resultado da execução

### RF-003: Webhook Request History
- Aba "Webhook Requests" DEVE exibir tabela:
  - Timestamp
  - Payload (preview)
  - Signature Valid (✓/✗)
  - Execution ID (link)
  - Status

### RF-004: Integration Snippets
- Botão "Integration Examples" DEVE mostrar snippets:
  - cURL
  - Node.js (Axios)
  - Python (requests)
  - Com assinatura HMAC incluída

### RF-005: Webhook Configuration
- Settings do pipeline DEVE ter seção "Webhook":
  - Toggle Enabled/Disabled
  - Campo para Secret (masked)
  - Botão "Regenerate Secret"

---

## ✅ Critérios de Aceite (Gherkin)

```gherkin
Feature: Webhook Configuration UI
  Como usuário
  Eu preciso configurar webhooks
  Para integrar com APIs externas

  Scenario: Exibir webhook URL
    Dado que estou na página de detalhes do pipeline
    E o webhook está enabled
    Quando a página carregar
    Então DEVO ver card "Webhook Trigger"
    Com URL: https://pype.io/api/webhooks/my-pipeline/trigger
    E botão "Copy URL"

  Scenario: Copiar webhook URL
    Dado que estou visualizando o webhook URL
    Quando eu clicar em "Copy URL"
    Então a URL DEVE ser copiada para clipboard
    E DEVO ver toast "URL copied to clipboard"

  Scenario: Test webhook
    Dado que estou na página do pipeline
    Quando eu clicar em "Test Webhook"
    Então DEVO ver modal com:
      | Campo          | Tipo         |
      | Payload JSON   | Code editor  |
      | Headers        | Key-value    |
      | Send Button    | Button       |

  Scenario: Visualizar histórico de webhooks
    Dado que estou na aba "Webhook Requests"
    Quando a tabela carregar
    Então DEVO ver últimos 50 requests
    Com colunas: Timestamp, Payload Preview, Valid, Execution, Status

  Scenario: Integration snippets
    Dado que estou na página do pipeline
    Quando eu clicar em "Integration Examples"
    Então DEVO ver modal com tabs:
      | Tab      | Conteúdo                  |
      | cURL     | Comando curl com HMAC     |
      | Node.js  | Código Axios              |
      | Python   | Código requests           |
    E código DEVE incluir assinatura HMAC
```

---

## 📐 Especificações Técnicas

### Componentes

```typescript
// src/components/webhooks/WebhookCard.tsx
interface WebhookCardProps {
  pipelineId: string;
  webhookUrl: string;
  enabled: boolean;
}

// src/components/webhooks/TestWebhookModal.tsx
interface TestWebhookModalProps {
  pipelineId: string;
  webhookUrl: string;
  open: boolean;
  onClose: () => void;
}

// src/components/webhooks/WebhookRequestsTable.tsx
interface WebhookRequestsTableProps {
  pipelineId: string;
}

// src/components/webhooks/IntegrationSnippets.tsx
interface IntegrationSnippetsProps {
  webhookUrl: string;
  secret: string;
}
```

---

## ✅ Checklist

- [ ] WebhookCard implementado
- [ ] TestWebhookModal criado
- [ ] WebhookRequestsTable funcionando
- [ ] IntegrationSnippets com cURL/Node/Python
- [ ] Copy to clipboard funcionando
- [ ] Testes E2E passando
- [ ] Merged para developer
