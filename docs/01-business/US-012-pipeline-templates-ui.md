# US-012: Galeria de Templates de Pipelines (Frontend)

**ID**: US-012  
**Origem**: IMP-012  
**Prioridade**: Baixa  
**Esforço**: 2-3 dias  
**Tipo**: Feature  
**Componente**: Frontend (pype-web)

---

## 📋 História de Usuário

**Como** Desenvolvedor de Pipelines  
**Quero** navegar e usar templates de pipelines  
**Para** criar pipelines rapidamente

---

## 🎯 Contexto de Negócio

Com templates implementados no backend (US-012-backend), o frontend precisa:
- Galeria visual de templates
- Preview do YAML antes de criar
- Formulário para variáveis
- Wizard de criação passo-a-passo

---

## 🔧 Requisitos Funcionais

### RF-001: Página de Galeria
- Rota: `/pipelines/new/from-template`
- DEVE exibir cards de templates com:
  - Nome e descrição
  - Category badge
  - Difficulty badge
  - Estimated time
  - Tags
  - Preview button

### RF-002: Filtros
- Filtrar por:
  - Category (dropdown)
  - Difficulty (chips)
  - Tags (search)

### RF-003: Template Preview
- Modal com:
  - YAML preview (read-only)
  - Lista de variáveis necessárias
  - Lista de secrets requeridos
  - Botão "Use This Template"

### RF-004: Create from Template Wizard
- Passo 1: Configurar variáveis
- Passo 2: Validar secrets
- Passo 3: Preview final
- Passo 4: Criar pipeline

### RF-005: Botão no Dashboard
- Botão "Create from Template" no dashboard
- Redireciona para galeria

---

## ✅ Critérios de Aceite (Gherkin)

```gherkin
Feature: Template Gallery
  Como usuário
  Eu preciso navegar templates
  Para criar pipelines rapidamente

  Scenario: Galeria de templates
    Dado que estou em /pipelines/new/from-template
    Quando a página carregar
    Então DEVO ver pelo menos 5 cards de templates
    Com nome, descrição, category e difficulty

  Scenario: Preview de template
    Dado que estou na galeria
    Quando eu clicar em "Preview" de um template
    Então DEVO ver modal com YAML preview
    E lista de variáveis necessárias

  Scenario: Wizard de criação
    Dado que cliquei em "Use This Template"
    Quando o wizard abrir
    Então DEVO ver formulário com campos para cada variável
    E botão "Next"

  Scenario: Validação de secrets
    Dado que estou no passo 2 do wizard
    E template requer secret "api/token"
    E o secret NÃO existe
    Quando a validação executar
    Então DEVO ver warning "Secret 'api/token' not found"
    Com botão "Create Secret"
```

---

## 📐 Especificações Técnicas

### Componentes

```typescript
// src/app/(dashboard)/pipelines/new/from-template/page.tsx
export function TemplateGalleryPage() {
  const { data: templates } = useTemplates();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  
  return (
    <div>
      <TemplateFilters onCategoryChange={setSelectedCategory} />
      <TemplateGrid templates={filteredTemplates} />
    </div>
  );
}

// src/components/templates/TemplateCard.tsx
interface TemplateCardProps {
  template: PipelineTemplate;
  onPreview: () => void;
  onUse: () => void;
}

// src/components/templates/CreateFromTemplateWizard.tsx
interface CreateFromTemplateWizardProps {
  templateId: string;
  open: boolean;
  onClose: () => void;
}
```

---

## ✅ Checklist

- [ ] TemplateGalleryPage criada
- [ ] TemplateCard implementado
- [ ] CreateFromTemplateWizard funcionando
- [ ] Filtros implementados
- [ ] Validação de secrets no wizard
- [ ] Testes E2E passando
- [ ] Merged para developer
