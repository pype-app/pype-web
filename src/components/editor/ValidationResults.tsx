'use client';

import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ValidationResultsProps {
  isValid: boolean;
  errors: string[];
  className?: string;
}

export default function ValidationResults({
  isValid,
  errors,
  className = '',
}: ValidationResultsProps) {
  if (errors.length === 0) {
    return (
      <div className={`p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md ${className}`}>
        <div className="flex">
          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div className="ml-3">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              Valid YAML ready to save
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md ${className}`}>
      <div className="flex">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
            Validation errors found:
          </h3>
          <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-1 h-1 bg-red-500 dark:bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}