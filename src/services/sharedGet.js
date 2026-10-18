import api from './api';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

const pendingReads = new Map();

// Share only pending GETs with the same session, URL and query parameters.
// Remove settled requests so later visits and retries always load fresh data.
export function sharedGet(url, params = {}) {
  const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  const query = Object.entries(params).sort(([left], [right]) => left.localeCompare(right));
  const key = JSON.stringify([token, url, query]);

  if (!pendingReads.has(key)) {
    const request = api.get(url, { params }).finally(() => {
      pendingReads.delete(key);
    });
    pendingReads.set(key, request);
  }

  return pendingReads.get(key);
}
