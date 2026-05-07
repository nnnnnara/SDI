import type { ProcessRunResponse } from '../../api/client';
import type { BadgeVariant } from '../dashboard/dashboardUtils';

export function processStatusVariant(status?: ProcessRunResponse['status'] | string | null): BadgeVariant {
  if (status === 'RUNNING') return 'success';
  if (status === 'ERROR') return 'danger';
  if (status === 'STOPPED') return 'warning';
  return 'default';
}

export function processStatusDisplay(status?: ProcessRunResponse['status'] | string | null) {
  if (status === 'RUNNING') return '진행 중';
  if (status === 'STOPPED') return '종료됨';
  if (status === 'ERROR') return '오류';
  if (status === 'READY') return '대기';
  return status ?? '-';
}

export function stopReasonVariant(stopReason?: string | null, status?: ProcessRunResponse['status'] | string | null): BadgeVariant {
  if (status === 'RUNNING') return 'success';
  if (stopReason === 'NORMAL_COMPLETE') return 'success';
  if (stopReason === 'USER_STOP') return 'warning';
  if (status === 'ERROR') return 'danger';
  return 'default';
}

export function stopReasonDisplay(stopReason?: string | null, status?: ProcessRunResponse['status'] | string | null) {
  if (status === 'RUNNING') return '진행 중';
  if (stopReason === 'NORMAL_COMPLETE') return '정상 완료';
  if (stopReason === 'USER_STOP') return '사용자 중지';
  if (status === 'ERROR') return '오류 종료';
  return stopReason ?? '-';
}
