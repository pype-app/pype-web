import { ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes
 * Commonly used with shadcn/ui but works with any class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
