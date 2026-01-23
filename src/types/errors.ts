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
