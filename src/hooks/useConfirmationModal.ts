'use client';

import { useState, useCallback } from 'react';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface UseConfirmationModalReturn {
  isOpen: boolean;
  loading: boolean;
  options: ConfirmationOptions | null;
  showConfirmation: (options: ConfirmationOptions, onConfirm: () => Promise<void>) => void;
  hideConfirmation: () => void;
  confirmAction: () => Promise<void>;
}

export function useConfirmationModal(): UseConfirmationModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => Promise<void>) | null>(null);

  const showConfirmation = useCallback((
    confirmOptions: ConfirmationOptions, 
    onConfirm: () => Promise<void>
  ) => {
    setOptions(confirmOptions);
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  }, []);

  const hideConfirmation = useCallback(() => {
    setIsOpen(false);
    setLoading(false);
    setOptions(null);
    setOnConfirmCallback(null);
  }, []);

  const confirmAction = useCallback(async () => {
    if (!onConfirmCallback) return;

    try {
      setLoading(true);
      await onConfirmCallback();
      hideConfirmation();
    } catch (error) {
      setLoading(false);
      // Don't close modal on error, let the callback handle it
    }
  }, [onConfirmCallback, hideConfirmation]);

  return {
    isOpen,
    loading,
    options,
    showConfirmation,
    hideConfirmation,
    confirmAction,
  };
}