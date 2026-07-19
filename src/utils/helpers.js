export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    active: 'success',
    inactive: 'default',
  };
  return colors[status] || 'default';
}

export function buildQueryString(params) {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== '' && v !== null && v !== undefined,
  );
  if (!filtered.length) return '';
  return '?' + new URLSearchParams(filtered).toString();
}
