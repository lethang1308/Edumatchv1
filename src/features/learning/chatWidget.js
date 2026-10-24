import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

export const conversationThreadKey = (message) => `${message.courseId}:${message.studentId}:${message.teacherId}`;

const notify = () => window.dispatchEvent(new Event('edumatch:chat-widget-updated'));

const readWidgets = (userId) => {
  const stored = storage.get(STORAGE_KEYS.CHAT_WIDGET);
  if (stored?.userId !== userId) return [];
  if (Array.isArray(stored.widgets)) return stored.widgets;
  return stored?.threadKey ? [{ threadKey: stored.threadKey, isMinimized: Boolean(stored.isMinimized), isClosed: Boolean(stored.isClosed) }] : [];
};

const saveWidgets = (userId, widgets) => {
  storage.set(STORAGE_KEYS.CHAT_WIDGET, { userId, widgets });
  notify();
};

export const getChatWidgets = (userId) => readWidgets(userId);

export const getChatWidget = (userId) => {
  return readWidgets(userId).find((widget) => !widget.isClosed) || null;
};

export const setChatWidget = (userId, threadKey, changes = {}) => {
  const widgets = readWidgets(userId);
  const current = widgets.find((widget) => widget.threadKey === threadKey);
  // Selecting a conversation is an explicit request to show it again, even if
  // that same window had previously been closed on the home page.
  const next = { ...current, threadKey, isMinimized: false, isClosed: false, ...changes };
  saveWidgets(userId, [next, ...widgets.filter((widget) => widget.threadKey !== threadKey)]);
  return next;
};

export const updateChatWidget = (userId, threadKey, changes) => {
  const current = readWidgets(userId).find((widget) => widget.threadKey === threadKey);
  if (!current) return null;
  const next = { ...current, ...changes };
  saveWidgets(userId, readWidgets(userId).map((widget) => widget.threadKey === threadKey ? next : widget));
  return next;
};
