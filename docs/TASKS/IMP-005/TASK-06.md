# TASK-06: Testes Automatizados

**Prioridade**: MÉDIA  
**Estimativa**: 4-5 horas  
**Status**: 🔴 Pendente  
**Dependências**: 
- [TASK-01](./TASK-01.md) (DryRunButton)
- [TASK-02](./TASK-02.md) (useDryRun)
- [TASK-03](./TASK-03.md) (DryRunResultModal)
- [TASK-04](./TASK-04.md) (DryRunProgress)
- [TASK-05](./TASK-05.md) (Integração)

---

## 📋 Objetivo

Criar cobertura de testes automatizados completa para garantir que a funcionalidade de dry-run funcione corretamente e prevenir regressões futuras.

---

## 🎯 Critérios de Aceitação

- [ ] Cobertura mínima de 80% para componentes críticos
- [ ] Testes unitários para hook `useDryRun`
- [ ] Testes de componentes para `DryRunButton`, `DryRunProgress`, `DryRunResultModal`
- [ ] Testes de integração para fluxo completo
- [ ] Mocks de API configurados corretamente
- [ ] Testes passam em CI/CD
- [ ] Documentação de casos de teste

---

## 📁 Arquivos a Criar

### 1. Criar: `src/__tests__/hooks/useDryRun.test.ts`

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useDryRun } from '@/hooks/useDryRun'
import { apiClient } from '@/lib/api-client'

// Mock do apiClient
jest.mock('@/lib/api-client')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('useDryRun', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  describe('startDryRun', () => {
    it('should start dry-run and return dryRunId', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { dryRunId: 'test-dry-run-123' }
      })
      
      const { result } = renderHook(() => useDryRun())
      
      await act(async () => {
        await result.current.startDryRun('pipeline-id-456', 10)
      })
      
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/pipelines/crud/pipeline-id-456/dry-run?sampleSize=10'
      )
      expect(result.current.isPolling).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
    
    it('should set error if startDryRun fails', async () => {
      mockApiClient.post.mockRejectedValue({
        response: { data: { error: 'Pipeline not found' } }
      })
      
      const { result } = renderHook(() => useDryRun())
      
      await act(async () => {
        await result.current.startDryRun('invalid-id', 10)
      })
      
      expect(result.current.error).toBe('Pipeline not found')
      expect(result.current.isPolling).toBe(false)
    })
  })
  
  describe('polling', () => {
    it('should poll until status is completed', async () => {
      // Mock POST para iniciar dry-run
      mockApiClient.post.mockResolvedValue({
        data: { dryRunId: 'test-123' }
      })
      
      // Mock GET para polling
      mockApiClient.get
        .mockResolvedValueOnce({ 
          data: { id: 'test-123', status: 'pending' } 
        })
        .mockResolvedValueOnce({ 
          data: { id: 'test-123', status: 'running' } 
        })
        .mockResolvedValueOnce({ 
          data: { 
            id: 'test-123', 
            status: 'completed',
            result: {
              success: true,
              steps: [],
              totalSampleMessages: 10
            }
          } 
        })
      
      const { result } = renderHook(() => useDryRun())
      
      // Iniciar dry-run
      await act(async () => {
        await result.current.startDryRun('pipeline-id', 10)
      })
      
      expect(result.current.isPolling).toBe(true)
      
      // Simular 3 polls (2s cada)
      await act(async () => {
        jest.advanceTimersByTime(2000) // Poll 1: pending
        await Promise.resolve()
      })
      
      await act(async () => {
        jest.advanceTimersByTime(2000) // Poll 2: running
        await Promise.resolve()
      })
      
      await act(async () => {
        jest.advanceTimersByTime(2000) // Poll 3: completed
        await Promise.resolve()
      })
      
      await waitFor(() => {
        expect(result.current.isPolling).toBe(false)
        expect(result.current.result).toBeTruthy()
        expect(result.current.result?.success).toBe(true)
      })
      
      expect(mockApiClient.get).toHaveBeenCalledTimes(3)
    })
    
    it('should timeout after 5 minutes', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { dryRunId: 'test-timeout' }
      })
      
      // Mock GET que sempre retorna 'running'
      mockApiClient.get.mockResolvedValue({
        data: { id: 'test-timeout', status: 'running' }
      })
      
      const { result } = renderHook(() => useDryRun())
      
      await act(async () => {
        await result.current.startDryRun('pipeline-id', 10)
      })
      
      // Avançar 5 minutos
      await act(async () => {
        jest.advanceTimersByTime(5 * 60 * 1000 + 1000)
        await Promise.resolve()
      })
      
      await waitFor(() => {
        expect(result.current.isPolling).toBe(false)
        expect(result.current.error).toBe('Dry-run timeout after 5 minutes')
      })
    })
  })
  
  describe('cancelPolling', () => {
    it('should stop polling when called', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { dryRunId: 'test-cancel' }
      })
      
      mockApiClient.get.mockResolvedValue({
        data: { id: 'test-cancel', status: 'running' }
      })
      
      const { result } = renderHook(() => useDryRun())
      
      await act(async () => {
        await result.current.startDryRun('pipeline-id', 10)
      })
      
      expect(result.current.isPolling).toBe(true)
      
      // Cancelar polling
      act(() => {
        result.current.cancelPolling()
      })
      
      expect(result.current.isPolling).toBe(false)
    })
  })
  
  describe('resetState', () => {
    it('should reset all state to initial values', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { dryRunId: 'test-reset' }
      })
      
      const { result } = renderHook(() => useDryRun())
      
      await act(async () => {
        await result.current.startDryRun('pipeline-id', 10)
      })
      
      // Resetar estado
      act(() => {
        result.current.resetState()
      })
      
      expect(result.current.result).toBeNull()
      expect(result.current.status).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.isPolling).toBe(false)
    })
  })
})
```

---

### 2. Criar: `src/__tests__/components/DryRunButton.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DryRunButton } from '@/components/pipelines/DryRunButton'
import { useDryRun } from '@/hooks/useDryRun'

jest.mock('@/hooks/useDryRun')

const mockUseDryRun = useDryRun as jest.MockedFunction<typeof useDryRun>

describe('DryRunButton', () => {
  const mockStartDryRun = jest.fn()
  
  beforeEach(() => {
    mockUseDryRun.mockReturnValue({
      startDryRun: mockStartDryRun,
      result: null,
      status: null,
      isLoading: false,
      isPolling: false,
      error: null,
      cancelPolling: jest.fn(),
      resetState: jest.fn()
    })
  })
  
  it('should render button with correct text', () => {
    render(
      <DryRunButton 
        pipelineId="test-id" 
        pipelineName="Test Pipeline" 
      />
    )
    
    expect(screen.getByText('Test Run')).toBeInTheDocument()
  })
  
  it('should open modal when button clicked', () => {
    render(
      <DryRunButton 
        pipelineId="test-id" 
        pipelineName="Test Pipeline" 
      />
    )
    
    fireEvent.click(screen.getByText('Test Run'))
    
    expect(screen.getByText('Test Run Configuration')).toBeInTheDocument()
    expect(screen.getByText('Test Pipeline')).toBeInTheDocument()
  })
  
  it('should validate sample size input', () => {
    render(
      <DryRunButton 
        pipelineId="test-id" 
        pipelineName="Test Pipeline" 
      />
    )
    
    fireEvent.click(screen.getByText('Test Run'))
    
    const input = screen.getByLabelText(/sample size/i) as HTMLInputElement
    
    // Tentar valor inválido < 1
    fireEvent.change(input, { target: { value: '0' } })
    expect(input.value).toBe('1') // Clamped to min
    
    // Tentar valor inválido > 1000
    fireEvent.change(input, { target: { value: '1500' } })
    expect(input.value).toBe('1000') // Clamped to max
    
    // Valor válido
    fireEvent.change(input, { target: { value: '50' } })
    expect(input.value).toBe('50')
  })
  
  it('should call startDryRun with correct parameters', async () => {
    render(
      <DryRunButton 
        pipelineId="test-pipeline-123" 
        pipelineName="Test Pipeline" 
      />
    )
    
    fireEvent.click(screen.getByText('Test Run'))
    
    const input = screen.getByLabelText(/sample size/i)
    fireEvent.change(input, { target: { value: '25' } })
    
    const startButton = screen.getByText('Start Test Run')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(mockStartDryRun).toHaveBeenCalledWith('test-pipeline-123', 25)
    })
  })
  
  it('should be disabled when pipeline is disabled', () => {
    render(
      <DryRunButton 
        pipelineId="test-id" 
        pipelineName="Test Pipeline"
        disabled={true}
      />
    )
    
    const button = screen.getByText('Test Run')
    expect(button).toBeDisabled()
  })
})
```

---

### 3. Criar: `src/__tests__/components/DryRunResultModal.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { DryRunResultModal } from '@/components/pipelines/DryRunResultModal'
import { DryRunResult } from '@/types/dry-run'

describe('DryRunResultModal', () => {
  const mockResult: DryRunResult = {
    pipelineName: 'Test Pipeline',
    version: '1.0',
    success: true,
    startedAt: '2026-01-21T10:00:00Z',
    completedAt: '2026-01-21T10:00:02Z',
    durationMs: 2500,
    totalSampleMessages: 10,
    steps: [
      {
        stepType: 'source',
        connectorType: 'httpjsonget',
        success: true,
        skipped: false,
        message: 'Extracted 10 sample messages',
        startedAt: '2026-01-21T10:00:00Z',
        completedAt: '2026-01-21T10:00:01Z',
        durationMs: 1200,
        messageCount: 10,
        sampleData: [{ id: 1, name: 'Test' }]
      },
      {
        stepType: 'sink',
        connectorType: 'MySql.MySqlSinkConnector',
        success: true,
        skipped: true,
        message: '[DRY-RUN] Would send 10 messages',
        startedAt: '2026-01-21T10:00:01Z',
        completedAt: '2026-01-21T10:00:02Z',
        durationMs: 0,
        messageCount: 0,
        sampleData: []
      }
    ]
  }
  
  it('should render result summary', () => {
    render(
      <DryRunResultModal
        result={mockResult}
        isOpen={true}
        onClose={jest.fn()}
      />
    )
    
    expect(screen.getByText('Test Pipeline')).toBeInTheDocument()
    expect(screen.getByText('v1.0')).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('2.5s')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument() // Sample messages
  })
  
  it('should render all steps', () => {
    render(
      <DryRunResultModal
        result={mockResult}
        isOpen={true}
        onClose={jest.fn()}
      />
    )
    
    expect(screen.getByText('source')).toBeInTheDocument()
    expect(screen.getByText('httpjsonget')).toBeInTheDocument()
    expect(screen.getByText('Extracted 10 sample messages')).toBeInTheDocument()
    
    expect(screen.getByText('sink')).toBeInTheDocument()
    expect(screen.getByText('[DRY-RUN] Would send 10 messages')).toBeInTheDocument()
    expect(screen.getByText('Skipped')).toBeInTheDocument()
  })
  
  it('should expand/collapse sample data', () => {
    render(
      <DryRunResultModal
        result={mockResult}
        isOpen={true}
        onClose={jest.fn()}
      />
    )
    
    const showButton = screen.getByText(/show sample data/i)
    
    // Sample data inicialmente oculto
    expect(screen.queryByText(/react-json-view/i)).not.toBeInTheDocument()
    
    // Expandir
    fireEvent.click(showButton)
    
    // Verificar que JSONViewer está renderizado
    // (react-json-view renderiza componente)
    expect(screen.getByText(/hide sample data/i)).toBeInTheDocument()
  })
  
  it('should call onExecute when Execute Pipeline clicked', () => {
    const mockOnExecute = jest.fn()
    
    render(
      <DryRunResultModal
        result={mockResult}
        isOpen={true}
        onClose={jest.fn()}
        onExecute={mockOnExecute}
      />
    )
    
    const executeButton = screen.getByText('Execute Pipeline')
    fireEvent.click(executeButton)
    
    expect(mockOnExecute).toHaveBeenCalled()
  })
  
  it('should call onClose when Close clicked', () => {
    const mockOnClose = jest.fn()
    
    render(
      <DryRunResultModal
        result={mockResult}
        isOpen={true}
        onClose={mockOnClose}
      />
    )
    
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })
})
```

---

### 4. Criar: `src/__tests__/components/DryRunProgress.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import { DryRunProgress } from '@/components/pipelines/DryRunProgress'
import { DryRunStatus } from '@/types/dry-run'

describe('DryRunProgress', () => {
  const mockStatus: DryRunStatus = {
    id: 'test-123',
    pipelineId: 'pipeline-456',
    pipelineName: 'Test Pipeline',
    pipelineVersion: '1.0',
    status: 'running',
    sampleSize: 10,
    createdAt: '2026-01-21T10:00:00Z',
    startedAt: '2026-01-21T10:00:01Z'
  }
  
  it('should render progress modal when polling', () => {
    render(
      <DryRunProgress
        isPolling={true}
        status={mockStatus}
      />
    )
    
    expect(screen.getByText('Test Run in Progress')).toBeInTheDocument()
    expect(screen.getByText('Test Pipeline')).toBeInTheDocument()
  })
  
  it('should not render when not polling', () => {
    render(
      <DryRunProgress
        isPolling={false}
        status={null}
      />
    )
    
    expect(screen.queryByText('Test Run in Progress')).not.toBeInTheDocument()
  })
  
  it('should show correct status text for pending', () => {
    const pendingStatus = { ...mockStatus, status: 'pending' as const }
    
    render(
      <DryRunProgress
        isPolling={true}
        status={pendingStatus}
      />
    )
    
    expect(screen.getByText('Queued for execution...')).toBeInTheDocument()
  })
  
  it('should show correct status text for running', () => {
    render(
      <DryRunProgress
        isPolling={true}
        status={mockStatus}
      />
    )
    
    expect(screen.getByText('Running pipeline test...')).toBeInTheDocument()
  })
  
  it('should increment elapsed time', async () => {
    jest.useFakeTimers()
    
    render(
      <DryRunProgress
        isPolling={true}
        status={mockStatus}
      />
    )
    
    // Inicialmente 0:00
    expect(screen.getByText(/0:00/)).toBeInTheDocument()
    
    // Avançar 5 segundos
    jest.advanceTimersByTime(5000)
    
    expect(await screen.findByText(/0:05/)).toBeInTheDocument()
    
    jest.useRealTimers()
  })
})
```

---

## ✅ Checklist de Implementação

### Setup
- [ ] Configurar Jest (verificar `jest.config.js`)
- [ ] Configurar Testing Library
- [ ] Configurar mocks do API client
- [ ] Instalar dependências de teste necessárias

### Testes do Hook useDryRun
- [ ] Teste: startDryRun bem-sucedido
- [ ] Teste: startDryRun com erro
- [ ] Teste: polling até completed
- [ ] Teste: polling até failed
- [ ] Teste: timeout após 5 minutos
- [ ] Teste: cancelPolling
- [ ] Teste: resetState

### Testes do DryRunButton
- [ ] Teste: renderização do botão
- [ ] Teste: abertura de modal
- [ ] Teste: validação de sample size (min/max)
- [ ] Teste: submissão com parâmetros corretos
- [ ] Teste: botão desabilitado quando pipeline inativo
- [ ] Teste: loading state

### Testes do DryRunResultModal
- [ ] Teste: renderização de resumo
- [ ] Teste: renderização de steps
- [ ] Teste: expand/collapse sample data
- [ ] Teste: botão Execute Pipeline
- [ ] Teste: botão Close
- [ ] Teste: exibição de erros

### Testes do DryRunProgress
- [ ] Teste: renderização durante polling
- [ ] Teste: não renderiza quando não polling
- [ ] Teste: status text correto (pending/running)
- [ ] Teste: contador de tempo
- [ ] Teste: progress bar

### Cobertura
- [ ] Executar `npm run test:coverage`
- [ ] Verificar cobertura >= 80%
- [ ] Identificar gaps de cobertura
- [ ] Adicionar testes para casos não cobertos

---

## 🔧 Configuração Jest

Verificar/criar `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

Verificar/criar `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Mock do dynamic import (para react-json-view)
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args) => {
    const dynamicModule = jest.requireActual('next/dynamic')
    const dynamicActualComp = dynamicModule.default
    const RequiredComponent = dynamicActualComp(args[0])
    RequiredComponent.preload
      ? RequiredComponent.preload()
      : RequiredComponent.render.preload()
    return RequiredComponent
  },
}))
```

---

## 📊 Scripts de Teste

Adicionar em `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## 🚀 CI/CD Integration

Adicionar ao workflow GitHub Actions (`.github/workflows/test.yml`):

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📚 Referências

- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro
- **Jest**: https://jestjs.io/docs/getting-started
- **Testing Hooks**: https://react-hooks-testing-library.com/

---

**Criado em**: 2026-01-21  
**Atualizado em**: 2026-01-21
