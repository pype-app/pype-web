# US-011: Exibição de Erros Melhorados (Frontend)

**ID**: US-011  
**Origem**: IMP-011  
**Prioridade**: Alta  
**Esforço**: 1 dia  
**Tipo**: Improvement  
**Componente**: Frontend (pype-web)

---

## 📋 História de Usuário

**Como** Desenvolvedor de Pipelines  
**Quero** visualizar erros de forma clara com sugestões acionáveis  
**Para** corrigir problemas rapidamente sem consultar documentação

---

## 🎯 Contexto de Negócio

Com as mensagens de erro melhoradas no backend (US-011-backend), o frontend precisa:
- Exibir erros de forma estruturada e visual
- Destacar suggested actions
- Fornecer links clicáveis para documentação
- Permitir copiar mensagens de erro

---

## 🔧 Requisitos Funcionais

### RF-001: Toast de Erro Estruturado
- Quando API retornar PypeException, o toast DEVE exibir:
  - 🔴 Ícone de erro com categoria
  - **Título**: `error.message`
  - **Detalhes**: expandível com `error.details`
  - **Sugestões**: lista de `suggestedActions`
  - **Botão**: "View Documentation" (se `documentationUrl` existir)
  - **Botão**: "Copy Error" (copia JSON completo)

### RF-002: Card de Erro em Execution Details
- Quando execução falha, a página DEVE mostrar card:
  - Header com categoria e código de erro
  - Mensagem principal
  - Seção "Details" com key-value pairs
  - Seção "Suggested Actions" com checkboxes (puramente visual)
  - Seção "Help" (se existir `help`)
  - Link para documentação

### RF-003: Destaque de Campos com Erro
- Quando erro contém `yamlLocation`, o editor YAML DEVE:
  - Adicionar sublinhado vermelho na linha indicada
  - Mostrar tooltip com mensagem de erro ao passar mouse
  - Auto-scroll para linha com erro

### RF-004: Agrupamento de Erros
- Quando pipeline tem múltiplos erros de validação, DEVE:
  - Agrupar por categoria
  - Numerar erros (1/5, 2/5, etc.)
  - Permitir navegar entre erros com setas

### RF-005: Badge de Categoria
- Cada erro DEVE ter badge colorido:
  - 🔵 **Configuration**: Azul
  - 🟡 **Authentication**: Amarelo
  - 🟠 **Network**: Laranja
  - 🔴 **Database**: Vermelho
  - 🟣 **Transformation**: Roxo

### RF-006: Indicador de Retry
- Se `isRetryable: true`, DEVE mostrar:
  - Badge verde "Retryable"
  - Botão "Retry Now" (se execução)

---

## 🚫 Requisitos Não Funcionais

### RNF-001: Acessibilidade
- Cores DEVEM ter contraste WCAG AA
- Screen readers DEVEM ler erros corretamente

### RNF-002: Responsividade
- Cards de erro DEVEM ser legíveis em mobile

---

## ✅ Critérios de Aceite (Gherkin)

```gherkin
Feature: Exibição de Erros Melhorados
  Como usuário
  Eu preciso ver erros formatados
  Para entender e corrigir rapidamente

  Scenario: Toast de erro estruturado
    Dado que API retornou:
      """json
      {
        "error": "ConnectorNotFound",
        "message": "Connector type 'httpJsonGet' not found.",
        "category": "Configuration",
        "suggestedActions": ["Did you mean 'httpjsonget'?"],
        "documentation": "https://docs.pype.io/connectors"
      }
      """
    Quando o erro for exibido
    Então DEVO ver toast com:
      | Ícone      | 🔵 (Configuration)                     |
      | Título     | Connector type 'httpJsonGet' not found |
      | Sugestão 1 | Did you mean 'httpjsonget'?            |
      | Botão      | View Documentation                     |
    E ao clicar em "View Documentation" DEVO ser redirecionado para https://docs.pype.io/connectors

  Scenario: Card de erro em execução falhada
    Dado que uma execução falhou com ConnectorNotFound
    Quando eu acessar a página de detalhes
    Então DEVO ver card de erro com:
      | Header              | 🔵 Configuration Error: ConnectorNotFound |
      | Mensagem            | Connector type 'httpJsonGet' not found    |
      | Details invalidType | httpJsonGet                               |
      | Suggested Action    | ☐ Did you mean 'httpjsonget'?             |

  Scenario: Destaque de erro no editor YAML
    Dado um erro com yamlLocation "steps[0].source.type"
    E isso corresponde à linha 3 do YAML
    Quando eu abrir o editor
    Então a linha 3 DEVE ter sublinhado vermelho
    E ao passar o mouse DEVO ver tooltip com mensagem de erro
    E o editor DEVE fazer scroll automático para linha 3

  Scenario: Copy Error to clipboard
    Dado que um erro está sendo exibido
    Quando eu clicar em "Copy Error"
    Então o JSON completo do erro DEVE ser copiado para clipboard
    E DEVO ver toast "Error copied to clipboard"

  Scenario: Badge de retry
    Dado um erro com isRetryable: true
    Quando o card for renderizado
    Então DEVO ver badge verde "Retryable"
    E DEVO ver botão "Retry Now"
```

---

## 📐 Especificações Técnicas

### Componentes

```typescript
// src/components/errors/ErrorToast.tsx
interface ErrorToastProps {
  error: PypeError;
  onDismiss: () => void;
}

// src/components/errors/ErrorCard.tsx
interface ErrorCardProps {
  error: PypeError;
  onRetry?: () => void;
}

// src/components/errors/ErrorBadge.tsx
interface ErrorBadgeProps {
  category: ErrorCategory;
  isRetryable: boolean;
}
```

### Types

```typescript
// src/types/error.ts
export interface PypeError {
  error: string;
  message: string;
  details?: Record<string, any>;
  suggestedActions?: string[];
  help?: string;
  documentation?: string;
  category: ErrorCategory;
  isRetryable: boolean;
  yamlLocation?: string;
}

export type ErrorCategory = 
  | 'Configuration' 
  | 'Authentication' 
  | 'Network' 
  | 'Database' 
  | 'Transformation';
```

---

## 📊 Impacto

### Componentes Afetados
- ✅ ErrorToast (novo)
- ✅ ErrorCard (novo)
- ✅ PipelineEditor (highlight de erros)
- ✅ ExecutionDetails (exibir erros)

---

## ✅ Checklist

- [ ] ErrorToast implementado
- [ ] ErrorCard implementado
- [ ] ErrorBadge implementado
- [ ] Integração com Monaco Editor
- [ ] Copy to clipboard funcionando
- [ ] Links de documentação clicáveis
- [ ] Testes E2E passando
- [ ] Merged para developer
