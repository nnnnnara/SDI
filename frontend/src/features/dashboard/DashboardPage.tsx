import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, X, XCircle } from 'lucide-react';
import { apiClient, createApiUrl } from '../../api/client';
import type {
  ApiResponse,
  ControlCommandResponse,
  InspectionResponse,
  ProcessRunResponse,
} from '../../api/client';
import { PageHeader } from '../../components/common/PageHeader';
import { IdleDashboard } from './IdleDashboard';
import { RunningDashboard } from './RunningDashboard';

type RealtimeToastTone = 'success' | 'warning' | 'danger' | 'info';

interface RealtimeToast {
  id: number;
  title: string;
  message: string;
  tone: RealtimeToastTone;
  detail?: string;
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

export function DashboardPage() {
  const [processStatus, setProcessStatus] = useState<ProcessRunResponse | null>(null);
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [currentProcessInspections, setCurrentProcessInspections] = useState<InspectionResponse[]>([]);
  const [commands, setCommands] = useState<ControlCommandResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toasts, setToasts] = useState<RealtimeToast[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((toast: Omit<RealtimeToast, 'id'>) => {
    const id = ++toastIdRef.current;

    setToasts((current) => [{ id, ...toast }, ...current].slice(0, 4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, toast.tone === 'info' ? 3500 : 6500);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const fetchCurrentProcess = useCallback(async () => {
    try {
      const processRes = await apiClient.get<ApiResponse<ProcessRunResponse | null>>('/process/current');
      return processRes.data.data || null;
    } catch (error) {
      console.error('Failed to fetch current process:', error);
      return null;
    }
  }, []);

  const fetchRecentCommands = useCallback(async () => {
    try {
      const commandRes = await apiClient.get<ApiResponse<ControlCommandResponse[]>>('/commands/recent', {
        params: { limit: 8 },
      });
      return commandRes.data.data || [];
    } catch (error) {
      console.error('Failed to fetch control commands:', error);
      return [];
    }
  }, []);

  const loadDashboardData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);

    try {
      const [process, inspectionRes, latestCommands] = await Promise.all([
        fetchCurrentProcess(),
        apiClient.get<ApiResponse<InspectionResponse[]>>('/inspections/recent', { params: { limit: 20 } }),
        fetchRecentCommands(),
      ]);
      const currentInspectionRes = process?.runId
        ? await apiClient.get<ApiResponse<InspectionResponse[]>>(`/process/${process.runId}/inspections`)
        : null;

      setProcessStatus(process);
      setInspections(inspectionRes.data.data || []);
      setCurrentProcessInspections(currentInspectionRes?.data.data || []);
      setCommands(latestCommands);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (showRefreshIndicator) setRefreshing(false);
    }
  }, [fetchCurrentProcess, fetchRecentCommands]);

  const handleProcessStatusEvent = useCallback((event: ProcessStatusEvent) => {
    if (event.status === 'COMPLETED' || event.status === 'STOPPED' || event.status === 'ERROR') {
      setProcessStatus(null);
      setCurrentProcessInspections([]);
    }

    window.setTimeout(() => {
      void loadDashboardData();
    }, 300);

    if (event.status === 'COMPLETED') {
      pushToast({
        title: '\uacf5\uc815 \uc644\ub8cc',
        message: event.message || '\uacf5\uc815\uc774 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
        detail: `RUN-${event.runId}`,
        tone: 'success',
      });
      return;
    }

    if (event.status === 'STOPPED') {
      pushToast({
        title: '\uacf5\uc815 \uc911\ub2e8',
        message: event.message || '\uc0ac\uc6a9\uc790\uc5d0 \uc758\ud574 \uacf5\uc815\uc774 \uc911\ub2e8\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
        detail: `RUN-${event.runId}`,
        tone: 'warning',
      });
      return;
    }

    if (event.status === 'ERROR') {
      pushToast({
        title: '\uacf5\uc815 \uc624\ub958',
        message: event.message || '\uacf5\uc815 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.',
        detail: `RUN-${event.runId}`,
        tone: 'danger',
      });
    }
  }, [loadDashboardData, pushToast]);

  const handleInspectionCreatedEvent = useCallback((event: InspectionCreatedEvent) => {
    void loadDashboardData();

    if (event.result === 'BAD') {
      pushToast({
        title: '\ubd88\ub7c9 \uac10\uc9c0',
        message: event.message || '\ubd88\ub7c9\uc774 \uac10\uc9c0\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
        detail: `${event.serialNo} · ${event.defectCount}\uac1c \uacb0\ud568`,
        tone: 'danger',
      });
      return;
    }

    pushToast({
      title: '\uac80\uc0ac \uc644\ub8cc',
      message: event.serialNo,
      detail: event.confidence != null ? `confidence ${(event.confidence * 100).toFixed(1)}%` : undefined,
      tone: 'info',
    });
  }, [loadDashboardData, pushToast]);

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
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    const controller = new AbortController();
    void connectSse(controller.signal, token, handleSseMessage);

    return () => controller.abort();
  }, [handleSseMessage]);

  const startProcess = async () => {
    try {
      setLoading(true);
      await apiClient.post('/process/start');
      await loadDashboardData();
    } finally {
      setLoading(false);
    }
  };

  const stopProcess = async () => {
    if (!processStatus?.runId) return;

    try {
      setLoading(true);
      await apiClient.post(`/process/${processStatus.runId}/stop`, { stopReason: 'USER_STOP' });
      await loadDashboardData();
    } finally {
      setLoading(false);
    }
  };

  const isRunning = processStatus?.status === 'RUNNING';
  const dashboardProps = {
    commands,
    currentProcessInspections,
    inspections,
    loading,
    onStartProcess: startProcess,
    onStopProcess: stopProcess,
    processStatus,
  };

  return (
    <div className="relative p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      <RealtimeToastStack toasts={toasts} onRemove={removeToast} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title={'\uacf5\uc815 \ub300\uc2dc\ubcf4\ub4dc'}
          description={'\uc2e4\uc2dc\uac04 \uacf5\uc815 \uc0c1\ud0dc\uc640 \uac80\uc0ac \uacb0\uacfc\ub97c \ud655\uc778\ud569\ub2c8\ub2e4.'}
        />
        <button
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-textSub hover:text-brand-textMain disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {'\uc0c8\ub85c\uace0\uce68'}
        </button>
      </div>

      {isRunning ? <RunningDashboard {...dashboardProps} /> : <IdleDashboard {...dashboardProps} />}
    </div>
  );
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
