'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { APP_CONFIG } from '@/constants';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: APP_CONFIG.TOAST.INFO_DURATION,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
            success: {
              duration: APP_CONFIG.TOAST.SUCCESS_DURATION,
              style: {
                background: '#10b981',
                color: '#ffffff',
              },
            },
            error: {
              duration: APP_CONFIG.TOAST.ERROR_DURATION,
              style: {
                background: '#ef4444',
                color: '#ffffff',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}