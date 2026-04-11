# US-004: Cadastro de Configurações de Conectores (Frontend)

**Data:** 2026-01-25  
**Prioridade:** Alta  
**Tipo:** Nova Feature (Grande)  
**Componente:** Frontend - Connector Profiles  
**Solicitado por:** Usuário  

---

## 📋 Descrição da Necessidade

Criar interface de gerenciamento de **Connector Profiles** (perfis de conectores) que permite usuários cadastrarem, editarem e reutilizarem configurações de sources/sinks em múltiplos pipelines.

**Justificativa de Negócio:**
- Eliminar duplicação de configurações nos YAMLs
- Centralizar manutenção de credenciais e URLs
- Reduzir erros humanos ao copiar/colar configurações
- Melhorar governança e auditoria de integrações

---

## ✅ Critérios de Aceite

### Cenário 1: Acessar Página de Connector Profiles
```gherkin
Given o usuário está autenticado
When ele navega para "Configurações" > "Connector Profiles"
Then deve visualizar lista de profiles existentes
And deve haver botão "Novo Profile"
And a lista deve mostrar: Nome, Tipo, Conector, Uso (quantidade de pipelines)
```

### Cenário 2: Criar Novo Connector Profile
```gherkin
Given o usuário clica em "Novo Profile"
When o formulário de criação é exibido
Then deve solicitar os campos:
  | campo          | tipo            | obrigatório |
  | Nome           | text            | sim         |
  | Tipo           | select (source/sink) | sim    |
  | Conector       | select          | sim         |
  | Parâmetros     | JSON editor     | sim         |
  | Auth Profile   | select          | não         |
  | Descrição      | textarea        | não         |
And ao salvar, deve criar o profile via API
And deve redirecionar para lista ou exibir toast de sucesso
```

### Cenário 3: Validação de Nome Duplicado
```gherkin
Given existe um Connector Profile com nome "mysql_api"
When o usuário tenta criar novo profile com mesmo nome
Then a API deve retornar erro 409
And o frontend deve exibir mensagem "Nome já existe"
And não deve permitir salvar
```

### Cenário 4: Editor de Parâmetros (JSON)
```gherkin
Given o usuário está criando/editando um profile
When ele preenche o campo "Parâmetros"
Then deve haver um editor JSON com syntax highlighting
And deve validar JSON em tempo real
And deve exibir erro se JSON inválido
And deve sugerir estrutura baseada no tipo de conector (opcional)
```

### Cenário 5: Editar Connector Profile
```gherkin
Given o usuário visualiza a lista de profiles
When ele clica em "Editar" em um profile existente
Then deve abrir formulário preenchido com dados atuais
And deve permitir alterar Parâmetros, Auth Profile e Descrição
And NÃO deve permitir alterar Nome (ou avisar sobre impacto)
And ao salvar, deve atualizar via API
```

### Cenário 6: Visualizar Pipelines que Usam Profile
```gherkin
Given um Connector Profile é usado em 5 pipelines
When o usuário clica em "Ver Uso" ou "5 pipelines"
Then deve abrir modal/página listando os pipelines
And cada pipeline deve ter link para edição
And deve facilitar identificação de dependências
```

### Cenário 7: Deletar Connector Profile Não Usado
```gherkin
Given um Connector Profile não está sendo usado
When o usuário clica em "Deletar"
Then deve pedir confirmação
And ao confirmar, deve deletar via API
And deve remover da lista
```

### Cenário 8: Impedir Deleção de Profile em Uso
```gherkin
Given um Connector Profile é usado em 3 pipelines
When o usuário clica em "Deletar"
Then a API deve retornar erro 409
And o frontend deve exibir mensagem:
  "Este profile está sendo usado em 3 pipelines. Remova as referências antes de deletar."
And deve listar os pipelines
And o profile NÃO deve ser deletado
```

### Cenário 9: Autocomplete de profileRef no Editor YAML
```gherkin
Given o usuário está editando um pipeline YAML
And digita "profileRef: "
When o cursor está após os dois pontos
Then o editor Monaco deve sugerir profiles disponíveis
And ao selecionar, deve autocomplete o nome
And deve validar se o profile existe ao salvar
```

### Cenário 10: Filtrar Profiles por Tipo
```gherkin
Given existem profiles de type "source" e "sink"
When o usuário seleciona filtro "Source" na lista
Then deve exibir apenas profiles do tipo source
And o contador de resultados deve atualizar
```

---

## 🎨 Referências de UX

### Lista de Connector Profiles
```
┌────────────────────────────────────────────────────────────┐
│ Connector Profiles                    [+ Novo Profile]     │
├────────────────────────────────────────────────────────────┤
│ Filtros: [Source ▼] [Buscar...]                           │
├────────────────────────────────────────────────────────────┤
│ Nome              Tipo    Conector            Uso   Ações  │
│ mysql_posts_api   source  HttpJsonGetSource   5    [✏️ 🗑️] │
│ mssql_sink        sink    SqlServerSink       12   [✏️ 🗑️] │
│ postgres_orders   source  PostgreSqlSource    0    [✏️ 🗑️] │
└────────────────────────────────────────────────────────────┘
```

### Formulário de Criação/Edição
```
┌──────────────────────────────────────────┐
│ Novo Connector Profile              [X]  │
├──────────────────────────────────────────┤
│ Nome *                                   │
│ ┌──────────────────────────────────────┐ │
│ │ mysql_posts_api                      │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Tipo *                                   │
│ ⦿ Source  ○ Sink                         │
│                                          │
│ Conector *                               │
│ ┌──────────────────────────────────────┐ │
│ │ HttpJsonGetSourceConnector        ▼  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Parâmetros (JSON) *                      │
│ ┌──────────────────────────────────────┐ │
│ │ {                                    │ │
│ │   "url": "https://...",              │ │
│ │   "responseType": "json"             │ │
│ │ }                                    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Auth Profile                             │
│ ┌──────────────────────────────────────┐ │
│ │ mysql_api                         ▼  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Descrição                                │
│ ┌──────────────────────────────────────┐ │
│ │ API de posts do MySQL (teste)        │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              [Cancelar] [Salvar]         │
└──────────────────────────────────────────┘
```

### Modal de Pipelines Usando Profile
```
┌──────────────────────────────────────────┐
│ Pipelines usando "mysql_posts_api"  [X] │
├──────────────────────────────────────────┤
│ Este profile é usado em 5 pipelines:     │
│                                          │
│ • Pipeline A - Importação Diária  [🔗]  │
│ • Pipeline B - Sync Produtos      [🔗]  │
│ • Pipeline C - Vendas Mensais     [🔗]  │
│ • Pipeline D - Relatórios         [🔗]  │
│ • Pipeline E - Teste QA           [🔗]  │
│                                          │
│                    [Fechar]              │
└──────────────────────────────────────────┘
```

---

## 🎯 Escopo desta Feature

### Frontend (pype-web)
- [ ] Criar rota `/settings/connector-profiles` (ou similar)
- [ ] Criar página de listagem de Connector Profiles
- [ ] Criar formulário de criação/edição de profile
- [ ] Implementar editor JSON com validação (Monaco ou similar)
- [ ] Adicionar autocomplete de `profileRef` no editor YAML de pipelines
- [ ] Implementar validação de profileRef ao salvar pipeline
- [ ] Criar modal de visualização de dependências (pipelines usando profile)
- [ ] Adicionar filtros por tipo (source/sink) e busca por nome
- [ ] Implementar confirmação de deleção com verificação de uso
- [ ] Atualizar `apiClient` com métodos para Connector Profiles:
  - `getConnectorProfiles(type?: string)`
  - `createConnectorProfile(data)`
  - `updateConnectorProfile(id, data)`
  - `deleteConnectorProfile(id)`
  - `getConnectorProfileUsage(id)`
- [ ] Adicionar testes de componentes

---

## 📚 Referências Técnicas

- **Páginas:**
  - `src/app/(dashboard)/settings/connector-profiles/page.tsx` (lista)
  - `src/app/(dashboard)/settings/connector-profiles/new/page.tsx` (criação)
  - `src/app/(dashboard)/settings/connector-profiles/[id]/page.tsx` (edição)
- **Componentes:**
  - `src/components/connector-profiles/ProfileForm.tsx`
  - `src/components/connector-profiles/ProfileList.tsx`
  - `src/components/connector-profiles/UsageModal.tsx`
- **API Client:** `src/lib/api-client.ts`
- **Store (opcional):** `src/store/connector-profiles.ts` (Zustand)
- **Editor YAML:** Modificar `src/components/pipelines/PipelineEditor.tsx` para autocomplete

---

## 🔗 Dependências e Bloqueios

- **Depende de:** US-004-backend (API de Connector Profiles)
- **Bloqueia:** Nenhuma feature

---

## 📝 Notas Adicionais

- Considerar templates de parâmetros para cada tipo de conector (facilitar preenchimento)
- Editor JSON deve aceitar variáveis (${env:...}, ${secret:...}) sem marcar como erro
- Autocomplete no Monaco exige configuração customizada de language service
- Validar se profileRef existe antes de executar dry-run
