export function formatDateTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatNumber(value?: number | string | null, digits = 1) {
  if (value === undefined || value === null || value === '') return '-';
  return Number(value).toFixed(digits);
}

export function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString().slice(0, 19);
}

export function isoNow() {
  return new Date().toISOString().slice(0, 19);
}
