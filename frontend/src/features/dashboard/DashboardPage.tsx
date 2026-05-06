import { useCallback, useEffect, useState } from 'react';
import { Activity, ClipboardCheck, Gauge, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../api/client';
import type {
  ApiResponse,
  EnvironmentLogResponse,
  InspectionResponse,
  ProcessRunResponse,
} from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime, formatNumber } from '../../utils/format';
import { DashboardMetric } from './components/DashboardMetric';

export function DashboardPage() {
  const [processStatus, setProcessStatus] = useState<ProcessRunResponse | null>(null);
  const [environmentData, setEnvironmentData] = useState<EnvironmentLogResponse | null>(null);
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);

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

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      try {
        const [process, environment, inspRes] = await Promise.all([
          fetchCurrentProcess(),
          fetchLatestEnvironment(),
          apiClient.get<ApiResponse<InspectionResponse[]>>('/inspections/recent', { params: { limit: 20 } }),
        ]);

        if (ignore) return;

        setProcessStatus(process);
        setEnvironmentData(environment);
        setInspections(inspRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    }

    void loadDashboardData();

    return () => {
      ignore = true;
    };
  }, [fetchCurrentProcess, fetchLatestEnvironment]);

  const totalInspections = inspections.length;
  const defects = inspections.filter((item) => item.result === 'BAD').length;
  const defectRate = totalInspections > 0 ? (defects / totalInspections) * 100 : 0;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">대시보드</h1>
        <p className="mt-1 text-sm text-brand-textSub">공정 상태, 검사 결과, 현재 환경 값을 한눈에 확인합니다.</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardMetric
          label="현재 공정"
          value={
            <span className="flex flex-wrap items-center gap-2">
              {processStatus?.status ?? 'NONE'}
              <Badge variant={processStatus?.status === 'RUNNING' ? 'success' : 'default'}>
                {processStatus?.status === 'RUNNING' ? '진행 중' : '대기'}
              </Badge>
            </span>
          }
          helper={processStatus?.runId ? `RUN-${processStatus.runId}` : '진행 중인 공정이 없습니다.'}
          icon={<Activity className="w-6 h-6" />}
        />
        <DashboardMetric
          label="최근 검사"
          value={`${totalInspections.toLocaleString()}건`}
          helper={`불량 ${defects.toLocaleString()}건`}
          icon={<ClipboardCheck className="w-6 h-6" />}
        />
        <DashboardMetric
          label="환경 상태"
          value={environmentData ? `${formatNumber(environmentData.temperature)} C` : '-'}
          helper={environmentData ? `습도 ${formatNumber(environmentData.humidity)}%` : '진행 중인 공정의 환경 로그가 없습니다.'}
          icon={<Gauge className="w-6 h-6" />}
        />
        <DashboardMetric
          label="불량률"
          value={totalInspections > 0 ? `${formatNumber(defectRate)}%` : '-'}
          helper="최근 검사 기준"
          icon={<ShieldCheck className="w-6 h-6" />}
        />
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle><ClipboardCheck className="w-5 h-5 text-brand-success" /> 최근 검사 결과</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">S/N</th>
                  <th className="px-5 py-3 font-medium">결과</th>
                  <th className="px-5 py-3 font-medium">검사 시간</th>
                </tr>
              </thead>
              <tbody>
                {inspections.slice(0, 5).map((item) => (
                  <tr key={item.inspectionId} className="border-t border-brand-border/60">
                    <td className="px-5 py-3 text-brand-textMain">{item.serialNo}</td>
                    <td className="px-5 py-3">
                      <Badge variant={item.result === 'GOOD' ? 'success' : 'danger'}>{item.result}</Badge>
                    </td>
                    <td className="px-5 py-3 text-brand-textSub">{formatDateTime(item.inspectedAt)}</td>
                  </tr>
                ))}
                {inspections.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={3}>
                      최근 검사 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
