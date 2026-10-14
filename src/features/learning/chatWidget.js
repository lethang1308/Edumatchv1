import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

export const conversationThreadKey = (message) => `${message.courseId}:${message.studentId}:${message.teacherId}`;

const notify = () => window.dispatchEvent(new Event('edumatch:chat-widget-updated'));

export const getChatWidget = (userId) => {
  const widget = storage.get(STORAGE_KEYS.CHAT_WIDGET);
  return widget?.userId === userId ? widget : null;
};

export const setChatWidget = (userId, threadKey, changes = {}) => {
  const next = { userId, threadKey, isMinimized: false, isClosed: false, ...changes };
  storage.set(STORAGE_KEYS.CHAT_WIDGET, next);
  notify();
  return next;
};

export const updateChatWidget = (userId, changes) => {
  const current = getChatWidget(userId);
  if (!current) return null;
  const next = { ...current, ...changes };
  storage.set(STORAGE_KEYS.CHAT_WIDGET, next);
  notify();
  return next;
};
