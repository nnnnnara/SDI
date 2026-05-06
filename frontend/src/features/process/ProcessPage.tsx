import { useCallback, useEffect, useState } from 'react';
import { Play, RefreshCw, Settings, Square } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, ControlCommandResponse, ProcessRunResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime } from '../../utils/format';

function statusVariant(status?: string) {
  if (status === 'RUNNING' || status === 'SUCCESS' || status === 'SENT') return 'success';
  if (status === 'ERROR' || status === 'FAILED') return 'danger';
  if (status === 'REQUESTED') return 'warning';
  return 'default';
}

export function ProcessPage() {
  const [currentRun, setCurrentRun] = useState<ProcessRunResponse | null>(null);
  const [commands, setCommands] = useState<ControlCommandResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isRunning = currentRun?.status === 'RUNNING';

  const fetchCurrentRun = useCallback(async () => {
    try {
      const runRes = await apiClient.get<ApiResponse<ProcessRunResponse | null>>('/process/current');
      return runRes.data.data || null;
    } catch {
      return null;
    }
  }, []);

  const fetchCommands = useCallback(async () => {
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

  const fetchData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);

    try {
      const [run, latestCommands] = await Promise.all([fetchCurrentRun(), fetchCommands()]);
      setCurrentRun(run);
      setCommands(latestCommands);
    } finally {
      if (showRefreshIndicator) setRefreshing(false);
    }
  }, [fetchCommands, fetchCurrentRun]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const startProcess = async () => {
    try {
      setLoading(true);
      await apiClient.post('/process/start');
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const stopProcess = async () => {
    if (!currentRun?.runId) return;
    try {
      setLoading(true);
      await apiClient.post(`/process/${currentRun.runId}/stop`, { stopReason: 'USER_STOP' });
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-textMain">공정 제어</h1>
          <p className="mt-1 text-sm text-brand-textSub">현재 공정 상태를 확인하고 시작/정지 명령을 전송합니다.</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-textSub hover:text-brand-textMain disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 새로고침
        </button>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle><Settings className="w-5 h-5 text-brand-primary" /> 현재 공정</CardTitle>
            <Badge variant={statusVariant(currentRun?.status)}>{currentRun?.status ?? 'NONE'}</Badge>
          </CardHeader>
          <CardContent className="gap-5">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-textSub">Run ID</dt>
                <dd className="font-mono text-brand-textMain">{currentRun?.runId ? `RUN-${currentRun.runId}` : '-'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-textSub">시작 시간</dt>
                <dd className="text-brand-textMain">{formatDateTime(currentRun?.startedAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-textSub">종료 시간</dt>
                <dd className="text-brand-textMain">{formatDateTime(currentRun?.endedAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-textSub">시작자</dt>
                <dd className="text-brand-textMain">{currentRun?.startedBy?.name ?? '-'}</dd>
              </div>
            </dl>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={startProcess}
                disabled={isRunning || loading}
                className="inline-flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-brand-success/30 bg-brand-success/10 text-brand-success disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play className="w-7 h-7" />
                <span className="font-bold">시작</span>
              </button>
              <button
                onClick={stopProcess}
                disabled={!isRunning || loading}
                className="inline-flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-brand-danger/30 bg-brand-danger/10 text-brand-danger disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Square className="w-7 h-7" />
                <span className="font-bold">정지</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>최근 제어 명령</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                  <tr>
                    <th className="px-5 py-3 font-medium">명령 ID</th>
                    <th className="px-5 py-3 font-medium">Run ID</th>
                    <th className="px-5 py-3 font-medium">명령</th>
                    <th className="px-5 py-3 font-medium">상태</th>
                    <th className="px-5 py-3 font-medium">요청 시간</th>
                    <th className="px-5 py-3 font-medium">요청자</th>
                  </tr>
                </thead>
                <tbody>
                  {commands.map((command) => (
                    <tr key={command.commandId} className="border-t border-brand-border/60">
                      <td className="px-5 py-3 font-mono text-brand-textMain">{command.commandId}</td>
                      <td className="px-5 py-3 text-brand-textSub">
                        {command.runId ? (
                          <Link className="text-brand-primary hover:underline" to={`/history/${command.runId}`}>
                            RUN-{command.runId}
                          </Link>
                        ) : '-'}
                      </td>
                      <td className="px-5 py-3 text-brand-textMain">{command.commandType}</td>
                      <td className="px-5 py-3"><Badge variant={statusVariant(command.commandStatus)}>{command.commandStatus}</Badge></td>
                      <td className="px-5 py-3 text-brand-textSub">{formatDateTime(command.issuedAt)}</td>
                      <td className="px-5 py-3 text-brand-textMain">{command.user?.name ?? '-'}</td>
                    </tr>
                  ))}
                  {commands.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-brand-textSub" colSpan={6}>최근 제어 명령이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
