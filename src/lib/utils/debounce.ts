/**
 * Debounce utility
 * Delays function execution until after wait time has passed
 */

import { useCallback, useRef } from 'react';

/**
 * Create debounced callback hook
 */
export function useDebouncedCallback<T extends unknown[]>(
  callback: (...args: T) => void,
  wait: number
): (...args: T) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, wait);
    },
    [callback, wait]
  );
}
