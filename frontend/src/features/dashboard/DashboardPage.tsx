import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';
import type {
  ApiResponse,
  ControlCommandResponse,
  EnvironmentLogResponse,
  InspectionResponse,
  ProcessRunResponse,
} from '../../api/client';
import { IdleDashboard } from './IdleDashboard';
import { RunningDashboard } from './RunningDashboard';

export function DashboardPage() {
  const [processStatus, setProcessStatus] = useState<ProcessRunResponse | null>(null);
  const [environmentData, setEnvironmentData] = useState<EnvironmentLogResponse | null>(null);
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [currentProcessInspections, setCurrentProcessInspections] = useState<InspectionResponse[]>([]);
  const [commands, setCommands] = useState<ControlCommandResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCurrentProcess = useCallback(async () => {
    try {
      const processRes = await apiClient.get<ApiResponse<ProcessRunResponse | null>>('/process/current');
      return processRes.data.data || null;
    } catch (error) {
      console.error('Failed to fetch current process:', error);
      return null;
    }
  }, []);

  const fetchLatestEnvironment = useCallback(async () => {
    try {
      const envRes = await apiClient.get<ApiResponse<EnvironmentLogResponse | null>>('/logs/environment/latest');
      return envRes.data.data || null;
    } catch (error) {
      console.error('Failed to fetch latest environment:', error);
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
      const [process, environment, inspectionRes, latestCommands] = await Promise.all([
        fetchCurrentProcess(),
        fetchLatestEnvironment(),
        apiClient.get<ApiResponse<InspectionResponse[]>>('/inspections/recent', { params: { limit: 20 } }),
        fetchRecentCommands(),
      ]);
      const currentInspectionRes = process?.runId
        ? await apiClient.get<ApiResponse<InspectionResponse[]>>(`/process/${process.runId}/inspections`)
        : null;

      setProcessStatus(process);
      setEnvironmentData(environment);
      setInspections(inspectionRes.data.data || []);
      setCurrentProcessInspections(currentInspectionRes?.data.data || []);
      setCommands(latestCommands);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (showRefreshIndicator) setRefreshing(false);
    }
  }, [fetchCurrentProcess, fetchLatestEnvironment, fetchRecentCommands]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

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
    environmentData,
    inspections,
    loading,
    onStartProcess: startProcess,
    onStopProcess: stopProcess,
    processStatus,
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-textMain">공정 관제</h1>
          <p className="mt-1 text-sm text-brand-textSub">진행 중인 공정의 상태와 검사 흐름을 먼저 보고, 공정을 제어합니다.</p>
        </div>
        <button
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-textSub hover:text-brand-textMain disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {isRunning ? <RunningDashboard {...dashboardProps} /> : <IdleDashboard {...dashboardProps} />}
    </div>
  );
}
