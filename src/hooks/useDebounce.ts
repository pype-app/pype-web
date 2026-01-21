import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * 
 * Useful for search inputs, form validation, or any scenario
 * where you want to delay an action until the user stops typing.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 * 
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 300);
 * 
 *   useEffect(() => {
 *     if (debouncedSearch) {
 *       performSearch(debouncedSearch);
 *     }
 *   }, [debouncedSearch]);
 * 
 *   return (
 *     <input
 *       value={search}
 *       onChange={(e) => setSearch(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function - cancel the timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Alternative hook that returns both the debounced value and a loading state
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Tuple of [debouncedValue, isDebouncing]
 * 
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const [debouncedSearch, isDebouncing] = useDebouncedValue(search, 300);
 * 
 * return (
 *   <>
 *     <input value={search} onChange={(e) => setSearch(e.target.value)} />
 *     {isDebouncing && <Spinner />}
 *   </>
 * );
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, isDebouncing];
}
