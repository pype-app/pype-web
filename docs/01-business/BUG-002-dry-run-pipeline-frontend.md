# BUG-002: Dry-Run de Pipeline Não Usa YAML do Editor (Frontend)

**Data:** 2026-01-25  
**Severidade:** Alta  
**Componente:** Interface - Editor de Pipelines  
**Reportado por:** Usuário  

---

## 📋 Comportamento Atual

Ao clicar em "Dry-Run" (ou "Testar Pipeline") sem salvar as alterações no editor, o sistema executa o teste com o YAML **antigo** (salvo no banco), não com o YAML atual que está visível no editor.

**Fluxo atual (incorreto):**
1. Usuário edita YAML no editor Monaco
2. Usuário clica em "Dry-Run"
3. Frontend envia apenas `pipelineId` para o backend
4. Backend busca YAML do banco (versão antiga)
5. Resultado do teste não reflete as mudanças

**Expectativa frustrada:** O usuário espera que o dry-run teste exatamente o que está vendo no editor naquele momento.

---

## ✅ Comportamento Esperado

**Critérios de Aceite (Testáveis pelo QA):**

### Cenário 1: Dry-Run com Alterações Não Salvas
```gherkin
Given um pipeline aberto no editor
And o usuário modifica o YAML
But NÃO salva as alterações
When o usuário clica em "Dry-Run"
Then o frontend deve capturar o conteúdo atual do editor Monaco
And deve enviar este YAML no corpo da requisição para o backend
And deve exibir indicador de "Testando..." durante a execução
```

### Cenário 2: Feedback Visual Durante Dry-Run
```gherkin
Given o usuário clicou em "Dry-Run"
When a requisição está sendo processada
Then o botão "Dry-Run" deve mostrar spinner
And deve ficar desabilitado
And deve exibir texto "Testando..."
And o editor deve ficar em modo somente-leitura (opcional)
```

### Cenário 3: Exibição de Resultados
```gherkin
Given o dry-run foi executado com sucesso
When o backend retorna os resultados
Then deve abrir modal/painel com:
  | elemento          | descrição                                        |
  | Título            | "Resultado do Dry-Run"                           |
  | Status Geral      | Ícone verde/vermelho + "Sucesso" ou "Falha"      |
  | Lista de Steps    | Cada step com status, duração e logs             |
  | Registros Testados| Quantidade de dados processados (se aplicável)   |
  | Warnings          | Lista de avisos, se houver                       |
  | Botão Fechar      | Fecha o modal e retorna ao editor                |
```

### Cenário 4: Dry-Run de Pipeline Novo
```gherkin
Given o usuário está criando um novo pipeline (sem ID)
And escreveu o YAML no editor
When clica em "Dry-Run"
Then o frontend deve enviar apenas o YAML (sem pipelineId)
And deve funcionar normalmente
```

### Cenário 5: Tratamento de Erros
```gherkin
Given o dry-run falhou por erro de YAML
When o backend retorna erro 400/422
Then deve exibir toast de erro
And deve marcar a linha com erro no editor (conforme BUG-001)
And o botão "Dry-Run" deve retornar ao estado normal
```

---

## 🔍 Passos para Reproduzir

1. Fazer login no Pype
2. Abrir um pipeline existente para edição
3. Modificar qualquer linha do YAML (ex: adicionar comentário `# teste`)
4. **Não clicar em "Salvar"**
5. Clicar no botão "Dry-Run" ou "Testar Pipeline"
6. Observar que o resultado não inclui a modificação feita

---

## 🎯 Escopo desta Correção (Frontend)

- [ ] Modificar handler do botão "Dry-Run" para:
  - Capturar conteúdo atual do editor Monaco (`editor.getValue()`)
  - Enviar YAML no corpo da requisição (não apenas `pipelineId`)
- [ ] Atualizar chamada de API para novo endpoint/contrato
- [ ] Implementar estados de carregamento no botão "Dry-Run"
- [ ] Criar componente de exibição de resultados (modal/drawer)
- [ ] Integrar feedback de erros com marcação no editor (BUG-001)
- [ ] (Opcional) Bloquear edição durante dry-run

---

## 🎨 Referências de UX

### Botão Dry-Run - Estados:
```typescript
// Conceitual - não implementar literalmente
type DryRunButtonState = 
  | { status: 'idle', label: 'Dry-Run', disabled: false }
  | { status: 'loading', label: 'Testando...', disabled: true, icon: 'spinner' }
  | { status: 'success', label: 'Testado ✓', disabled: false } // 2s temporário
  | { status: 'error', label: 'Falhou ✗', disabled: false };   // 2s temporário
```

### Modal de Resultados - Estrutura:
```
┌─────────────────────────────────────────────┐
│  Resultado do Dry-Run                    [X]│
├─────────────────────────────────────────────┤
│  ✓ Sucesso - 4 steps executados (1.2s)     │
│                                             │
│  📋 Steps:                                  │
│  ├─ 1. Auth           ✓  (234ms)           │
│  │   └─ Token obtained successfully        │
│  ├─ 2. MySQL Source   ✓  (567ms)           │
│  │   └─ 10 records retrieved                │
│  ├─ 3. Transform      ✓  (45ms)            │
│  │   └─ 10 records transformed             │
│  └─ 4. HTTP Sink      ⚠  (123ms)           │
│      └─ DRY-RUN: 10 records would be sent  │
│                                             │
│  ⚠️ 1 Warning:                              │
│  • Step 4: Sink execution simulated         │
│                                             │
│              [Fechar]                       │
└─────────────────────────────────────────────┘
```

---

## 📚 Referências Técnicas

- **Componente afetado:** `src/components/pipelines/PipelineEditor.tsx` (ou similar)
- **API Client:** `src/lib/api-client.ts` - adicionar método `dryRunPipeline(yaml: string, pipelineId?: string)`
- **Monaco Editor:** `editor.getValue()` para capturar YAML atual
- **Biblioteca de Modal:** (shadcn/ui Dialog? A ser confirmado)

---

## 🔗 Arquivos Relacionados

- **Backend:** [BUG-002-dry-run-pipeline-backend.md](../../pype-admin/docs/01-business/BUG-002-dry-run-pipeline-backend.md)
- **BUG Relacionado:** [BUG-001 - Validação de YAML](BUG-001-validacao-yaml-pipeline-frontend.md)
