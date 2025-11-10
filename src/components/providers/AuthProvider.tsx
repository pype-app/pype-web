'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication when loading the application
    checkAuth();
    setIsInitialized(true);
  }, [checkAuth]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}