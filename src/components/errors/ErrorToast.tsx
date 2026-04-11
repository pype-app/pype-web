'use client';

import { ErrorDisplay } from './ErrorDisplay';
import { ErrorResponseDto } from '@/types/errors';

interface ErrorToastProps {
  error: ErrorResponseDto;
  onClose: () => void;
}

export function ErrorToast({ error, onClose }: ErrorToastProps) {
  return (
    <div className="w-full max-w-lg rounded-lg shadow-lg">
      <ErrorDisplay error={error} onClose={onClose} variant="toast" className="shadow-lg" />
    </div>
  );
}