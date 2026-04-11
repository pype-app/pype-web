'use client';

import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

interface ErrorSuggestionButtonProps {
  suggestion: string;
  onApply: (newValue: string) => void;
}

export function ErrorSuggestionButton({ suggestion, onApply }: ErrorSuggestionButtonProps) {
  const handleApply = () => {
    onApply(suggestion);
    if (typeof toast.success === 'function') {
      toast.success(`Applied suggestion: ${suggestion}`);
    }
  };

  return (
    <Button size="sm" variant="primary" onClick={handleApply}>
      Apply Suggestion: {suggestion}
    </Button>
  );
}