export function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const parsed = parseLocalDateTime(value);
  if (!parsed) return '-';
  return `${parsed.month}.${parsed.day}. ${parsed.hour}:${parsed.minute}:${parsed.second}`;
}

export function formatTime(value?: string | null) {
  if (!value) return '-';
  const parsed = parseLocalDateTime(value);
  if (!parsed) return '-';
  return `${parsed.hour}:${parsed.minute}:${parsed.second}`;
}

function parseLocalDateTime(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;

  return {
    year: match[1],
    month: match[2],
    day: match[3],
    hour: match[4],
    minute: match[5],
    second: match[6] ?? '00',
  };
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
