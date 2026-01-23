# US-013: YAML IntelliSense no Monaco Editor (Frontend)

**ID**: US-013  
**Origem**: IMP-013  
**Prioridade**: Média  
**Esforço**: 2-3 dias  
**Tipo**: Feature  
**Componente**: Frontend (pype-web)

---

## 📋 História de Usuário

**Como** Desenvolvedor de Pipelines  
**Quero** ter autocomplete e validação em tempo real no editor YAML  
**Para** criar pipelines mais rapidamente e sem erros

---

## 🎯 Contexto de Negócio

**Sem IntelliSense**:
- ❌ Erros de sintaxe só descobertos ao salvar
- ❌ Precisa memorizar nomes de campos
- ❌ Sem documentação inline
- ❌ Experiência inferior a IDEs modernas

**Com IntelliSense**:
- ✅ Autocomplete de campos e valores
- ✅ Validação em tempo real (sublinhado vermelho)
- ✅ Hover documentation
- ✅ Sugestões de correção
- ✅ Snippets para casos comuns

---

## 🔧 Requisitos Funcionais

### RF-001: Autocomplete de Campos
- Ao digitar, DEVE mostrar sugestões contextuais:
  - Root level: `pipeline`, `version`, `auth`, `steps`, `schedule`, `triggers`
  - Inside `steps[]`: `source`, `transform`, `sink`, `name`
  - Inside `source`: `type`, `params`, `retry`, `rateLimit`

### RF-002: Autocomplete de Valores
- Para campos enum, sugerir valores válidos:
  - `source.type`: `httpjsonget`, `httpjsonpost`, `MySql.MySqlSinkConnector`
  - `retry.backoffType`: `fixed`, `exponential`, `linear`
  - `rateLimit.behavior`: `wait`, `reject`

### RF-003: Validação em Tempo Real
- Erros DEVEM aparecer com sublinhado vermelho:
  - Campo obrigatório faltando
  - Tipo incorreto (string esperada, int fornecido)
  - Valor inválido para enum
  - CRON expression inválida

### RF-004: Hover Documentation
- Ao passar mouse sobre campo, mostrar:
  - Descrição do campo
  - Tipo esperado
  - Valores possíveis (se enum)
  - Exemplo de uso

### RF-005: Snippets
- Atalhos para inserir blocos comuns:
  - `step-http-get` → Template de step HTTP GET
  - `step-mysql-sink` → Template de step MySQL Sink
  - `retry-config` → Template de retry configuration
  - `auth-bearer` → Template de auth profile

### RF-006: Error Markers
- Lista de erros à esquerda do editor:
  - Ícone vermelho na linha com erro
  - Click navega para o erro
  - Tooltip com mensagem de erro

### RF-007: Quick Fixes
- Lightbulb (💡) para sugestões de correção:
  - "Did you mean 'httpjsonget'?" → Auto-fix
  - "Add required field 'url'" → Inserir campo
  - "Convert to number" → Ajustar tipo

### RF-008: Schema Validation
- Usar JSON Schema do backend para validação
- Endpoint: `GET /api/pipelines/schema`
- Carregar schema ao montar editor

---

## 🚫 Requisitos Não Funcionais

### RNF-001: Performance
- Validação DEVE ocorrer com debounce de 500ms
- Autocomplete DEVE aparecer em < 100ms

### RNF-002: UX
- Não bloquear digitação durante validação
- Permitir salvar mesmo com warnings (apenas errors bloqueiam)

---

## ✅ Critérios de Aceite (Gherkin)

```gherkin
Feature: YAML IntelliSense no Monaco Editor
  Como desenvolvedor
  Eu preciso de autocomplete e validação
  Para criar pipelines rapidamente

  Scenario: Autocomplete de campos root
    Dado que estou no editor YAML vazio
    Quando eu digitar "p" no início do arquivo
    Então DEVO ver dropdown com:
      | Sugestão  | Descrição                      |
      | pipeline  | Pipeline name (required)       |
    E ao selecionar "pipeline", DEVE inserir "pipeline: "

  Scenario: Autocomplete de connector type
    Dado que tenho YAML:
      """yaml
      steps:
        - source:
            type: 
      """
    Quando o cursor estiver após "type: "
    Então DEVO ver dropdown com:
      | Sugestão                      | Descrição           |
      | httpjsonget                   | HTTP JSON GET       |
      | httpjsonpost                  | HTTP JSON POST      |
      | MySql.MySqlSinkConnector      | MySQL Sink          |
      | Sankhya.SankhyaSbrSourceConnector | Sankhya Source  |

  Scenario: Validação em tempo real de campo obrigatório
    Dado que tenho YAML:
      """yaml
      steps:
        - source:
            type: httpjsonget
            params: {}
      """
    Quando 500ms se passarem após última digitação
    Então DEVO ver sublinhado vermelho em "params: {}"
    E ao passar mouse, DEVO ver tooltip:
      """
      Required field 'url' is missing
      """

  Scenario: Hover documentation
    Dado que tenho YAML:
      """yaml
      schedule: "0 */6 * * *"
      ```
    Quando eu passar o mouse sobre "schedule"
    Então DEVO ver popup com:
      """
      schedule: string (optional)
      
      CRON expression for scheduled execution.
      
      Examples:
        0 */6 * * * - Every 6 hours
        0 0 * * *   - Daily at midnight
        0 9 * * 1-5 - Weekdays at 9am
      
      Learn more: https://crontab.guru/
      """

  Scenario: Snippet de HTTP GET step
    Dado que estou no editor
    Quando eu digitar "step-http-get" e pressionar Tab
    Então DEVE inserir:
      """yaml
      - source:
          type: httpjsonget
          params:
            url: ${secret:api/url}
          retry:
            maxAttempts: 3
            backoffSeconds: [1, 2, 4]
      ```
    E o cursor DEVE estar em "api/url" (selecionado para edição)

  Scenario: Error marker na linha
    Dado que tenho YAML:
      ```yaml
      pipeline: test
      version: "1.0"
      steps:
        - source:
            type: invalid-type
      ```
    Quando a validação executar
    Então DEVO ver ícone vermelho na linha 5
    E ao clicar no ícone, DEVO navegar para linha 5

  Scenario: Quick fix para typo
    Dado que tenho YAML:
      ```yaml
      - source:
          type: httpJsonGet
      ```
    E existe erro "Connector 'httpJsonGet' not found"
    Quando eu clicar no lightbulb 💡
    Então DEVO ver opção "Did you mean 'httpjsonget'?"
    E ao selecionar, DEVE corrigir para "httpjsonget"

  Scenario: Validação de CRON expression
    Dado que tenho YAML:
      ```yaml
      schedule: "invalid cron"
      ```
    Quando a validação executar
    Então DEVO ver sublinhado vermelho em "invalid cron"
    E ao passar mouse, DEVO ver:
      """
      Invalid CRON expression.
      Must have 5 fields: minute hour day month weekday
      ```

  Scenario: Schema carregado do backend
    Dado que o backend expõe GET /api/pipelines/schema
    Quando o editor montar
    Então DEVE fazer request para /api/pipelines/schema
    E DEVE carregar schema no Monaco Editor
    E validação DEVE usar o schema carregado

  Scenario: Autocomplete de valores booleanos
    Dado que tenho YAML:
      ```yaml
      triggers:
        webhook:
          enabled: 
      ```
    Quando o cursor estiver após "enabled: "
    Então DEVO ver dropdown com:
      | Sugestão | 
      | true     |
      | false    |

  Scenario: Snippets de retry configuration
    Dado que estou editando um step
    Quando eu digitar "retry-exp" e pressionar Tab
    Então DEVE inserir:
      ```yaml
      retry:
        maxAttempts: 5
        backoffType: exponential
        backoffSeconds: [1, 2, 4, 8, 16]
        retryOn:
          statusCodes: [429, 500, 502, 503]
      ```
```

---

## 📐 Especificações Técnicas

### Monaco Editor Configuration

```typescript
// src/components/pipelines/PipelineEditor.tsx
import * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';

export function PipelineEditor() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const [schema, setSchema] = useState<any>(null);
  
  useEffect(() => {
    // Carregar schema do backend
    fetch('/api/pipelines/schema')
      .then(res => res.json())
      .then(setSchema);
  }, []);
  
  useEffect(() => {
    if (!schema) return;
    
    // Configurar YAML language service
    monaco.languages.yaml.yamlDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: false,
      hover: true,
      completion: true,
      format: true,
      schemas: [
        {
          uri: 'https://pype.io/schemas/pipeline.json',
          fileMatch: ['*'],
          schema: schema
        }
      ]
    });
    
    // Registrar snippets
    monaco.languages.registerCompletionItemProvider('yaml', {
      provideCompletionItems: (model, position) => {
        const suggestions = createSnippets(position);
        return { suggestions };
      }
    });
    
    // Configurar validação customizada
    monaco.editor.onDidChangeModelContent(() => {
      const model = editorRef.current?.getModel();
      if (!model) return;
      
      const value = model.getValue();
      validateYaml(value).then(errors => {
        monaco.editor.setModelMarkers(model, 'yaml', errors);
      });
    });
  }, [schema]);
  
  return (
    <MonacoEditor
      language="yaml"
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        glyphMargin: true, // Para error markers
        lightbulb: { enabled: true }, // Para quick fixes
        quickSuggestions: true,
        suggestOnTriggerCharacters: true
      }}
      onMount={(editor) => {
        editorRef.current = editor;
      }}
    />
  );
}
```

### Snippets Definition

```typescript
// src/lib/yaml-snippets.ts
import * as monaco from 'monaco-editor';

export function createSnippets(position: monaco.Position): monaco.languages.CompletionItem[] {
  return [
    {
      label: 'step-http-get',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: [
        '- source:',
        '    type: httpjsonget',
        '    params:',
        '      url: ${1:https://api.example.com/data}',
        '    retry:',
        '      maxAttempts: ${2:3}',
        '      backoffSeconds: [1, 2, 4]'
      ].join('\n'),
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'HTTP JSON GET Source step template'
    },
    {
      label: 'step-mysql-sink',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: [
        '- sink:',
        '    type: MySql.MySqlSinkConnector',
        '    options:',
        '      tableName: ${1:table_name}',
        '      mode: ${2|insert,upsert,update|}'
      ].join('\n'),
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'MySQL Sink step template'
    },
    {
      label: 'retry-exponential',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: [
        'retry:',
        '  maxAttempts: ${1:5}',
        '  backoffType: exponential',
        '  backoffSeconds: [1, 2, 4, 8, 16]',
        '  retryOn:',
        '    statusCodes: [429, 500, 502, 503]'
      ].join('\n'),
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Exponential retry configuration'
    },
    {
      label: 'auth-bearer',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: [
        'auth:',
        '  - name: ${1:api-auth}',
        '    type: bearer',
        '    params:',
        '      token: ${secret:${2:api/token}}'
      ].join('\n'),
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Bearer token authentication profile'
    }
  ];
}
```

### Custom Validation

```typescript
// src/lib/yaml-validator.ts
import * as yaml from 'js-yaml';
import * as monaco from 'monaco-editor';

export async function validateYaml(content: string): Promise<monaco.editor.IMarkerData[]> {
  const markers: monaco.editor.IMarkerData[] = [];
  
  try {
    // Parse YAML
    const parsed = yaml.load(content);
    
    // Validar schedule se existir
    if (parsed.schedule) {
      const cronValid = validateCron(parsed.schedule);
      if (!cronValid.valid) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: cronValid.error!,
          startLineNumber: findLineNumber(content, 'schedule'),
          startColumn: 1,
          endLineNumber: findLineNumber(content, 'schedule'),
          endColumn: 100
        });
      }
    }
    
    // Validar connector types
    if (parsed.steps) {
      for (const [index, step] of parsed.steps.entries()) {
        const connectorType = step.source?.type || step.sink?.type;
        if (connectorType) {
          const valid = await validateConnectorType(connectorType);
          if (!valid.exists) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              message: `Connector '${connectorType}' not found. Did you mean '${valid.suggestion}'?`,
              startLineNumber: findStepLine(content, index),
              startColumn: 1,
              endLineNumber: findStepLine(content, index),
              endColumn: 100,
              tags: [monaco.MarkerTag.Unnecessary]
            });
          }
        }
      }
    }
  } catch (err) {
    // Erro de parse YAML
    markers.push({
      severity: monaco.MarkerSeverity.Error,
      message: err.message,
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 100
    });
  }
  
  return markers;
}

function validateCron(cron: string): { valid: boolean; error?: string } {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      valid: false,
      error: 'Invalid CRON expression. Must have 5 fields: minute hour day month weekday'
    };
  }
  return { valid: true };
}

async function validateConnectorType(type: string): Promise<{ exists: boolean; suggestion?: string }> {
  const response = await fetch('/api/connectors/available');
  const available: string[] = await response.json();
  
  if (available.includes(type)) {
    return { exists: true };
  }
  
  // Fuzzy match para sugestão
  const suggestion = available.find(a => a.toLowerCase() === type.toLowerCase());
  return { exists: false, suggestion };
}
```

---

## 🧪 Cenários de Teste

### Testes E2E
1. **TestAutocompleteAppears**: Verificar dropdown ao digitar
2. **TestSnippetInsertion**: Testar inserção de snippet
3. **TestErrorMarkers**: Verificar marcadores de erro
4. **TestHoverDocumentation**: Verificar popup de documentação
5. **TestQuickFix**: Testar correção automática

---

## 📊 Impacto

### Dependências
- **monaco-editor**: Editor base
- **monaco-yaml**: YAML language service
- **js-yaml**: Parser YAML

---

## ✅ Checklist

- [ ] Monaco Editor configurado com YAML support
- [ ] Schema carregado do backend
- [ ] Autocomplete de campos implementado
- [ ] Snippets registrados
- [ ] Validação em tempo real funcionando
- [ ] Hover documentation implementado
- [ ] Error markers visíveis
- [ ] Quick fixes implementados
- [ ] Testes E2E passando
- [ ] Merged para developer
