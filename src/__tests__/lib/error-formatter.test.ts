import { sanitizeErrorContext, formatErrorForDisplay, extractLineNumber, isErrorResponseDto } from '@/lib/error-formatter';
import { ErrorResponseDto } from '@/types/errors';

describe('error-formatter utilities', () => {
  describe('sanitizeErrorContext', () => {
    it('returns empty object when context is undefined', () => {
      expect(sanitizeErrorContext(undefined)).toEqual({});
    });

    it('filters out unsafe keys', () => {
      const context = {
        availableConnectors: ['http', 'mysql'],
        TenantId: '12345', // UNSAFE - should be filtered
        ResponseBody: 'sensitive data', // UNSAFE - should be filtered
        path: 'steps[0].connector',
      };

      const sanitized = sanitizeErrorContext(context);

      expect(sanitized).toEqual({
        availableConnectors: ['http', 'mysql'],
        path: 'steps[0].connector',
      });
      expect(sanitized).not.toHaveProperty('TenantId');
      expect(sanitized).not.toHaveProperty('ResponseBody');
    });

    it('preserves all whitelisted keys', () => {
      const context = {
        availableConnectors: ['http'],
        path: 'steps[0]',
        connectorType: 'httpjsonget',
        profileName: 'default',
        stepName: 'step1',
        availableProfiles: ['profile1'],
        lineNumber: 10,
        columnNumber: 5,
      };

      const sanitized = sanitizeErrorContext(context);

      expect(sanitized).toEqual(context);
    });
  });

  describe('formatErrorForDisplay', () => {
    it('returns pypeError if already present', () => {
      const pypeError: ErrorResponseDto = {
        status: 400,
        code: 'TEST_ERROR',
        title: 'Test',
        detail: 'Test detail',
        suggestions: [],
      };

      const error = { pypeError };
      const result = formatErrorForDisplay(error);

      expect(result).toBeTruthy();
      expect(result?.code).toBe('TEST_ERROR');
    });

    it('formats Axios error with response', () => {
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { error: 'Resource not found' },
        },
      };

      const result = formatErrorForDisplay(error);

      expect(result).toBeTruthy();
      expect(result?.code).toBe('HTTP_404');
      expect(result?.title).toBe('Not Found');
      expect(result?.detail).toBe('Resource not found');
      expect(result?.suggestions.length).toBeGreaterThan(0);
    });

    it('formats network error', () => {
      const error = {
        message: 'Network Error',
      };

      const result = formatErrorForDisplay(error);

      expect(result).toBeTruthy();
      expect(result?.code).toBe('NETWORK_ERROR');
      expect(result?.title).toBe('Network Error');
      expect(result?.status).toBe(0);
    });

    it('provides appropriate suggestions for different status codes', () => {
      const testCases = [
        { status: 400, expectedSuggestionKeyword: 'parameters' },
        { status: 401, expectedSuggestionKeyword: 'authentication' },
        { status: 403, expectedSuggestionKeyword: 'permission' },
        { status: 404, expectedSuggestionKeyword: 'not found' },
        { status: 429, expectedSuggestionKeyword: 'many requests' },
        { status: 500, expectedSuggestionKeyword: 'Server error' },
      ];

      testCases.forEach(({ status, expectedSuggestionKeyword }) => {
        const error = {
          response: { status, statusText: 'Error' },
        };

        const result = formatErrorForDisplay(error);
        const suggestionText = result?.suggestions.join(' ').toLowerCase();
        
        expect(suggestionText).toContain(expectedSuggestionKeyword.toLowerCase());
      });
    });
  });

  describe('extractLineNumber', () => {
    it('returns 1 for undefined path', () => {
      expect(extractLineNumber(undefined)).toBe(1);
    });

    it('extracts line number from array index', () => {
      expect(extractLineNumber('steps[0].connector')).toBe(1); // 0 + 1
      expect(extractLineNumber('steps[5].config')).toBe(6); // 5 + 1
      expect(extractLineNumber('items[99]')).toBe(100); // 99 + 1
    });

    it('returns 1 for path without array index', () => {
      expect(extractLineNumber('connector.type')).toBe(1);
      expect(extractLineNumber('config.settings')).toBe(1);
    });
  });

  describe('isErrorResponseDto', () => {
    it('returns true for valid ErrorResponseDto', () => {
      const error: ErrorResponseDto = {
        status: 400,
        code: 'TEST',
        title: 'Test',
        detail: 'Detail',
        suggestions: [],
      };

      expect(isErrorResponseDto(error)).toBe(true);
    });

    it('returns false for invalid objects', () => {
      expect(isErrorResponseDto(null)).toBe(false);
      expect(isErrorResponseDto(undefined)).toBe(false);
      expect(isErrorResponseDto({})).toBe(false);
      expect(isErrorResponseDto({ code: 'TEST' })).toBe(false); // Missing required fields
      expect(isErrorResponseDto({ status: 400, code: 123 })).toBe(false); // Wrong type
    });

    it('returns true even with optional fields missing', () => {
      const minimalError = {
        status: 400,
        code: 'TEST',
        title: 'Test',
        detail: 'Detail',
        // suggestions, documentationUrl, context, traceId are optional
      };

      expect(isErrorResponseDto(minimalError)).toBe(true);
    });
  });
});
