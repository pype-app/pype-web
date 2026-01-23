import React from 'react';
import { AlertTriangle, XCircle, AlertCircle, Info, CheckCircle } from 'lucide-react';

export interface AlertProps {
  variant?: 'error' | 'warning' | 'info' | 'success' | 'default';
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
    Icon: XCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
    icon: 'text-yellow-600 dark:text-yellow-400',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
    Icon: Info,
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400',
    Icon: CheckCircle,
  },
  default: {
    container: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300',
    icon: 'text-gray-600 dark:text-gray-400',
    Icon: AlertCircle,
  },
};

export function Alert({ variant = 'default', children, className = '', onClose }: AlertProps) {
  const styles = VARIANT_STYLES[variant];
  const IconComponent = styles.Icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`relative border-l-4 p-4 rounded-r-md flex items-start gap-3 ${styles.container} ${className}`}
    >
      <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} aria-hidden="true" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function AlertTitle({ children, className = '' }: AlertTitleProps) {
  return <h3 className={`font-semibold text-sm mb-1 ${className}`}>{children}</h3>;
}

export function AlertDescription({ children, className = '' }: AlertDescriptionProps) {
  return <div className={`text-sm ${className}`}>{children}</div>;
}
