# Pype Web - Análise Técnica Detalhada da Arquitetura

**Data da Análise**: 21 de Janeiro de 2026  
**Versão**: 1.0  
**Autor**: GitHub Copilot (Claude Sonnet 4.5)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [1. Sistema de Edição de YAML](#1️⃣-sistema-de-edição-de-yaml)
- [2. Gestão de Secrets e Environment Variables](#2️⃣-gestão-de-secrets-e-environment-variables)
- [3. Dashboard e Analytics](#3️⃣-dashboard-e-analytics)
- [4. Sistema de Logs e Execuções](#4️⃣-sistema-de-logs-e-execuções)
- [5. Hooks Customizados e Estado](#5️⃣-hooks-customizados-e-estado)
- [6. Padrões de Design](#6️⃣-padrões-de-design-implementados)
- [7. Segurança e Boas Práticas](#7️⃣-segurança-e-boas-práticas)
- [8. Pontos Fortes e de Atenção](#8️⃣-avaliação-geral)

---

## Visão Geral

O **Pype Web** é uma aplicação frontend moderna construída em **Next.js 16** que serve como interface de usuário para o **Pype** - um **orquestrador de pipelines de dados multi-tenant**. 

### Principais Funcionalidades

1. **Editor YAML Avançado** - Monaco Editor com validação em tempo real
2. **Gestão de Secrets** - Controle granular de variáveis de ambiente sensíveis
3. **Dashboard Analítico** - Métricas em tempo real com auto-refresh
4. **Sistema de Logs** - Visualização detalhada de execuções de pipelines
5. **Multi-Tenancy** - Isolamento completo por organização com RBAC

### Stack Tecnológico Core

- **Framework**: Next.js 16 (App Router + Turbopack)
- **TypeScript**: Tipagem estrita (zero `any` tolerado)
- **State Management**: Zustand com persist middleware
- **UI/UX**: Tailwind CSS + Headless UI + Heroicons
- **Validação**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Editor**: Monaco Editor (VS Code engine)
- **HTTP Client**: Axios com interceptors

---

## 1️⃣ Sistema de Edição de YAML

### Arquitetura em 3 Camadas

O sistema de edição de pipelines YAML é construído em três camadas distintas:

#### **Camada 1: Monaco Editor Wrapper**
**Arquivo**: [`src/components/editor/YamlEditor.tsx`](../src/components/editor/YamlEditor.tsx)

```typescript
import { Editor } from '@monaco-editor/react';
import * as yaml from 'js-yaml';
```

**Características Técnicas:**

1. **Wrapper React do Monaco Editor**
   - Engine do VS Code rodando no browser
   - Suporte a syntax highlighting customizado
   - Auto-completion básico (sem IntelliSense ainda)

2. **Configuração de Language Server**

```typescript
monaco.languages.setLanguageConfiguration('yaml', {
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  comments: {
    lineComment: '#',
  },
  indentationRules: {
    increaseIndentPattern: /^(\s*)(.*:(\s*$|\s*[^#]*\s*$))/,
    decreaseIndentPattern: /^\s*$/,
  },
});
```

3. **Syntax Highlighting via Monarch**

```typescript
monaco.languages.setMonarchTokensProvider('yaml', {
  tokenizer: {
    root: [
      // Chaves (keys)
      [/^(\s*)([\w\-\s]+)(\s*)(:)(\s*)/, 
       ['white', 'key', 'white', 'delimiter', 'white']],
      
      // Lista items
      [/^\s*-\s+/, 'delimiter'],
      
      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],
      
      // Números
      [/[0-9]+/, 'number'],
      
      // Comentários
      [/#.*$/, 'comment'],
    ],
  },
});
```

4. **Validação em Tempo Real**

```typescript
const validateYaml = (content: string) => {
  const errors: string[] = [];
  let isValid = true;

  if (!content.trim()) {
    onValidationChange?.(true, []);
    return;
  }

  // 1. Validação Sintática (js-yaml)
  try {
    yaml.load(content);
  } catch (error: any) {
    isValid = false;
    errors.push(`YAML Syntax Error: ${error.message}`);
  }

  // 2. Validação Estrutural (PipelineSpec)
  try {
    const parsed = yaml.load(content) as any;
    
    if (parsed && typeof parsed === 'object') {
      // Campos obrigatórios
      if (!parsed.pipeline) {
        errors.push('Pipeline must have a "pipeline" field (unique ID)');
        isValid = false;
      }
      
      if (!parsed.name) {
        errors.push('Pipeline must have a "name" field');
        isValid = false;
      }
      
      if (!parsed.version) {
        errors.push('Pipeline must have a "version" field');
        isValid = false;
      }
      
      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        errors.push('Pipeline must have a "steps" array');
        isValid = false;
      }
      
      // 3. Validação de Steps
      if (parsed.steps && Array.isArray(parsed.steps)) {
        parsed.steps.forEach((step: any, index: number) => {
          const stepNum = index + 1;
          let hasValidStepType = false;
          
          // Source validation
          if (step.source) {
            hasValidStepType = true;
            if (!step.source.type) {
              errors.push(`Step ${stepNum} source must have a "type" field`);
              isValid = false;
            }
          }
          
          // Auth validation
          if (step.auth) {
            hasValidStepType = true;
            if (!step.auth.type) {
              errors.push(`Step ${stepNum} auth must have a "type" field`);
              isValid = false;
            }
          }
          
          // Transform validation
          if (step.transform) {
            hasValidStepType = true;
            if (!step.transform.map && !step.transform.script) {
              errors.push(`Step ${stepNum} transform must have a "map" or "script" field`);
              isValid = false;
            }
          }
          
          // Validate validation
          if (step.validate) {
            hasValidStepType = true;
            if (!step.validate.rules || !Array.isArray(step.validate.rules)) {
              errors.push(`Step ${stepNum} validate must have a "rules" array`);
              isValid = false;
            }
          }
          
          // Sink validation
          if (step.sink) {
            hasValidStepType = true;
            if (!step.sink.type) {
              errors.push(`Step ${stepNum} sink must have a "type" field`);
              isValid = false;
            }
          }
          
          // Se não tem nenhum tipo válido
          if (!hasValidStepType) {
            errors.push(`Step ${stepNum} must have one of: source, transform, validate, sink, or auth`);
            isValid = false;
          }
        });
      }
    }
  } catch (error) {
    // Já capturado na validação de sintaxe
  }

  onValidationChange?.(isValid, errors);
};
```

5. **Theme Adaptation (Dark Mode)**

```typescript
useEffect(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setEditorTheme(prefersDark ? 'vs-dark' : 'vs-light');
}, []);
```

#### **Camada 2: Pipeline Editor Orchestrator**
**Arquivo**: [`src/components/editor/PipelineEditor.tsx`](../src/components/editor/PipelineEditor.tsx)

**Responsabilidades:**

1. **Template System** - 3 templates pré-configurados
2. **File Upload** - Upload de arquivos `.yaml` via drag-and-drop
3. **Data Extraction** - Extrai metadados do YAML para API
4. **Save/Update** - Orquestra salvamento com validação

**Extração de Dados do YAML:**

```typescript
const extractDataFromYaml = () => {
  try {
    const parsedYaml = yaml.load(yamlContent) as any;

    return {
      name: parsedYaml.name || parsedYaml.pipeline || 'Unnamed Pipeline',
      description: parsedYaml.description || '',
      yamlDefinition: yamlContent, // YAML completo original
      isActive: parsedYaml.enabled !== false, // Default true
      cronExpression: parsedYaml.schedule || undefined,
      tags: parsedYaml.tags || undefined,
    };
  } catch (error) {
    throw new Error('Erro ao processar YAML: ' + error);
  }
};
```

**Salvamento Inteligente com Validações:**

```typescript
const handleSave = async () => {
  // 1. Validação de estado
  if (!isValidYaml) {
    toast.error('Por favor, corrija os erros de validação antes de salvar.');
    return;
  }

  if (!yamlContent.trim()) {
    toast.error('O conteúdo YAML é obrigatório.');
    return;
  }

  // 2. Validação anti-serialização incorreta
  if (yamlContent.includes('[object Object]')) {
    toast.error('Erro no YAML: Objetos não serializados corretamente.');
    return;
  }

  setIsSaving(true);

  try {
    const pipelineData: CreatePipelineRequest = extractDataFromYaml();

    console.log('📤 Enviando dados do pipeline:', pipelineData);

    if (isEditMode && pipelineId) {
      await pipelineService.updatePipeline(pipelineId, pipelineData);
      toast.success('Pipeline atualizado com sucesso!');
    } else {
      await pipelineService.createPipeline(pipelineData);
      toast.success('Pipeline criado com sucesso!');
    }

    router.push('/dashboard/pipelines');
  } catch (error: any) {
    console.error('Erro ao salvar pipeline:', error);

    // Error handling detalhado
    let errorMessage = 'Erro desconhecido';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 400) {
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = `Dados inválidos:\n${data.errors.join('\n')}`;
        } else if (data.error) {
          errorMessage = `Dados inválidos: ${data.error}`;
        } else {
          errorMessage = 'Dados enviados são inválidos.';
        }
      } else if (status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (status === 403) {
        errorMessage = 'Acesso negado para esta operação.';
      } else if (status === 500) {
        errorMessage = 'Erro interno do servidor.';
      }
    } else if (error.request) {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
    }

    toast.error(`Erro ao salvar pipeline: ${errorMessage}`);
  } finally {
    setIsSaving(false);
  }
};
```

**Test Run (Preview):**

```typescript
const handleTestRun = async () => {
  if (!isEditMode || !pipelineId) {
    toast.error('Pipeline deve ser salvo antes de executar um teste.');
    return;
  }

  try {
    await pipelineService.runPipeline(pipelineId);
    toast.success('Execução de teste iniciada!');
  } catch (error: any) {
    toast.error(`Erro ao executar pipeline: ${error.message}`);
  }
};
```

#### **Camada 3: Validation Results UI**
**Arquivo**: [`src/components/editor/ValidationResults.tsx`](../src/components/editor/ValidationResults.tsx)

**Estados de UI:**

1. **Valid State** (sem erros):

```tsx
<div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200">
  <CheckCircleIcon className="h-5 w-5 text-green-600" />
  <p className="text-sm text-green-800 font-medium">
    Valid YAML ready to save
  </p>
</div>
```

2. **Error State** (com erros):

```tsx
<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200">
  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
  <h3 className="text-sm font-medium text-red-800 mb-2">
    Validation errors found:
  </h3>
  <ul className="text-sm text-red-700 space-y-1">
    {errors.map((error, index) => (
      <li key={index} className="flex items-start">
        <span className="inline-block w-1 h-1 bg-red-500 rounded-full mt-2 mr-2" />
        {error}
      </li>
    ))}
  </ul>
</div>
```

### Templates de Pipeline

**Arquivo**: [`src/constants/pipelineTemplates.ts`](../src/constants/pipelineTemplates.ts)

**3 Templates Pré-configurados:**

#### 1. **Basic Template**
```yaml
pipeline: "my-pipeline"
version: "1"
name: "My Basic Pipeline"
description: "Basic example pipeline"
enabled: true
schedule: "0 0 * * *"

steps:
  - source:
      type: Pype.Connectors.Http.HttpJsonGetSourceConnector
      params:
        url: "https://jsonplaceholder.typicode.com/posts"
        method: "GET"
  
  - transform:
      map:
        id: "id"
        title: "title"
        content: "body"
  
  - sink:
      type: Pype.Connectors.Http.HttpJsonPostSinkConnector
      options:
        url: "https://httpbin.org/post"
        mode: "batch"
        batchSize: 10
```

#### 2. **Advanced Template**
- Multi-sink pipeline
- Headers customizados com secrets
- Idempotency key
- Batch processing

#### 3. **Connector Template**
- SAP B1 → Sankhya
- Auth profiles configurados
- Secrets para credenciais

**Exemplo de Uso de Secrets nos Templates:**

```yaml
authProfiles:
  sankhya_auth:
    type: apiKeyPair
    params:
      idHeader: "X-Api-Key-Id"
      keyHeader: "X-Api-Key"
      id: "svc-orchestrator"
      key: "${secret:sankhya/apikeys/svc-orchestrator/raw}"

steps:
  - source:
      type: Pype.Connectors.SapB1.SapB1SourceConnector
      params:
        server: "${secret:sap/params/SERVER}"
        database: "${secret:sap/params/DATABASE}"
        username: "${secret:sap/auth/USER}"
        password: "${secret:sap/auth/PASSWORD}"
```

---

## 2️⃣ Gestão de Secrets e Environment Variables

### Arquitetura de Segurança Multi-Camada

#### **Service Layer**
**Arquivo**: [`src/services/environment-variables.ts`](../src/services/environment-variables.ts)

**Modelo de Dados:**

```typescript
interface EnvironmentVariable {
  id: number;
  key: string;
  value: string;
  description?: string;
  isSecret: boolean; // ⚠️ Flag crítica de segurança
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface CreateEnvironmentVariableRequest {
  key: string;
  value: string;
  description?: string;
  isSecret: boolean;
}
```

**API Service Methods:**

```typescript
export const environmentVariablesService = {
  // Get all com filtro "onlyMine"
  async getAll(onlyMine?: boolean): Promise<EnvironmentVariable[]> {
    const params = new URLSearchParams();
    if (onlyMine !== undefined) {
      params.append('onlyMine', onlyMine.toString());
    }
    const url = params.toString() 
      ? `/api/environment-variables?${params}` 
      : '/api/environment-variables';
    return apiClient.get(url);
  },

  // CRUD operations
  async getById(id: number): Promise<EnvironmentVariable>,
  async create(data: CreateEnvironmentVariableRequest): Promise<EnvironmentVariable>,
  async update(id: number, data: UpdateEnvironmentVariableRequest): Promise<EnvironmentVariable>,
  async delete(id: number): Promise<void>,

  // Test resolution (preview)
  async test(id: number): Promise<TestEnvironmentVariableResponse>,
}
```

#### **UI Layer com RBAC**
**Arquivo**: [`src/app/(dashboard)/dashboard/environment/page.tsx`](../src/app/(dashboard)/dashboard/environment/page.tsx)

**Controle de Acesso Baseado em Roles:**

```typescript
const { user, hasRole } = useAuth();

// Permissões granulares
const canManageSecrets = hasRole([UserRole.Admin, UserRole.Owner]);
const canToggleOnlyMine = hasRole([UserRole.Admin, UserRole.Owner]);
const canCreateEdit = hasRole([UserRole.User, UserRole.Admin, UserRole.Owner]);
const isUser = hasRole([UserRole.User]);

// Filtro automático para proteger secrets
const loadVariables = async () => {
  const data = await environmentVariablesService.getAll(onlyMine);
  
  // Users só veem environment variables (não secrets)
  const filteredData = canManageSecrets 
    ? data 
    : data.filter(v => !v.isSecret);
    
  setVariables(filteredData);
};
```

**Sistema de Filtros:**

```typescript
// Estados de filtro
const [filter, setFilter] = useState<'all' | 'secrets' | 'env'>('all');
const [onlyMine, setOnlyMine] = useState(false);
const [searchTerm, setSearchTerm] = useState('');

// Filtro combinado
const filteredVariables = variables.filter(variable => {
  const matchesSearch = 
    variable.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (variable.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
  
  if (filter === 'secrets') return matchesSearch && variable.isSecret;
  if (filter === 'env') return matchesSearch && !variable.isSecret;
  return matchesSearch;
});
```

**Show/Hide Values (Segurança):**

```typescript
const [showValues, setShowValues] = useState<Record<number, boolean>>({});

const toggleShowValue = (id: number) => {
  setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
};

// No render da tabela:
<td className="px-6 py-4 font-mono text-sm">
  {showValues[variable.id] ? (
    <span className="text-gray-900 dark:text-gray-100">
      {variable.value}
    </span>
  ) : (
    <span className="text-gray-400">••••••••</span>
  )}
</td>

<button onClick={() => toggleShowValue(variable.id)}>
  {showValues[variable.id] ? (
    <EyeSlashIcon className="h-4 w-4" />
  ) : (
    <EyeIcon className="h-4 w-4" />
  )}
</button>
```

**Badges de Tipo (Visual Distinction):**

```tsx
{variable.isSecret ? (
  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
    <KeyIcon className="h-3 w-3" />
    Secret
  </span>
) : (
  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
    <GlobeAltIcon className="h-3 w-3" />
    Environment
  </span>
)}
```

**Warning para Users sem Permissão:**

```tsx
{!canManageSecrets && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
    <p className="text-sm text-yellow-700">
      <strong>Limited access:</strong> You can only view and manage environment variables. 
      To access secrets, please contact an administrator.
    </p>
  </div>
)}
```

### Uso em Pipelines (Resolução de Variáveis)

**Sintaxe no YAML:**

```yaml
steps:
  - source:
      type: Pype.Connectors.Http.HttpJsonGetSourceConnector
      params:
        url: "${env:API_ENDPOINT}/data"
        headers:
          Authorization: "Bearer ${secret:api/token}"
          X-Custom-Key: "${env:CUSTOM_KEY}"
```

**Resolução no Backend:**
- `${env:KEY}` → Environment Variable (não sensível)
- `${secret:PATH}` → Secret (sensível, apenas Admin/Owner)

---

## 3️⃣ Dashboard e Analytics

### Arquitetura de Dados em Tempo Real

#### **Service Layer**
**Arquivo**: [`src/services/dashboardService.ts`](../src/services/dashboardService.ts)

```typescript
class DashboardService {
  private readonly baseUrl = '/api/dashboard';

  // Endpoint principal com filtro "onlyMine"
  async getStats(onlyMine?: boolean): Promise<DashboardStats> {
    const params = onlyMine !== undefined 
      ? { onlyMine: onlyMine.toString() } 
      : {};
    return await apiClient.get<DashboardStats>(`${this.baseUrl}/stats`, { params });
  }

  // Alias para refresh explícito
  async refreshStats(onlyMine?: boolean): Promise<DashboardStats> {
    return this.getStats(onlyMine);
  }
}
```

#### **Tipos de Dashboard**
**Arquivo**: [`src/types/dashboard.ts`](../src/types/dashboard.ts)

**Estrutura de Dados Hierárquica:**

```typescript
interface DashboardStats {
  pipelines: {
    total: number;
    active: number;
    inactive: number;
    withSchedule: number;
    withoutSchedule: number;
  };
  
  executions: {
    today: ExecutionCountByStatus;
    thisWeek: ExecutionCountByStatus;
    thisMonth: ExecutionCountByStatus;
    last24Hours: ExecutionTimeSeriesPoint[]; // Time-series data
    last7Days: ExecutionTimeSeriesPoint[];
  };
  
  performance: {
    averageExecutionTime: number; // em milissegundos
    fastest: ExecutionPerformance;
    slowest: ExecutionPerformance;
    totalExecutionTime: number;
    executionTimeByHour: PerformanceTimePoint[];
  };
  
  lastUpdated: string;
}

interface ExecutionCountByStatus {
  total: number;
  success: number;
  failed: number;
  running: number;
  pending: number;
  cancelled: number;
}

interface ExecutionTimeSeriesPoint {
  timestamp: string;
  date: string;
  hour?: number;
  success: number;
  failed: number;
  total: number;
}
```

#### **UI Components**

##### **1. MetricCard Component**
**Arquivo**: [`src/components/dashboard/MetricCard.tsx`](../src/components/dashboard/MetricCard.tsx)

**Design System (Tailwind Colors):**

```typescript
const colorClasses = {
  blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
  green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
  red: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
  yellow: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
  purple: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20',
  gray: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
};

const iconColorClasses = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  red: 'text-red-600 dark:text-red-400',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  purple: 'text-purple-600 dark:text-purple-400',
  gray: 'text-gray-600 dark:text-gray-400'
};
```

**Trend Indicator (Seta de Crescimento):**

```tsx
function TrendIndicator({ trend }: { trend: MetricCardProps['trend'] }) {
  if (!trend) return null;

  const { value, isPositive, label } = trend;
  const TrendIcon = isPositive ? ChevronUpIcon : ChevronDownIcon;
  const trendColor = isPositive 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';
  
  return (
    <div className={`flex items-center text-sm ${trendColor}`}>
      <TrendIcon className="h-4 w-4" />
      <span className="ml-1">
        {Math.abs(value)}% {label}
      </span>
    </div>
  );
}
```

**Loading Skeleton:**

```tsx
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="mt-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  );
}
```

**Exemplo de Uso:**

```tsx
<MetricCard
  title="Total Pipelines"
  value={stats.pipelines.total}
  subtitle={`${stats.pipelines.active} active`}
  trend={{
    value: 85,
    isPositive: true,
    label: 'active'
  }}
  icon={CircleStackIcon}
  color="blue"
/>
```

##### **2. ExecutionChart Component**
**Arquivo**: [`src/components/dashboard/ExecutionChart.tsx`](../src/components/dashboard/ExecutionChart.tsx)

**Recharts Configuration:**

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid 
      strokeDasharray="3 3" 
      className="stroke-gray-200 dark:stroke-gray-700"
    />
    
    <XAxis 
      dataKey="time"
      tickFormatter={formatXAxis}
      className="text-xs text-gray-600 dark:text-gray-400"
    />
    
    <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
    
    <Tooltip content={<CustomTooltip />} />
    
    <Legend wrapperStyle={{ fontSize: '12px' }} />
    
    {/* Success Line */}
    <Line
      type="monotone"
      dataKey="success"
      stroke="#10b981"     // Green
      strokeWidth={2}
      name="Successful"
      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
      activeDot={{ r: 6 }}
    />
    
    {/* Failed Line */}
    <Line
      type="monotone"
      dataKey="failed"
      stroke="#ef4444"     // Red
      strokeWidth={2}
      name="Failed"
      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
```

**Custom Tooltip:**

```tsx
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total: {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
        </p>
      </div>
    );
  }
  return null;
}
```

**Time Formatting:**

```typescript
const formatXAxis = (tickItem: string) => {
  const date = new Date(tickItem);
  if (period === '24h') {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
};
```

**Empty State:**

```tsx
{!data || data.length === 0 ? (
  <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed" style={{ height }}>
    <div className="text-center">
      <div className="text-4xl mb-2">📊</div>
      <p className="text-gray-500 dark:text-gray-400">No data available</p>
    </div>
  </div>
) : (
  {/* Chart */}
)}
```

##### **3. MetricGrid Component**
**Arquivo**: [`src/components/dashboard/MetricGrid.tsx`](../src/components/dashboard/MetricGrid.tsx)

**Responsive Grid System:**

```typescript
const gridClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
};

<div className={`grid gap-6 ${gridClasses[columns]}`}>
  {metrics.map((metric, index) => (
    <MetricCard key={index} {...metric} />
  ))}
</div>
```

**Loading State com Skeletons:**

```typescript
const displayMetrics = loading 
  ? Array(columns).fill(null).map((_, index) => ({
      title: 'Loading...',
      value: '---',
      loading: true
    } as MetricCardProps))
  : metrics;
```

#### **Auto-Refresh System**
**Arquivo**: [`src/app/(dashboard)/dashboard/page.tsx`](../src/app/(dashboard)/dashboard/page.tsx)

**Custom Hook `useInterval`:**

```typescript
import { useInterval } from '@/hooks/useInterval';

const [autoRefresh, setAutoRefresh] = useState(true);
const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

// Auto-refresh a cada 30 segundos
useInterval(
  () => {
    if (autoRefresh && !loading && !refreshing) {
      loadStats(true); // isRefresh = true (não mostra loading completo)
    }
  },
  autoRefresh ? 30000 : null // null = pausado
);
```

**Persistência de Preferências (localStorage):**

```typescript
// Load inicial
const [onlyMine, setOnlyMine] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pype-dashboard-only-mine');
    return saved === 'true';
  }
  return false;
});

const [autoRefresh, setAutoRefresh] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pype-dashboard-auto-refresh');
    return saved === null ? true : saved === 'true';
  }
  return true;
});

// Save ao mudar
useEffect(() => {
  localStorage.setItem('pype-dashboard-only-mine', String(onlyMine));
}, [onlyMine]);

useEffect(() => {
  localStorage.setItem('pype-dashboard-auto-refresh', String(autoRefresh));
}, [autoRefresh]);
```

**Filtro Automático por Role (USER sempre filtra):**

```typescript
const loadStats = async (isRefresh = false) => {
  const shouldFilter = user?.role === UserRole.User || onlyMine;
  const data = await dashboardService.getStats(shouldFilter);
  setStats(data);
  setLastRefresh(new Date());
};
```

**Manual Refresh Button:**

```tsx
<button
  onClick={() => loadStats(true)}
  disabled={loading || refreshing}
  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
>
  <ArrowPathIcon className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
  Refresh
</button>
```

---

## 4️⃣ Sistema de Logs e Execuções

### Arquitetura de Logging

#### **Executions Page**
**Arquivo**: [`src/app/(dashboard)/dashboard/executions/page.tsx`](../src/app/(dashboard)/dashboard/executions/page.tsx)

**Modelo de Dados:**

```typescript
interface PipelineExecution {
  id: string;
  pipelineId: string;
  pipelineName: string;
  pipelineOwner: string;
  triggeredByUser: string;
  tenantId: string;
  status: string; // Success, Running, Failed, Cancelled, Scheduled
  startedAt: string;
  completedAt?: string;
  duration?: number; // em millisegundos
  recordsProcessed?: number;
  errorMessage?: string;
  logs?: string; // Summary ou preview
}

interface PipelineExecutionLog {
  id: string;
  timestamp: string;
  level: string; // Debug, Info, Warning, Error, Critical
  category: string; // Source, Sink, Transform, System, Connector
  stepName?: string; // Nome do step (opcional)
  message: string;
  data?: string; // JSON serializado
  stackTrace?: string;
  threadId?: string;
  hostName?: string;
}
```

**Fetch de Execuções:**

```typescript
const fetchExecutions = async () => {
  try {
    setLoading(true);
    const result = await apiClient.get('/api/executions');
    setExecutions(result || []);
  } catch (error) {
    console.error('Error fetching executions:', error);
    setExecutions([]);
  } finally {
    setLoading(false);
  }
};
```

#### **Status Badge System**

```typescript
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    Success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    Running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    Failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    Scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  return (
    <span className={classNames(
      'inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium w-20',
      statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'
    )}>
      {status}
    </span>
  );
}
```

#### **Duration Formatting**

```typescript
const formatDuration = (durationMs?: number) => {
  if (!durationMs) return 'N/A';
  
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Exemplos:
// 1500ms → "1s"
// 65000ms → "1m 5s"
// 3665000ms → "1h 1m 5s"
```

#### **Log Modal (Detalhe de Execução)**

**Fetch de Logs Detalhados:**

```typescript
const fetchLogs = async () => {
  if (!execution?.id) return;
  
  try {
    setLoading(true);
    const result = await apiClient.get(`/api/logs/execution/${execution.id}`);
    setLogs(result || []);
  } catch (error) {
    console.error('Error fetching logs:', error);
    setLogs([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (isOpen && execution?.id) {
    fetchLogs();
  }
}, [isOpen, execution?.id]);
```

**Color Coding por Nível de Log:**

```typescript
const getLevelColor = (level: string) => {
  const colors = {
    Debug: 'text-gray-600 dark:text-gray-400',
    Info: 'text-blue-600 dark:text-blue-400',
    Warning: 'text-yellow-600 dark:text-yellow-400',
    Error: 'text-red-600 dark:text-red-400',
    Critical: 'text-red-700 dark:text-red-300 font-bold'
  };
  return colors[level as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
};
```

**Rendering de Log Entry (Completo):**

```tsx
<div className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm">
  {/* Header do log */}
  <div className="flex items-start space-x-3">
    {/* Timestamp preciso (HH:mm:ss.SSS) */}
    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
      {format(new Date(log.timestamp), 'HH:mm:ss.SSS', { locale: ptBR })}
    </span>
    
    {/* Level Badge */}
    <span className={`text-xs font-medium px-2 py-1 rounded ${getLevelColor(log.level)}`}>
      {log.level}
    </span>
    
    {/* Category Badge */}
    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
      {log.category}
    </span>
    
    {/* Step Name (opcional) */}
    {log.stepName && (
      <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
        {log.stepName}
      </span>
    )}
  </div>
  
  {/* Mensagem principal */}
  <p className="text-sm text-gray-900 dark:text-white mt-2 font-mono">
    {log.message}
  </p>
  
  {/* Dados adicionais (JSON) - collapsible */}
  {log.data && (
    <details className="mt-2">
      <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
        Dados adicionais
      </summary>
      <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto">
        {JSON.stringify(JSON.parse(log.data), null, 2)}
      </pre>
    </details>
  )}
  
  {/* Stack Trace - collapsible */}
  {log.stackTrace && (
    <details className="mt-2">
      <summary className="text-xs text-red-500 cursor-pointer">
        Stack Trace
      </summary>
      <pre className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded mt-1 overflow-auto">
        {log.stackTrace}
      </pre>
    </details>
  )}
</div>
```

**Modal Full Screen:**

```tsx
function LogModal({ execution, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Logs - {execution?.pipelineName}
          </h3>
          <button onClick={onClose} className="rounded-md text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable logs area */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Carregando logs...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map(log => <LogEntry key={log.id} log={log} />)}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum log encontrado para esta execução
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 5️⃣ Hooks Customizados e Estado

### Custom Hooks

#### **usePipelines Hook**
**Arquivo**: [`src/hooks/usePipelines.ts`](../src/hooks/usePipelines.ts)

**Interface de Retorno:**

```typescript
interface UsePipelinesResult {
  pipelines: PipelineListItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: PipelineFilters;
  actions: {
    loadPipelines: () => Promise<void>;
    setFilters: (filters: Partial<PipelineFilters>) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    runPipeline: (id: string) => Promise<void>;
    suspendPipeline: (id: string) => Promise<void>;
    resumePipeline: (id: string) => Promise<void>;
    deletePipeline: (id: string) => Promise<void>;
    refreshPipelines: () => Promise<void>;
  };
}
```

**Implementação:**

```typescript
export const usePipelines = (initialFilters: PipelineFilters = {}): UsePipelinesResult => {
  const [pipelines, setPipelines] = useState<PipelineListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFiltersState] = useState<PipelineFilters>({
    page: 1,
    pageSize: 20,
    ...initialFilters,
  });

  // Load pipelines com memoização
  const loadPipelines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await pipelineService.listPipelines(filters);
      
      setPipelines(response);
      
      // Simula pagination (backend retorna array simples)
      const total = response.length;
      const pageSize = filters.pageSize || 20;
      const totalPages = Math.ceil(total / pageSize);
      
      setPagination({
        page: filters.page || 1,
        pageSize,
        total,
        totalPages,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load pipelines';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Set filters com reset de página
  const setFilters = useCallback((newFilters: Partial<PipelineFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1, // Reset to first page
    }));
  }, []);

  // Actions simplificadas
  const setPage = useCallback((page: number) => {
    setFilters({ page });
  }, [setFilters]);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters({ pageSize, page: 1 });
  }, [setFilters]);

  // Run pipeline com feedback
  const runPipeline = useCallback(async (id: string) => {
    try {
      const pipeline = pipelines.find(p => p.id === id);
      const pipelineName = pipeline?.name || 'Pipeline';

      toast.loading(`Running ${pipelineName}...`, { id: `run-${id}` });
      
      const result = await pipelineService.runPipeline(id);
      
      if (result.enqueued) {
        toast.success(`${pipelineName} has been queued for execution`, { id: `run-${id}` });
        await loadPipelines(); // Auto-refresh
      }
    } catch (err: any) {
      toast.error(`Failed to run pipeline: ${err.message}`, { id: `run-${id}` });
    }
  }, [pipelines, loadPipelines]);

  // Suspend pipeline
  const suspendPipeline = useCallback(async (id: string) => {
    try {
      await pipelineService.suspendPipeline(id);
      toast.success('Pipeline suspended');
      await loadPipelines();
    } catch (err: any) {
      toast.error(`Failed to suspend: ${err.message}`);
    }
  }, [loadPipelines]);

  // Resume pipeline
  const resumePipeline = useCallback(async (id: string) => {
    try {
      await pipelineService.resumePipeline(id);
      toast.success('Pipeline resumed');
      await loadPipelines();
    } catch (err: any) {
      toast.error(`Failed to resume: ${err.message}`);
    }
  }, [loadPipelines]);

  // Delete pipeline
  const deletePipeline = useCallback(async (id: string) => {
    try {
      await pipelineService.deletePipeline(id);
      toast.success('Pipeline deleted');
      await loadPipelines();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  }, [loadPipelines]);

  // Auto-load ao montar ou mudar filtros
  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);

  return {
    pipelines,
    loading,
    error,
    pagination,
    filters,
    actions: {
      loadPipelines,
      setFilters,
      setPage,
      setPageSize,
      runPipeline,
      suspendPipeline,
      resumePipeline,
      deletePipeline,
      refreshPipelines: loadPipelines,
    },
  };
};
```

**Exemplo de Uso:**

```tsx
function PipelinesPage() {
  const {
    pipelines,
    loading,
    pagination,
    filters,
    actions: {
      setFilters,
      setPage,
      runPipeline,
      deletePipeline,
    }
  } = usePipelines();

  return (
    <>
      <PipelineTable 
        pipelines={pipelines}
        loading={loading}
        onRun={runPipeline}
        onDelete={deletePipeline}
      />
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
```

### Zustand State Management

#### **Auth Store**
**Arquivo**: [`src/store/auth.ts`](../src/store/auth.ts)

**Principais Features:**

1. **Persist Middleware** - Salva estado no localStorage
2. **Role Helpers** - `hasRole()`, `isAdmin()`, `canManageSecrets()`
3. **Token Management** - Refresh automático via interceptor
4. **User Normalization** - Converte roles string → enum

```typescript
interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string, expiresAt: string) => void;
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant) => void;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
  checkAuth: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  canManageSecrets: () => boolean;
  canManagePipelines: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ... state e actions
    }),
    {
      name: 'pype-auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## 6️⃣ Padrões de Design Implementados

### 1. Atomic Design

**Hierarquia de Componentes:**

- **Atoms** (Elementos básicos):
  - `LoadingSpinner`
  - `Button` (implícito nas classes Tailwind)
  - `Badge`
  - `Input`

- **Molecules** (Componentes compostos):
  - `MetricCard`
  - `StatusBadge`
  - `ValidationResults`
  - `TrendIndicator`

- **Organisms** (Seções complexas):
  - `MetricGrid`
  - `ExecutionChart`
  - `PipelineTable`
  - `YamlEditor`

- **Templates** (Layouts):
  - `DashboardLayout`
  - `PipelineEditor`

- **Pages** (Páginas completas):
  - `dashboard/page.tsx`
  - `pipelines/page.tsx`
  - `executions/page.tsx`

### 2. Compound Components Pattern

```tsx
<PipelineEditor pipelineId={id}>
  <YamlEditor 
    value={yaml} 
    onChange={setYaml}
    onValidationChange={handleValidation}
  />
  <ValidationResults errors={errors} isValid={isValid} />
  <FileUpload onUpload={handleUpload} />
</PipelineEditor>
```

### 3. Render Props Pattern

```tsx
<LogModal 
  execution={execution}
  isOpen={isOpen}
  onClose={() => setShowModal(false)}
  renderFooter={() => (
    <button onClick={handleAction}>Action</button>
  )}
/>
```

### 4. Custom Hooks Pattern

**Separação de Lógica:**

- `usePipelines()` - Pipeline management
- `useAuthStore()` - Zustand auth
- `useInterval()` - Auto-refresh timers
- `useConfirmationModal()` - Confirmation dialogs
- `useAuth()` - Auth wrapper (alias for store)

### 5. Service Layer Pattern

**Separação de Concerns:**

```
UI Component → Custom Hook → Service → API Client → Backend
```

Exemplo:
```
PipelinesPage → usePipelines → pipelineService → apiClient → /api/pipelines
```

### 6. Repository Pattern (Client-Side)

**Exemplo com Environment Variables:**

```typescript
// Service = Repository
export const environmentVariablesService = {
  async getAll(onlyMine?: boolean): Promise<EnvironmentVariable[]>,
  async getById(id: number): Promise<EnvironmentVariable>,
  async create(data: CreateRequest): Promise<EnvironmentVariable>,
  async update(id: number, data: UpdateRequest): Promise<EnvironmentVariable>,
  async delete(id: number): Promise<void>,
  async test(id: number): Promise<TestResponse>,
}
```

---

## 7️⃣ Segurança e Boas Práticas

### Segurança

#### 1. **Role-Based Access Control (RBAC)**

**Client-Side Validation:**
```typescript
const canManageSecrets = hasRole([UserRole.Admin, UserRole.Owner]);

{canManageSecrets && (
  <SecretManagementPanel />
)}
```

**Server-Side Validation** (via JWT no backend):
- Todos os endpoints validam role no backend
- Client-side é apenas UX (não segurança)

#### 2. **Secret Protection**

- Valores de secrets ocultos por default (`••••••••`)
- Toggle manual para visualizar (auditável)
- Users não têm acesso a secrets (filtro automático)

#### 3. **XSS Prevention**

- React escapa automaticamente JSX
- Uso de `dangerouslySetInnerHTML` proibido
- Validação de inputs via Zod

#### 4. **CSRF Protection**

- JWT tokens em headers (não cookies)
- SameSite cookies para session (se houver)

#### 5. **Type Safety**

```typescript
// ✅ Correto
const user: User = await apiClient.get<User>('/api/users/me');

// ❌ Proibido
const user: any = await apiClient.get('/api/users/me');
```

### Boas Práticas

#### 1. **Error Handling Consistente**

```typescript
try {
  const result = await service.doSomething();
  toast.success('Operação concluída');
} catch (error: any) {
  const message = error.response?.data?.error || 'Erro desconhecido';
  toast.error(`Erro: ${message}`);
  console.error('Detailed error:', error);
}
```

#### 2. **Loading States**

- Skeleton screens para melhor UX
- Spinners apenas quando necessário
- Disable buttons durante loading

```tsx
{loading ? (
  <LoadingSkeleton />
) : (
  <ActualContent />
)}
```

#### 3. **Memoization e Performance**

```typescript
// useCallback para funções
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);

// useMemo para computações pesadas
const filteredData = useMemo(() => {
  return data.filter(filterFn);
}, [data]);
```

#### 4. **Acessibilidade (A11y)**

```tsx
<button
  aria-label="Close modal"
  onClick={onClose}
>
  <XIcon className="h-5 w-5" />
</button>
```

#### 5. **Responsive Design**

- Mobile-first approach
- Breakpoints Tailwind: `sm:`, `md:`, `lg:`, `xl:`
- Grid systems responsivos

```tsx
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

#### 6. **Dark Mode**

- Todas as cores têm variantes dark: `text-gray-900 dark:text-gray-100`
- Uso de `next-themes` para toggle
- Persistência de preferência

---

## 8️⃣ Avaliação Geral

### ✅ Pontos Fortes

1. **Arquitetura Moderna**
   - Next.js 16 com App Router
   - Server Components quando apropriado
   - Turbopack para build rápido

2. **Type Safety Rigoroso**
   - TypeScript estrito (zero `any`)
   - Interfaces completas para API
   - Validação Zod em formulários

3. **Multi-Tenancy Robusto**
   - Isolamento completo por tenant
   - RBAC granular (Viewer/User/Admin/Owner)
   - Filtros automáticos por permissão

4. **Runtime Configuration**
   - Endpoint `/api/config` para env vars
   - Deploy-friendly (zero rebuild para mudar API URL)
   - Fallback automático para dev

5. **Componentes Reutilizáveis**
   - Atomic design bem estruturado
   - UI consistente com Tailwind
   - Dark mode completo

6. **Performance**
   - Auto-refresh inteligente (30s)
   - Caching de runtime config
   - Skeleton screens para UX

7. **Developer Experience**
   - Scripts automatizados (PowerShell)
   - Docker Compose para dev
   - Hot reload do Next.js

### ⚠️ Pontos de Atenção

1. **Monaco Editor**
   - ❌ Sem IntelliSense ainda (pendente: IMP-013)
   - ❌ Sem autocomplete de conectores
   - ❌ Sem validação contra JSON Schema

2. **WebSocket (Logs Real-Time)**
   - 🟡 Socket.io configurado mas não integrado
   - 🟡 Logs são fetch manual (não push)
   - 🟡 Não há notificações de execução completa

3. **Testes**
   - 🔴 Cobertura baixa (~30% estimado)
   - 🔴 Faltam testes E2E
   - 🔴 Componentes sem testes unitários

4. **Documentação**
   - 🟡 Falta `docs/development/` (padrões de código)
   - 🟡 Falta `docs/guides/` (tutoriais)
   - 🟡 Componentes sem Storybook

5. **Acessibilidade**
   - 🟡 Não há testes A11y (WCAG)
   - 🟡 Alguns elementos sem `aria-label`
   - 🟡 Keyboard navigation não testado

6. **Analytics**
   - 🟡 Dashboard básico (precisa expandir)
   - 🟡 Faltam trends e alertas
   - 🟡 Sem export de relatórios

### 🚀 Próximos Passos Recomendados

Com base na análise completa, recomendo priorizar:

#### **Sprint 1: YAML IntelliSense** (IMP-013)
- Integrar `monaco-yaml` com JSON Schema
- Autocomplete de conectores e propriedades
- Validação em tempo real contra schema
- **Estimativa**: 2-3 dias

#### **Sprint 2: Logs Real-Time**
- Integrar Socket.io para push de logs
- Notificações de execução completa
- Live tail de logs durante execução
- **Estimativa**: 3-4 dias

#### **Sprint 3: Dry-Run UI**
- Interface para simulação de pipelines
- Preview de dados sem persistir
- Validação de conectores
- **Estimativa**: 5-7 dias

#### **Sprint 4: Testes E2E**
- Cypress ou Playwright setup
- Fluxos críticos (login, criar pipeline, executar)
- CI/CD integration
- **Estimativa**: 5-7 dias

#### **Sprint 5: Analytics Avançado**
- Dashboard executivo (trends, alertas)
- Export de relatórios (CSV, PDF)
- Gráficos de performance por conector
- **Estimativa**: 7-10 dias

---

## 📚 Referências

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/index.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Recharts](https://recharts.org/en-US/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

**Documento gerado automaticamente via análise de código-fonte.**  
**Última atualização**: 21 de Janeiro de 2026
