import Pusher from 'pusher-js';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

const appKey = import.meta.env.VITE_PUSHER_APP_KEY;
const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const authEndpoint = import.meta.env.VITE_PUSHER_AUTH_ENDPOINT || `${apiBaseUrl.replace(/\/api\/?$/, '')}/broadcasting/auth`;

let client = null;

export const pusherConfiguration = () => ({ appKey, cluster, authEndpoint });

export const getPusherClient = () => {
  if (!appKey) return null;
  if (!client) {
    Pusher.logToConsole = import.meta.env.DEV;
    client = new Pusher(appKey, {
      cluster,
      forceTLS: true,
      authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${storage.get(STORAGE_KEYS.ACCESS_TOKEN) || ''}`,
        },
      },
    });
  }
  return client;
};

/** Subscribe to the authenticated user's private notification channel. */
export const subscribeUserNotifications = (userId, onNotificationReceived) => {
  const numericUserId = Number(userId);
  const pusher = getPusherClient();
  if (!pusher || !Number.isInteger(numericUserId) || numericUserId < 1) return () => {};

  const channelName = `private-user.${numericUserId}`;
  const channel = pusher.subscribe(channelName);
  const listener = (notification) => onNotificationReceived?.(notification);
  channel.bind('notification.created', listener);

  return () => {
    channel.unbind('notification.created', listener);
    pusher.unsubscribe(channelName);
  };
};

/** Close the singleton on logout or when the active token becomes invalid. */
export const disconnectPusher = () => {
  if (!client) return;
  client.disconnect();
  client = null;
};
