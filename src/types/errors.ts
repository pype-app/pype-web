// ErrorResponseDto from backend (RFC 7807-inspired)
export interface ErrorResponseDto {
  status: number;
  code: string;
  title: string;
  detail: string;
  suggestions: string[];
  documentationUrl?: string;
  context?: Record<string, any>;
  traceId?: string;
}

// 🆕 BUG-001: Enriched validation error from backend
export interface ValidationError {
  path: string;              // Caminho JSON do campo (ex: "steps[0].source.type")
  kind: string;              // Tipo do erro (ex: "PropertyRequired", "YamlSyntaxError")
  message: string;           // Mensagem traduzida em português
  suggestion?: string;       // Sugestão acionável de correção
  line?: number;             // Linha do erro (1-based)
  column?: number;           // Coluna do erro (1-based)
  yamlSnippet?: string;      // Trecho do YAML com contexto (3-5 linhas)
  field?: string;            // Campo específico com erro (ex: "type")
  expectedType?: string;     // Tipo esperado (ex: "string", "number", "boolean")
}

// 🆕 BUG-001: Pipeline validation response from backend
export interface PipelineValidationResponse {
  isValid: boolean;
  errors?: ValidationError[];
}

// Re-export para facilitar imports
export type { ValidationError as EnrichedValidationError };
export type { PipelineValidationResponse as ValidationResponse };

// Connector info from backend context
export interface ConnectorInfo {
  type: string;
  name: string;
  category: 'Source' | 'Sink' | 'Both';
}

// Error display props
export interface ErrorDisplayProps {
  error: ErrorResponseDto;
  onApplySuggestion?: (suggestion: string) => void;
  onClose?: () => void;
  variant?: 'toast' | 'modal' | 'inline';
}

// Error handler hook return type
export interface UseErrorHandlerReturn {
  currentError: ErrorResponseDto | null;
  showError: (error: ErrorResponseDto) => void;
  clearError: () => void;
  isErrorVisible: boolean;
}

