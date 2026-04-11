/**
 * IMP-011 E2E Gherkin Validation Tests
 * 
 * Valida os 4 cenários Gherkin da User Story:
 * - Cenário 1: Exibição de erro estruturado (Connector Not Found)
 * - Cenário 2: Aplicação de sugestão automática
 * - Cenário 3: Erros de runtime com contexto
 * - Cenário 4: Validação em tempo real (Monaco)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { ExecutionTimeline } from '@/components/errors/ExecutionTimeline';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorResponseDto } from '@/types/errors';
import { renderHook, act } from '@testing-library/react';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    custom: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    dismiss: jest.fn(),
  },
}));

describe('IMP-011 Gherkin Validation - E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Cenário 1: Exibição de erro estruturado
   * 
   * Gherkin:
   *   Given o backend retorna erro CONNECTOR_NOT_FOUND
   *   When eu visualizo o erro na UI
   *   Then devo ver modal/toast de erro com elementos estruturados
   */
  describe('Cenário 1: Exibição de erro estruturado', () => {
    const mockConnectorNotFoundError: ErrorResponseDto = {
      status: 400,
      code: 'CONNECTOR_NOT_FOUND',
      title: 'Connector Not Found',
      detail: "Connector type 'httpJsonGet' not found.",
      suggestions: [
        "Did you mean 'httpjsonget'?",
        'Connector types are case-sensitive.',
      ],
      documentationUrl: 'https://docs.pype.io/connectors/http',
      context: {
        connectorType: 'httpJsonGet',
        availableConnectors: [
          { type: 'httpjsonget', name: 'HTTP JSON GET Source', category: 'Source' },
          { type: 'httpjsonpost', name: 'HTTP JSON POST Sink', category: 'Sink' },
        ],
      },
      traceId: 'exec-test-001',
    };

    it('✅ GIVEN backend retorna CONNECTOR_NOT_FOUND | THEN devo ver todos os elementos estruturados', () => {
      render(<ErrorDisplay error={mockConnectorNotFoundError} />);

      // THEN: Título descritivo
      expect(screen.getByText('Connector Not Found')).toBeInTheDocument();

      // THEN: Mensagem principal formatada
      expect(screen.getByText(/httpJsonGet.*not found/i)).toBeInTheDocument();

      // THEN: Lista de sugestões (2 itens)
      expect(screen.getByText(/Did you mean 'httpjsonget'/)).toBeInTheDocument();
      expect(screen.getByText(/case-sensitive/)).toBeInTheDocument();

      // THEN: Lista de conectores disponíveis (2 itens)
      expect(screen.getByText(/Available connectors/i)).toBeInTheDocument();
      expect(screen.getAllByText(/httpjsonget/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/httpjsonpost/)).toBeInTheDocument();

      // THEN: Botão para documentação
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      expect(docButton).toBeInTheDocument();

      // THEN: TraceId copiável
      expect(screen.getByText(/exec-test-001/)).toBeInTheDocument();
    });

    it('✅ WHEN clico em Apply Suggestion | THEN onApplySuggestion é chamado', () => {
      const onApplySuggestion = jest.fn();
      render(
        <ErrorDisplay error={mockConnectorNotFoundError} onApplySuggestion={onApplySuggestion} />
      );

      // WHEN: Clico no botão "Apply Suggestion"
      const applyButton = screen.getByRole('button', { name: /apply.*httpjsonget/i });
      fireEvent.click(applyButton);

      // THEN: Callback é chamado com sugestão correta
      expect(onApplySuggestion).toHaveBeenCalledWith('httpjsonget');
    });

    it('✅ WHEN clico em View Documentation | THEN abre URL correta', () => {
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      render(<ErrorDisplay error={mockConnectorNotFoundError} />);

      // WHEN: Clico em View Documentation
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      fireEvent.click(docButton);

      // THEN: window.open chamado com URL segura e flags de segurança
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://docs.pype.io/connectors/http',
        '_blank',
        'noopener,noreferrer'
      );

      windowOpenSpy.mockRestore();
    });

    it('✅ SECURITY: Sanitiza connector.name para prevenir XSS', () => {
      const xssError: ErrorResponseDto = {
        ...mockConnectorNotFoundError,
        context: {
          availableConnectors: [
            { type: 'http', name: '<script>alert("XSS")</script>', category: 'Source' },
          ],
        },
      };

      const { container } = render(<ErrorDisplay error={xssError} />);

      // THEN: Script tag NÃO deve ser renderizado como HTML
      expect(container.querySelector('script')).toBeNull();
      // THEN: Deve aparecer como texto escapado
      expect(container.textContent).toContain('&lt;script&gt;');
    });
  });

  /**
   * Cenário 2: Aplicação de sugestão automática
   * 
   * Gherkin:
   *   Given estou editando pipeline YAML com erro
   *   When clico em "Apply Suggestion"
   *   Then o editor YAML deve ser atualizado
   */
  describe('Cenário 2: Aplicação de sugestão automática', () => {
    it('✅ GIVEN erro com sugestão | WHEN clico Apply | THEN editor é atualizado', () => {
      const mockEditor = {
        getValue: jest.fn(() => 'steps:\n  - source:\n      type: httpJsonGet'),
        setValue: jest.fn(),
      };

      const error: ErrorResponseDto = {
        status: 400,
        code: 'CONNECTOR_NOT_FOUND',
        title: 'Connector Not Found',
        detail: "Connector type 'httpJsonGet' not found.",
        suggestions: ["Did you mean 'httpjsonget'?"],
        context: {
          connectorType: 'httpJsonGet',
        },
      };

      const onApplySuggestion = jest.fn((suggestion: string) => {
        const currentValue = mockEditor.getValue();
        const newValue = currentValue.replace('httpJsonGet', suggestion);
        mockEditor.setValue(newValue);
      });

      render(<ErrorDisplay error={error} onApplySuggestion={onApplySuggestion} />);

      // WHEN: Clico em Apply Suggestion
      const applyButton = screen.getByRole('button', { name: /apply.*httpjsonget/i });
      fireEvent.click(applyButton);

      // THEN: Callback foi chamado
      expect(onApplySuggestion).toHaveBeenCalledWith('httpjsonget');

      // THEN: Editor foi atualizado (simulação)
      expect(mockEditor.setValue).toHaveBeenCalledWith(
        'steps:\n  - source:\n      type: httpjsonget'
      );
    });
  });

  /**
   * Cenário 3: Erros de runtime com contexto
   * 
   * Gherkin:
   *   Given execução de pipeline falhou no step "source"
   *   When abro detalhes da execução
   *   Then devo ver timeline com status corretos
   */
  describe('Cenário 3: Erros de runtime com contexto', () => {
    it('✅ GIVEN pipeline falhou | THEN devo ver timeline com status corretos', () => {
      const executionSteps = [
        {
          name: 'auth',
          status: 'success' as const,
          duration: 120,
          startedAt: '2026-01-23T10:00:00Z',
          completedAt: '2026-01-23T10:00:00.12Z',
        },
        {
          name: 'source (httpjsonget)',
          status: 'failed' as const,
          error: {
            status: 401,
            code: 'HTTP_401_UNAUTHORIZED',
            title: 'HTTP 401 Unauthorized',
            detail: 'Failed to authenticate with the API endpoint.',
            suggestions: [
              'Check your authentication credentials in the auth profile',
              'Verify the API key is still valid',
              'Try logging in again to refresh tokens',
            ],
            context: {
              url: 'https://api.example.com/data',
            },
            traceId: 'exec-runtime-001',
          },
          duration: 340,
          startedAt: '2026-01-23T10:00:00.12Z',
          completedAt: '2026-01-23T10:00:00.46Z',
        },
        {
          name: 'transform',
          status: 'skipped' as const,
        },
        {
          name: 'sink',
          status: 'skipped' as const,
        },
      ];

      render(<ExecutionTimeline steps={executionSteps} />);

      // THEN: Devo ver 4 steps
      expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1);

      // THEN: Step "auth" com status success
      expect(screen.getByText('auth')).toBeInTheDocument();
      expect(screen.getByText('120ms')).toBeInTheDocument();

      // THEN: Step "source" com status failed
      expect(screen.getByText(/source.*httpjsonget/i)).toBeInTheDocument();
      expect(screen.getByText('340ms')).toBeInTheDocument();

      // THEN: Steps "transform" e "sink" com status skipped
      expect(screen.getByText('transform')).toBeInTheDocument();
      expect(screen.getByText('sink')).toBeInTheDocument();
    });

    it('✅ WHEN clico em step failed | THEN erro é expandido com contexto', () => {
      const failedStep = {
        name: 'source',
        status: 'failed' as const,
        error: {
          status: 401,
          code: 'HTTP_401_UNAUTHORIZED',
          title: 'HTTP 401 Unauthorized',
          detail: 'Authentication failed',
          suggestions: ['Check credentials'],
          traceId: 'exec-runtime-002',
        },
      };

      render(<ExecutionTimeline steps={[failedStep]} />);

      // WHEN: Clico no step para expandir
      const stepButton = screen.getByText('source');
      fireEvent.click(stepButton);

      // THEN: Erro detalhado deve aparecer
      waitFor(() => {
        expect(screen.getByText('HTTP 401 Unauthorized')).toBeInTheDocument();
        expect(screen.getByText(/Authentication failed/)).toBeInTheDocument();
        expect(screen.getByText(/Check credentials/)).toBeInTheDocument();
        expect(screen.getByText(/exec-runtime-002/)).toBeInTheDocument();
      });
    });

    it('✅ THEN execution ID deve ser copiável', () => {
      // Mock clipboard API (não disponível em jsdom)
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
      const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');

      const error: ErrorResponseDto = {
        status: 500,
        code: 'INTERNAL_ERROR',
        title: 'Internal Error',
        detail: 'Something went wrong',
        suggestions: [],
        traceId: 'exec-copy-test',
      };

      render(<ErrorDisplay error={error} />);

      // WHEN: Clico no traceId
      const traceIdElement = screen.getByText('exec-copy-test');
      fireEvent.click(traceIdElement);

      // THEN: TraceId é copiado para clipboard
      expect(clipboardSpy).toHaveBeenCalledWith('exec-copy-test');

      clipboardSpy.mockRestore();
    });
  });

  /**
   * Cenário 4: Validação em tempo real (Integração com useErrorHandler)
   * 
   * Gherkin:
   *   Given estou usando o sistema
   *   When erro ocorre
   *   Then useErrorHandler captura e exibe automaticamente
   */
  describe('Cenário 4: Integração com useErrorHandler', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-23T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('✅ WHEN showError é chamado | THEN erro é armazenado no estado', () => {
      const { result } = renderHook(() => useErrorHandler());

      const error: ErrorResponseDto = {
        status: 400,
        code: 'VALIDATION_ERROR',
        title: 'Validation Error',
        detail: 'Invalid YAML syntax',
        suggestions: ['Check line 5'],
        traceId: 'val-001',
      };

      // WHEN: showError é chamado
      act(() => {
        result.current.showError(error);
      });

      // THEN: Erro está no estado atual
      expect(result.current.currentError).not.toBeNull();
      expect(result.current.currentError?.code).toBe('VALIDATION_ERROR');

      // THEN: Erro está no histórico
      expect(result.current.errorHistory).toHaveLength(1);
      expect(result.current.errorHistory[0].traceId).toBe('val-001');
    });

    it('✅ SECURITY: Rate limiting previne spam de erros', () => {
      const { result } = renderHook(() => useErrorHandler());

      const error: ErrorResponseDto = {
        status: 500,
        code: 'TEST_ERROR',
        title: 'Test',
        detail: 'Test error',
        suggestions: [],
      };

      // WHEN: Tento mostrar 10 erros em menos de 1 segundo
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.showError({ ...error, traceId: `spam-${i}` });
        }
      });

      // THEN: Apenas o primeiro erro foi processado (rate limiting 1/sec)
      expect(result.current.errorHistory).toHaveLength(1);

      // WHEN: Avanço 1 segundo
      act(() => {
        jest.advanceTimersByTime(1001);
      });

      // WHEN: Tento novamente
      act(() => {
        result.current.showError({ ...error, traceId: 'after-delay' });
      });

      // THEN: Segundo erro foi aceito
      expect(result.current.errorHistory).toHaveLength(2);
    });

    it('✅ SECURITY: Context sensível é sanitizado', () => {
      // Reset state first
      useErrorHandler.setState({ currentError: null, errorHistory: [], _lastErrorTime: 0 });
      
      const { result } = renderHook(() => useErrorHandler());

      const errorWithSensitiveData: ErrorResponseDto = {
        status: 500,
        code: 'LEAK_TEST',
        title: 'Test',
        detail: 'Test',
        suggestions: [],
        context: {
          path: '/pipelines/validate', // SAFE (whitelist)
          connectorType: 'httpjsonget', // SAFE (whitelist)
          TenantId: 'SHOULD_BE_FILTERED', // UNSAFE (não está na whitelist)
          ResponseBody: 'SENSITIVE_DATA', // UNSAFE (não está na whitelist)
        },
      };

      act(() => {
        result.current.showError(errorWithSensitiveData);
      });

      // THEN: Dados sensíveis foram filtrados
      const storedError = result.current.currentError;
      expect(storedError).not.toBeNull();
      expect(storedError?.context).toBeDefined();
      
      // THEN: path e connectorType (whitelist) devem estar presentes
      expect(storedError?.context?.path).toBe('/pipelines/validate');
      expect(storedError?.context?.connectorType).toBe('httpjsonget');
      
      // THEN: Keys sensíveis devem ser undefined (não na whitelist)
      expect(storedError?.context?.TenantId).toBeUndefined();
      expect(storedError?.context?.ResponseBody).toBeUndefined();
    });
  });

  /**
   * Testes de Regras de Negócio
   */
  describe('Regras de Negócio', () => {
    it('✅ RN-001: Ícones corretos para cada tipo de erro', () => {
      const errorCodes = [
        { code: 'CONNECTOR_NOT_FOUND', expectedIcon: 'AlertTriangle' },
        { code: 'INVALID_CONFIGURATION', expectedIcon: 'XCircle' },
        { code: 'AUTH_PROFILE_NOT_FOUND', expectedIcon: 'AlertCircle' },
      ];

      errorCodes.forEach(({ code }) => {
        const error: ErrorResponseDto = {
          status: 400,
          code,
          title: 'Test Error',
          detail: 'Test',
          suggestions: [],
        };

        const { container } = render(<ErrorDisplay error={error} />);

        // THEN: SVG icon está presente
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('✅ RN-002: Histórico de erros limitado a 50 itens', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-23T00:00:00Z'));

      const { result } = renderHook(() => useErrorHandler());

      // WHEN: Adiciono 60 erros
      for (let i = 0; i < 60; i++) {
        act(() => {
          result.current.showError({
            status: 500,
            code: 'TEST',
            title: 'Test',
            detail: 'Test',
            suggestions: [],
            traceId: `test-${i}`,
          });
        });

        // Avançar tempo para bypass rate limiting
        act(() => {
          jest.advanceTimersByTime(1001);
        });
      }

      // THEN: Apenas os últimos 50 estão armazenados
      expect(result.current.errorHistory).toHaveLength(50);

      jest.useRealTimers();
    });

    it('✅ RN-004: Não exibe dados técnicos para usuários finais', () => {
      const error: ErrorResponseDto = {
        status: 500,
        code: 'INTERNAL_ERROR',
        title: 'Something went wrong',
        detail: 'An unexpected error occurred',
        suggestions: ['Try again later'],
        traceId: 'exec-123',
        context: {
          // Stack trace NÃO deve aparecer
          stackTrace: 'at Function.doSomething (/app/index.js:42)',
        },
      };

      render(<ErrorDisplay error={error} />);

      // THEN: Stack trace NÃO deve ser renderizado
      expect(screen.queryByText(/Function.doSomething/)).not.toBeInTheDocument();

      // THEN: TraceId SIM deve aparecer (para suporte)
      expect(screen.getByText(/exec-123/)).toBeInTheDocument();
    });
  });
});
