export default function getErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) {
    if (err?.message === 'Network Error') return 'Cannot reach the server. Is the backend running?';
    return 'Something went wrong. Please try again.';
  }
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const firstKey = Object.keys(data)[0];
  if (firstKey) return `${firstKey}: ${[].concat(data[firstKey]).join(', ')}`;
  return 'Something went wrong. Please try again.';
}
