import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

const PRESENCE_TTL = 45_000;
const HEARTBEAT_INTERVAL = 15_000;

const readActiveUsers = () => {
  const now = Date.now();
  const records = storage.get(STORAGE_KEYS.ONLINE_PRESENCE, {});
  return Object.fromEntries(
    Object.entries(records).filter(([, lastSeen]) => Number(lastSeen) > now - PRESENCE_TTL)
  );
};

export function useOnlinePresence(userId) {
  const [activeUsers, setActiveUsers] = useState(() => readActiveUsers());

  useEffect(() => {
    if (!userId) return undefined;

    const heartbeat = () => {
      const next = { ...readActiveUsers(), [userId]: Date.now() };
      storage.set(STORAGE_KEYS.ONLINE_PRESENCE, next);
      setActiveUsers(next);
    };
    const syncFromOtherTab = (event) => {
      if (event.key === STORAGE_KEYS.ONLINE_PRESENCE) setActiveUsers(readActiveUsers());
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) heartbeat();
    };

    heartbeat();
    const interval = window.setInterval(heartbeat, HEARTBEAT_INTERVAL);
    window.addEventListener('storage', syncFromOtherTab);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', syncFromOtherTab);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);

  return {
    isOnline: (profileId) => Boolean(profileId && activeUsers[profileId]),
  };
}
