import { useState, useEffect } from 'react';

/**
 * Hook to debounce value changes
 * @param {any} value
 * @param {number} delay (ms)
 * @returns {any}
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
