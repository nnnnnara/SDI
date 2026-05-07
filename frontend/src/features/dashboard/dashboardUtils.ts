import type { InspectionResponse, ProcessRunResponse } from '../../api/client';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

export function processStatusLabel(status?: ProcessRunResponse['status'] | null) {
  if (status === 'RUNNING') return '진행 중';
  if (status === 'READY') return '대기';
  if (status === 'STOPPED') return '중지됨';
  if (status === 'ERROR') return '오류';
  return '공정 없음';
}

export function statusVariant(status?: string | null): BadgeVariant {
  if (status === 'RUNNING' || status === 'SUCCESS') return 'success';
  if (status === 'SENT') return 'info';
  if (status === 'ERROR' || status === 'FAILED') return 'danger';
  if (status === 'STOPPED' || status === 'REQUESTED') return 'warning';
  return 'default';
}

export function commandTypeLabel(commandType: string) {
  if (commandType === 'START') return '시작';
  if (commandType === 'STOP') return '중지';
  return commandType;
}

export function inspectionVariant(result: InspectionResponse['result']): BadgeVariant {
  return result === 'GOOD' ? 'success' : 'danger';
}

export function latestByInspectedAt(items: InspectionResponse[]) {
  return [...items].sort((a, b) => new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime())[0];
}

export function defectRateClass(rate: number) {
  if (rate < 25) return 'border-brand-success/40 bg-brand-success/15 text-brand-success';
  if (rate < 50) return 'border-brand-warning/40 bg-brand-warning/15 text-brand-warning';
  if (rate < 75) return 'border-brand-danger/40 bg-brand-danger/15 text-brand-danger';
  return 'border-brand-danger bg-brand-danger/25 text-rose-200';
}

export const cameraStreams = [
  {
    name: '1번 카메라',
    url: import.meta.env.VITE_CAMERA_STREAM_URL_1 || '/camera-view-1/',
  },
  {
    name: '2번 카메라',
    url: import.meta.env.VITE_CAMERA_STREAM_URL_2 || '/camera-view-2/',
  },
];
