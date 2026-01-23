import { useState, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import { type editor as MonacoEditor } from 'monaco-editor';
import { apiClient } from '@/lib/api-client';
import { ErrorResponseDto } from '@/types/errors';
import { extractLineNumber } from '@/lib/error-formatter';
import logger from '@/utils/logger';

export interface MonacoValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
}

export interface MonacoValidationResult {
  validateYAML: (content: string) => void;
  validationErrors: ErrorResponseDto[];
  isValidating: boolean;
  clearValidation: () => void;
}

/**
 * Hook for Monaco Editor YAML validation with backend integration.
 * Follows ADR-004: Monaco Editor Validation Strategy.
 * 
 * Features:
 * - Debounced validation (default 500ms)
 * - Automatic Monaco markers (red squiggles)
 * - Error extraction from ErrorResponseDto
 * - Cancellation of pending requests
 * 
 * @param editor - Monaco editor instance
 * @param options - Validation options (debounceMs, validateOnMount)
 */
export function useMonacoValidation(
  editor: MonacoEditor.IStandaloneCodeEditor | null,
  options: MonacoValidationOptions = {}
): MonacoValidationResult {
  const { debounceMs = 500, validateOnMount = false } = options;
  
  const [validationErrors, setValidationErrors] = useState<ErrorResponseDto[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Cancel pending request on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const performValidation = async (content: string) => {
    if (!content || !content.trim()) {
      clearValidation();
      return;
    }

    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    setIsValidating(true);

    try {
      // Call backend validation endpoint
      await apiClient.post(
        '/api/pipelines/crud/validate',
        { yamlDefinition: content },
        { 
          signal: newAbortController.signal,
          timeout: 10000 // 10 seconds max (prevent hanging requests)
        }
      );

      // Validation passed - clear markers
      setValidationErrors([]);
      
      const model = editor?.getModel();
      if (model && typeof window !== 'undefined' && (window as any).monaco) {
        (window as any).monaco.editor.setModelMarkers(model, 'pype', []);
      }

      logger.debug('YAML validation passed');
      
    } catch (error: any) {
      // Ignore aborted requests
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        logger.debug('Validation request cancelled');
        return;
      }

      // Handle validation errors
      if (error.pypeError) {
        const errorDto: ErrorResponseDto = error.pypeError;
        setValidationErrors([errorDto]);

        // Set Monaco markers (red squiggles)
        const model = editor?.getModel();
        if (model && typeof window !== 'undefined' && (window as any).monaco) {
          const lineNumber = extractLineNumber(errorDto.context?.path);
          const columnNumber = errorDto.context?.columnNumber || 1;
          
          (window as any).monaco.editor.setModelMarkers(model, 'pype', [
            {
              severity: (window as any).monaco.MarkerSeverity.Error,
              message: errorDto.detail,
              startLineNumber: lineNumber,
              startColumn: columnNumber,
              endLineNumber: lineNumber,
              endColumn: columnNumber + 20, // Highlight approximate word length
            },
          ]);
        }

        logger.debug('YAML validation failed:', errorDto.code);
      } else {
        // Unexpected error
        logger.error('Unexpected validation error:', error);
      }
    } finally {
      setIsValidating(false);
      setAbortController(null);
    }
  };

  // Debounced validation function
  const validateYAML = useMemo(
    () => debounce(performValidation, debounceMs),
    [editor, debounceMs]
  );

  const clearValidation = () => {
    setValidationErrors([]);
    const model = editor?.getModel();
    if (model && typeof window !== 'undefined' && (window as any).monaco) {
      (window as any).monaco.editor.setModelMarkers(model, 'pype', []);
    }
  };

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount && editor) {
      const content = editor.getValue();
      if (content) {
        validateYAML(content);
      }
    }
  }, [validateOnMount, editor]);

  return {
    validateYAML,
    validationErrors,
    isValidating,
    clearValidation,
  };
}
