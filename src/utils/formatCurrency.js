/**
 * Formats a number to currency string (default VND)
 * @param {number|string} amount
 * @param {string} currency - 'VND', 'USD', etc.
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'VND') => {
  const num = Number(amount) || 0;
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
};

export default formatCurrency;
