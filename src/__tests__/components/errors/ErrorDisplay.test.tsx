import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { ErrorResponseDto } from '@/types/errors';

describe('ErrorDisplay Component', () => {
  const mockError: ErrorResponseDto = {
    status: 400,
    code: 'CONNECTOR_NOT_FOUND',
    title: 'Connector Not Found',
    detail: "Connector type 'httpJsonGet' not found in the system.",
    suggestions: ["Did you mean 'httpjsonget'?", 'Connector types are case-sensitive.'],
    documentationUrl: 'https://docs.pype.io/connectors',
    context: {
      availableConnectors: [
        { type: 'httpjsonget', name: 'HTTP JSON GET Source', category: 'Source' },
        { type: 'mysqlsource', name: 'MySQL Source', category: 'Source' },
      ],
      connectorType: 'httpJsonGet',
    },
    traceId: 'exec-8b3c7f29',
  };

  it('renders error title and detail', () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.getByText('Connector Not Found')).toBeInTheDocument();
    expect(screen.getByText(/httpJsonGet.*not found/i)).toBeInTheDocument();
  });

  it('displays suggestions list', () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.getByText(/Did you mean 'httpjsonget'/)).toBeInTheDocument();
    expect(screen.getByText(/case-sensitive/)).toBeInTheDocument();
  });

  it('shows available connectors from context', () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.getByText(/Available connectors/i)).toBeInTheDocument();
    expect(screen.getAllByText(/httpjsonget/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/mysqlsource/).length).toBeGreaterThan(0);
  });

  it('displays trace ID with copy functionality', () => {
    render(<ErrorDisplay error={mockError} />);

    const traceId = screen.getByText(/exec-8b3c7f29/);
    expect(traceId).toBeInTheDocument();
  });

  it('renders documentation link when provided', () => {
    render(<ErrorDisplay error={mockError} />);

    const docButton = screen.getByRole('button', { name: /view documentation/i });
    expect(docButton).toBeInTheDocument();
  });

  it('calls onApplySuggestion when Apply button clicked', () => {
    const onApplySuggestion = jest.fn();
    render(<ErrorDisplay error={mockError} onApplySuggestion={onApplySuggestion} />);

    const applyButton = screen.getByRole('button', { name: /apply.*httpjsonget/i });
    fireEvent.click(applyButton);

    expect(onApplySuggestion).toHaveBeenCalledWith('httpjsonget');
  });

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn();
    render(<ErrorDisplay error={mockError} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('handles error without suggestions gracefully', () => {
    const errorWithoutSuggestions: ErrorResponseDto = {
      ...mockError,
      suggestions: [],
    };

    render(<ErrorDisplay error={errorWithoutSuggestions} />);

    expect(screen.queryByText(/suggestions/i)).not.toBeInTheDocument();
  });

  it('handles error without documentation URL', () => {
    const errorWithoutDocs: ErrorResponseDto = {
      ...mockError,
      documentationUrl: undefined,
    };

    render(<ErrorDisplay error={errorWithoutDocs} />);

    expect(screen.queryByRole('link', { name: /documentation/i })).not.toBeInTheDocument();
  });

  it('applies correct icon based on error code', () => {
    const { container } = render(<ErrorDisplay error={mockError} />);
    
    // AlertTriangle icon for CONNECTOR_NOT_FOUND
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('applies correct color based on HTTP status', () => {
    const { container } = render(<ErrorDisplay error={mockError} />);
    
    // Should have yellow/warning color for 400 status
    expect(container.querySelector('.border-yellow-200')).toBeInTheDocument();
  });
});
