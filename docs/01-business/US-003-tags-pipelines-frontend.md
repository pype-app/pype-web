# US-003: Tags para Pipelines (Frontend)

**Data:** 2026-01-25  
**Prioridade:** Média  
**Tipo:** Nova Feature  
**Componente:** Frontend - Interface de Pipelines  
**Solicitado por:** Usuário  

---

## 📋 Descrição da Necessidade

Criar interface para que usuários possam **adicionar tags** ao criar/editar pipelines e **filtrar** a lista de pipelines por tags.

**Justificativa de Negócio:**
- Facilitar organização visual de pipelines
- Permitir busca rápida por categoria
- Melhorar navegabilidade em ambientes com muitos pipelines

---

## ✅ Critérios de Aceite

### Cenário 1: Adicionar Tags ao Criar Pipeline
```gherkin
Given o usuário está criando um novo pipeline
When ele preenche o formulário de criação
Then deve haver um campo "Tags" abaixo do nome
And o campo deve suportar entrada de múltiplas tags
And cada tag deve ser exibida como chip/badge
And o usuário deve poder remover tags clicando no "X"
```

### Cenário 2: Sugestão de Tags Existentes (Autocomplete)
```gherkin
Given o usuário está digitando no campo "Tags"
When ele digita parte de uma tag existente (ex: "fin")
Then deve aparecer dropdown com sugestões (ex: "financeiro")
And o usuário pode selecionar da lista ou criar nova
And tags novas são aceitas normalmente
```

### Cenário 3: Validação de Formato de Tags
```gherkin
Given o usuário tenta adicionar uma tag inválida (ex: "tag com espaço", "#tag!")
When ele confirma a adição
Then deve aparecer mensagem de erro
And a tag não deve ser adicionada
And deve mostrar exemplo de formato válido (ex: "use-hifen-ou_underscore")
```

### Cenário 4: Editar Tags de Pipeline Existente
```gherkin
Given o usuário está editando um pipeline existente
When o formulário carrega
Then as tags atuais devem aparecer como chips
And o usuário pode adicionar novas tags
And o usuário pode remover tags existentes
And ao salvar, as tags devem ser atualizadas
```

### Cenário 5: Filtrar Pipelines por Tags (Lista)
```gherkin
Given o usuário está na lista de pipelines
When ele visualiza a barra de filtros
Then deve haver um campo "Filtrar por Tags"
And deve exibir todas as tags disponíveis como opções
And o usuário pode selecionar uma ou mais tags
And a lista deve filtrar pipelines que possuem QUALQUER das tags selecionadas
```

### Cenário 6: Exibir Tags na Lista de Pipelines
```gherkin
Given o usuário está visualizando a lista de pipelines
When a tabela/cards de pipelines são renderizados
Then cada pipeline deve exibir suas tags como badges coloridos
And as tags devem estar visíveis sem precisar expandir detalhes
And clicar em uma tag deve filtrar por ela (opcional)
```

### Cenário 7: Contador de Tags
```gherkin
Given há pipelines com diversas tags
When o usuário abre o filtro de tags
Then cada tag deve exibir contador de pipelines (ex: "financeiro (15)")
And tags sem uso não devem aparecer (ou aparecer desabilitadas)
```

---

## 🎨 Referências de UX

### Componente de Entrada de Tags (Criação/Edição)
```
┌────────────────────────────────────────┐
│ Nome do Pipeline                       │
│ ┌────────────────────────────────────┐ │
│ │ Importação de Vendas               │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Tags                                   │
│ ┌────────────────────────────────────┐ │
│ │ [financeiro x] [diário x] [______] │ │ ← Input com autocomplete
│ └────────────────────────────────────┘ │
│   Digite para adicionar tags           │
└────────────────────────────────────────┘
```

**Características:**
- Input com sugestões (react-select, shadcn/ui Combobox, ou similar)
- Tags exibidas como chips/badges com botão de remover
- Validação em tempo real (formato alfanumérico + hífen/underscore)

### Filtro de Tags (Lista de Pipelines)
```
┌────────────────────────────────────────┐
│ Pipelines                              │
├────────────────────────────────────────┤
│ 🔍 Buscar    📋 Filtrar por Tags ▼     │
│                                        │
│ ✓ financeiro (15)                      │
│ ✓ diário (8)                           │
│ □ estoque (5)                          │
│ □ tempo-real (3)                       │
└────────────────────────────────────────┘
```

**Características:**
- Dropdown/modal com checkbox para cada tag
- Contador de pipelines por tag
- Aplicação de filtro ao selecionar/desselecionar

### Visualização de Tags (Lista)
```
┌──────────────────────────────────────────────┐
│ Nome                  Tags           Status  │
├──────────────────────────────────────────────┤
│ Importação de Vendas  [financeiro] [diário]  │
│                       [crítico]        ✓     │
│ Sync Produtos         [estoque]       ✓     │
└──────────────────────────────────────────────┘
```

**Cores sugeridas:**
- Tags diferentes = cores diferentes (baseado em hash do nome)
- Ou: categoria semântica (financeiro=azul, crítico=vermelho, etc.)

---

## 🎯 Escopo desta Feature

### Frontend (pype-web)
- [ ] Adicionar campo "Tags" ao formulário de criação/edição de pipeline
- [ ] Implementar componente de input de tags com autocomplete
- [ ] Integrar com API para buscar tags existentes (`GET /api/tags`)
- [ ] Validar formato de tags no frontend (antes de enviar ao backend)
- [ ] Exibir tags como badges na lista de pipelines
- [ ] Criar filtro de tags na página de listagem
- [ ] Atualizar `apiClient` para suportar query params de tags
- [ ] Atualizar Zustand store de pipelines para incluir filtro por tags
- [ ] Adicionar testes de componentes

---

## 📚 Referências Técnicas

- **Componente de input:** shadcn/ui Combobox, react-select, ou similar
- **API Client:** `src/lib/api-client.ts` - adicionar `getTags()` e `getPipelines({ tags: string[] })`
- **Store:** `src/store/pipelines.ts` - adicionar filtro de tags
- **Componentes afetados:**
  - `src/app/(dashboard)/pipelines/page.tsx` (lista)
  - `src/components/pipelines/PipelineForm.tsx` (criação/edição)

---

## 🔗 Dependências e Bloqueios

- **Depende de:** US-003-backend (endpoints de tags)
- **Bloqueia:** Nenhuma feature

---

## 📝 Notas Adicionais

- Tags devem ser salvas em lowercase para consistência
- Considerar limite visual de tags exibidas (ex: mostrar 3 + "...2 mais")
- Permitir clicar em tag na lista para filtrar rapidamente (UX premium)
