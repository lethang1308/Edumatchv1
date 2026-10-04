import { useState, useEffect } from 'react';
import { storage } from '@/utils/storage';

/**
 * Hook to sync React state with LocalStorage
 * @param {string} key
 * @param {any} initialValue
 * @returns {[any, Function]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    return storage.get(key, initialValue);
  });

  useEffect(() => {
    storage.set(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
