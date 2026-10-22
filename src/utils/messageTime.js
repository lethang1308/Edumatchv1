const asDate = (value) => {
  if (!value || value === 'Vừa xong') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sameDay = (first, second) => first.getFullYear() === second.getFullYear()
  && first.getMonth() === second.getMonth()
  && first.getDate() === second.getDate();

const timeFormatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
const fullFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const dayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatMessageTime = (value, now = new Date()) => {
  const date = asDate(value);
  if (!date) return 'Vừa xong';
  const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (elapsedSeconds < 60) return 'Vừa xong';
  if (elapsedSeconds < 2 * 60 * 60) return `${Math.max(1, Math.floor(elapsedSeconds / 60))} phút trước`;
  return timeFormatter.format(date);
};

export const formatMessageTimestamp = (value) => {
  const date = asDate(value);
  return date ? fullFormatter.format(date) : 'Vừa xong';
};

export const messageNeedsDayDivider = (value, previousValue, now = new Date()) => {
  const date = asDate(value);
  if (!date || sameDay(date, now)) return false;
  const previousDate = asDate(previousValue);
  return !previousDate || !sameDay(date, previousDate);
};

export const formatMessageDayDivider = (value, now = new Date()) => {
  const date = asDate(value);
  if (!date) return '';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Hôm qua';
  return dayFormatter.format(date);
};
