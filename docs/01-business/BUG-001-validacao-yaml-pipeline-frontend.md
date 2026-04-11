# BUG-001: Validação de YAML de Pipeline (Frontend)

**Data:** 2026-01-25  
**Severidade:** Média  
**Componente:** Interface - Editor de Pipelines  
**Reportado por:** Usuário  

---

## 📋 Comportamento Atual

Ao tentar salvar um pipeline no editor (sem realizar alterações no YAML), o usuário recebe um erro genérico de "YAML inválido", sem detalhes sobre:
- Onde está o erro no código
- Qual é a natureza do problema
- Como corrigir

A experiência do usuário é frustrante, pois não há feedback visual sobre qual parte do YAML está incorreta.

**Screenshot desejável:** (Quando disponível, anexar imagem mostrando a mensagem de erro genérica)

---

## ✅ Comportamento Esperado

**Critérios de Aceite (Testáveis pelo QA):**

### Cenário 1: Feedback Visual no Editor
```gherkin
Given um pipeline com erro de YAML
When o backend retorna o erro de validação
Then o editor Monaco deve destacar a linha com erro
And deve exibir tooltip com a mensagem de erro ao passar o mouse
And deve adicionar ícone de erro na margem esquerda
```

### Cenário 2: Mensagem de Erro Descritiva
```gherkin
Given um erro de validação ao salvar
When o erro é exibido ao usuário
Then deve aparecer um toast/alert com:
  | conteúdo        | exemplo                                          |
  | Título          | "Erro na linha 15, coluna 8"                     |
  | Descrição       | "Indentação incorreta. Esperado 2 espaços."      |
  | Ação sugerida   | "Corrija a indentação e tente novamente."        |
  | Botão           | "Ir para o erro" (scroll automático para linha)  |
```

### Cenário 3: Validação em Tempo Real (Opcional)
```gherkin
Given o usuário está editando o YAML
When há um erro de sintaxe
Then o editor deve marcar o erro com sublinhado vermelho
And deve exibir ícone de warning na linha
But não deve bloquear a digitação
```

### Cenário 4: Estado de Carregamento
```gherkin
Given o usuário clica em "Salvar"
When a requisição está sendo processada
Then o botão "Salvar" deve mostrar spinner
And deve ficar desabilitado
And deve exibir texto "Salvando..."
```

### Cenário 5: YAML Válido
```gherkin
Given um pipeline com YAML correto
When o usuário salva o pipeline
Then deve exibir toast de sucesso
And deve redirecionar para a lista de pipelines (ou permanecer no editor, conforme UX definida)
And o botão "Salvar" deve retornar ao estado normal
```

---

## 🔍 Passos para Reproduzir

1. Fazer login no Pype
2. Navegar para "Pipelines"
3. Clicar em "Editar" em um pipeline existente (ou "Criar Novo")
4. Colar o YAML fornecido no editor Monaco
5. Clicar em "Salvar"
6. Observar mensagem de erro genérica sem localização

---

## 🎯 Escopo desta Correção (Frontend)

- [ ] Integrar resposta de erro do backend (linha, coluna, mensagem)
- [ ] Adicionar marcação visual de erro no editor Monaco:
  - Sublinhado/destaque na linha com erro
  - Ícone na margem (gutter)
  - Tooltip com descrição
- [ ] Melhorar mensagens de erro exibidas ao usuário:
  - Toast com título, descrição e ação
  - Botão "Ir para o erro" que rola a visualização
- [ ] Adicionar estados de carregamento no botão "Salvar"
- [ ] (Opcional) Implementar validação em tempo real com debounce
- [ ] Garantir que erros sejam limpos ao corrigir o YAML

---

## 🎨 Referências de UX

**Editor Monaco - Marcação de Erros:**
```typescript
// Exemplo conceitual (não implementar - apenas referência para o desenvolvedor)
monaco.editor.setModelMarkers(model, 'yaml-validator', [
  {
    startLineNumber: 15,
    startColumn: 8,
    endLineNumber: 15,
    endColumn: 20,
    message: 'Indentação incorreta. Esperado 2 espaços.',
    severity: monaco.MarkerSeverity.Error,
  },
]);
```

**Toast de Erro:**
- **Tipo:** Error (vermelho)
- **Duração:** 8 segundos (ou até fechar manualmente)
- **Posição:** Top-right
- **Ações:** Botão "Ir para erro" + ícone de fechar

---

## 📚 Referências Técnicas

- **Componente afetado:** `src/components/pipelines/PipelineEditor.tsx` (ou similar)
- **API Client:** `src/lib/api-client.ts` (interceptor de erros)
- **Biblioteca de UI:** (shadcn/ui toast? A ser confirmado)
- **Editor:** Monaco Editor (configuração de markers e decorações)

---

## 🔗 Arquivos Relacionados

- **Backend:** [BUG-001-validacao-yaml-pipeline-backend.md](../../pype-admin/docs/01-business/BUG-001-validacao-yaml-pipeline-backend.md)
- **Componente Editor:** (quando mapeado pelo Arquiteto em `02-architecture`)
