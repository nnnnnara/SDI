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

export function formatPercent(value?: number | string | null, digits = 1) {
  if (value === undefined || value === null || value === '') return '-';
  return `${formatNumber(Number(value) * 100, digits)}%`;
}

export function formatDuration(startedAt?: string | null, endedAt?: string | null) {
  if (!startedAt) return '-';

  const startTime = new Date(startedAt).getTime();
  const endTime = endedAt ? new Date(endedAt).getTime() : Date.now();
  const durationSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000));
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  if (hours > 0) return `${hours}시간 ${minutes}분`;
  if (minutes > 0) return `${minutes}분 ${seconds}초`;
  return `${seconds}초`;
}

export function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString().slice(0, 19);
}

export function isoNow() {
  return new Date().toISOString().slice(0, 19);
}
