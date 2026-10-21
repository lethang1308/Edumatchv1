export function fieldErrors(error) {
  return Object.fromEntries(
    Object.entries(error.response?.data?.errors || {}).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  );
}

export function requestError(error, fallback = 'Chưa thể thực hiện. Vui lòng thử lại.') {
  return (
    error.response?.data?.message ||
    (error.request ? 'Không thể kết nối tới máy chủ. Vui lòng thử lại.' : error.message) ||
    fallback
  );
}
