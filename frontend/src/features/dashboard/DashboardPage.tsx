import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';
import type {
  ApiResponse,
  InspectionResponse,
  ProcessRunResponse,
} from '../../api/client';
import { PageHeader } from '../../components/common/PageHeader';
import { IdleDashboard } from './IdleDashboard';
import { RunningDashboard } from './RunningDashboard';
import { DASHBOARD_DATA_REFRESH_EVENT } from './dashboardNotifications';

export function DashboardPage() {
  const [processStatus, setProcessStatus] = useState<ProcessRunResponse | null>(null);
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [currentProcessInspections, setCurrentProcessInspections] = useState<InspectionResponse[]>([]);
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

  const loadDashboardData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);

    try {
      const [process, inspectionRes] = await Promise.all([
        fetchCurrentProcess(),
        apiClient.get<ApiResponse<InspectionResponse[]>>('/inspections/recent', { params: { limit: 20 } }),
      ]);
      const currentInspectionRes = process?.runId
        ? await apiClient.get<ApiResponse<InspectionResponse[]>>(`/process/${process.runId}/inspections`)
        : null;

      setProcessStatus(process);
      setInspections(inspectionRes.data.data || []);
      setCurrentProcessInspections(currentInspectionRes?.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (showRefreshIndicator) setRefreshing(false);
    }
  }, [fetchCurrentProcess]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const handleRefresh = () => {
      window.setTimeout(() => {
        void loadDashboardData();
      }, 300);
    };

    window.addEventListener(DASHBOARD_DATA_REFRESH_EVENT, handleRefresh);
    return () => window.removeEventListener(DASHBOARD_DATA_REFRESH_EVENT, handleRefresh);
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
    currentProcessInspections,
    inspections,
    loading,
    onStartProcess: startProcess,
    onStopProcess: stopProcess,
    processStatus,
  };

  return (
    <div className="relative p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="공정 대시보드"
          description="실시간 공정 상태와 검사 결과를 확인합니다."
        />
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
