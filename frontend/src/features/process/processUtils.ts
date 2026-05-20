import type { ProcessRunResponse } from '../../api/client';
import type { BadgeVariant } from '../dashboard/dashboardUtils';

export function processStatusVariant(status?: ProcessRunResponse['status'] | string | null): BadgeVariant {
  if (status === 'RUNNING' || status === 'COMPLETED') return 'success';
  if (status === 'ERROR') return 'danger';
  if (status === 'STOPPED') return 'warning';
  return 'default';
}

export function processStatusDisplay(status?: ProcessRunResponse['status'] | string | null) {
  if (status === 'RUNNING') return '\uc9c4\ud589 \uc911';
  if (status === 'COMPLETED') return '\uc644\ub8cc';
  if (status === 'STOPPED') return '\uc911\ub2e8';
  if (status === 'ERROR') return '\uc624\ub958';
  if (status === 'READY') return '\ub300\uae30';
  return status ?? '-';
}

export function stopReasonVariant(stopReason?: string | null, status?: ProcessRunResponse['status'] | string | null): BadgeVariant {
  if (status === 'RUNNING' || status === 'COMPLETED') return 'success';
  if (stopReason === 'NORMAL_COMPLETE') return 'success';
  if (stopReason === 'USER_STOP' || status === 'STOPPED') return 'warning';
  if (status === 'ERROR') return 'danger';
  return 'default';
}

export function stopReasonDisplay(stopReason?: string | null, status?: ProcessRunResponse['status'] | string | null) {
  if (status === 'RUNNING') return '\uc9c4\ud589 \uc911';
  if (status === 'COMPLETED' || stopReason === 'NORMAL_COMPLETE') return '\uc815\uc0c1 \uc644\ub8cc';
  if (stopReason === 'USER_STOP' || status === 'STOPPED') return '\uc0ac\uc6a9\uc790 \uc911\uc9c0';
  if (status === 'ERROR') return '\uc624\ub958 \uc885\ub8cc';
  return stopReason ?? '-';
}
