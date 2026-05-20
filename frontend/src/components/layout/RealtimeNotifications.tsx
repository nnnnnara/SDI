import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react';
import { createApiUrl } from '../../api/client';
import type { InspectionResponse, ProcessRunResponse } from '../../api/client';
import {
  dispatchDashboardDataRefresh,
  dispatchDashboardNotification,
  type RealtimeNotificationInput,
} from '../../features/dashboard/dashboardNotifications';

interface RealtimeToast extends RealtimeNotificationInput {
  id: number;
}

interface ProcessStatusEvent {
  runId: number;
  status: ProcessRunResponse['status'];
  message: string;
}

interface InspectionCreatedEvent {
  runId: number;
  serialNo: string;
  result: InspectionResponse['result'];
  confidence?: number | null;
  defectCount: number;
  message: string;
}

interface SseMessage {
  event: string;
  data: string;
}

export function RealtimeNotifications() {
  const [toasts, setToasts] = useState<RealtimeToast[]>([]);
  const toastIdRef = useRef(0);

  const pushNotification = useCallback((notification: RealtimeNotificationInput) => {
    const id = ++toastIdRef.current;

    dispatchDashboardNotification(notification);
    setToasts((current) => [{ id, ...notification }, ...current].slice(0, 4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, notification.tone === 'info' ? 3500 : 6500);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const handleProcessStatusEvent = useCallback((event: ProcessStatusEvent) => {
    dispatchDashboardDataRefresh();

    if (event.status === 'COMPLETED') {
      pushNotification({
        title: '공정 완료',
        message: event.message || '공정이 완료되었습니다.',
        detail: `RUN-${event.runId}`,
        tone: 'success',
      });
      return;
    }

    if (event.status === 'STOPPED') {
      pushNotification({
        title: '공정 중단',
        message: event.message || '사용자에 의해 공정이 중단되었습니다.',
        detail: `RUN-${event.runId}`,
        tone: 'warning',
      });
      return;
    }

    if (event.status === 'ERROR') {
      pushNotification({
        title: '공정 오류',
        message: event.message || '공정 오류가 발생했습니다.',
        detail: `RUN-${event.runId}`,
        tone: 'danger',
      });
    }
  }, [pushNotification]);

  const handleInspectionCreatedEvent = useCallback((event: InspectionCreatedEvent) => {
    dispatchDashboardDataRefresh();

    if (event.result === 'BAD') {
      pushNotification({
        title: '불량 감지',
        message: event.message || '불량이 감지되었습니다.',
        detail: `${event.serialNo} 중 ${event.defectCount}개 결함`,
        tone: 'danger',
      });
      return;
    }

    pushNotification({
      title: '검사 완료',
      message: event.serialNo,
      detail: event.confidence != null ? `신뢰도 ${(event.confidence * 100).toFixed(1)}%` : undefined,
      tone: 'info',
    });
  }, [pushNotification]);

  const handleSseMessage = useCallback((message: SseMessage) => {
    if (!message.data) return;

    try {
      if (message.event === 'process-status-changed') {
        handleProcessStatusEvent(JSON.parse(message.data) as ProcessStatusEvent);
      } else if (message.event === 'inspection-created') {
        handleInspectionCreatedEvent(JSON.parse(message.data) as InspectionCreatedEvent);
      }
    } catch (error) {
      console.error('Failed to parse SSE message:', error, message);
    }
  }, [handleInspectionCreatedEvent, handleProcessStatusEvent]);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    const controller = new AbortController();
    void connectSse(controller.signal, token, handleSseMessage);

    return () => controller.abort();
  }, [handleSseMessage]);

  return <RealtimeToastStack toasts={toasts} onRemove={removeToast} />;
}

async function connectSse(signal: AbortSignal, token: string, onMessage: (message: SseMessage) => void) {
  while (!signal.aborted) {
    try {
      await openSseStream(signal, token, onMessage);
    } catch (error) {
      if (!signal.aborted) {
        console.error('SSE connection error:', error);
      }
    }

    if (!signal.aborted) {
      await wait(2000, signal);
    }
  }
}

async function openSseStream(signal: AbortSignal, token: string, onMessage: (message: SseMessage) => void) {
  const response = await fetch(createApiUrl('/sse/stream'), {
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE connection failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || '';

    for (const rawEvent of events) {
      const message = parseSseMessage(rawEvent);
      if (message) onMessage(message);
    }
  }
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timeoutId = window.setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timeoutId);
      resolve();
    }, { once: true });
  });
}

function parseSseMessage(rawEvent: string): SseMessage | null {
  const lines = rawEvent.split(/\r?\n/);
  let event = 'message';
  const data: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data.push(line.slice(5).trimStart());
    }
  }

  if (data.length === 0) return null;

  return {
    event,
    data: data.join('\n'),
  };
}

function RealtimeToastStack({ toasts, onRemove }: { toasts: RealtimeToast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-5 top-5 z-50 flex w-[min(380px,calc(100vw-2.5rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <RealtimeToastCard key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function RealtimeToastCard({ toast, onRemove }: { toast: RealtimeToast; onRemove: (id: number) => void }) {
  const toneClass = {
    success: 'border-brand-success/60 bg-emerald-950/95 text-emerald-50 shadow-brand-success/10',
    warning: 'border-brand-warning/60 bg-amber-950/95 text-amber-50 shadow-brand-warning/10',
    danger: 'border-brand-danger/60 bg-rose-950/95 text-rose-50 shadow-brand-danger/10',
    info: 'border-brand-info/50 bg-sky-950/95 text-sky-50 shadow-brand-info/10',
  }[toast.tone];

  const icon = {
    success: <CheckCircle2 className="h-5 w-5 text-brand-success" />,
    warning: <AlertTriangle className="h-5 w-5 text-brand-warning" />,
    danger: <XCircle className="h-5 w-5 text-brand-danger" />,
    info: <CheckCircle2 className="h-5 w-5 text-brand-info" />,
  }[toast.tone];

  return (
    <div className={`rounded-lg border p-4 shadow-2xl backdrop-blur ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold leading-5">{toast.title}</p>
            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="shrink-0 rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 break-words text-sm leading-5 text-white/90">{toast.message}</p>
          {toast.detail && <p className="mt-2 break-words text-xs font-medium text-white/65">{toast.detail}</p>}
        </div>
      </div>
    </div>
  );
}
