/**
 * Formats a date string or Date object
 * @param {string|Date} date
 * @param {string} locale
 * @returns {string}
 */
export const formatDate = (date, locale = 'vi-VN') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

/**
 * Formats date and time
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date, locale = 'vi-VN') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Formats a date using a compact Vietnamese relative time label.
 * @param {string|Date} value
 * @param {Date} now
 * @returns {string}
 */
export const formatRelativeTime = (value, now = new Date()) => {
  if (!value || value === 'Vừa xong') return 'Vừa xong';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';

  const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (elapsedSeconds < 60) return 'Vừa xong';

  const units = [
    ['năm', 365 * 24 * 60 * 60],
    ['tháng', 30 * 24 * 60 * 60],
    ['tuần', 7 * 24 * 60 * 60],
    ['ngày', 24 * 60 * 60],
    ['giờ', 60 * 60],
    ['phút', 60],
  ];
  const [label, seconds] = units.find(([, amount]) => elapsedSeconds >= amount) || units.at(-1);
  return `${Math.floor(elapsedSeconds / seconds)} ${label} trước`;
};

export default formatDate;
