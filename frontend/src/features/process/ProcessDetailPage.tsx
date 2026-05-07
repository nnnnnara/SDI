import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardCheck, Gauge } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, EnvironmentLogResponse, InspectionResponse, ProcessRunResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime, formatNumber } from '../../utils/format';
import { inspectionResultClass, inspectionResultLabel } from '../inspection/inspectionUtils';

function statusVariant(status?: string) {
  if (status === 'RUNNING' || status === 'GOOD') return 'success';
  if (status === 'ERROR' || status === 'BAD') return 'danger';
  if (status === 'STOPPED') return 'warning';
  return 'default';
}

export function ProcessDetailPage() {
  const navigate = useNavigate();
  const { runId } = useParams();
  const [run, setRun] = useState<ProcessRunResponse | null>(null);
  const [environmentLogs, setEnvironmentLogs] = useState<EnvironmentLogResponse[]>([]);
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);

  useEffect(() => {
    if (!runId) return;

    Promise.all([
      apiClient.get<ApiResponse<ProcessRunResponse>>(`/process/${runId}`),
      apiClient.get<ApiResponse<EnvironmentLogResponse[]>>(`/process/${runId}/environment`),
      apiClient.get<ApiResponse<InspectionResponse[]>>(`/process/${runId}/inspections`),
    ])
      .then(([runRes, envRes, inspectionRes]) => {
        setRun(runRes.data.data || null);
        setEnvironmentLogs(envRes.data.data || []);
        setInspections(inspectionRes.data.data || []);
      })
      .catch((error) => console.error('Failed to fetch process detail:', error));
  }, [runId]);

  const latestEnvironment = useMemo(() => environmentLogs.at(-1), [environmentLogs]);

  const goToInspection = (inspectionId: number) => {
    navigate(`/inspection/${inspectionId}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/history" className="inline-flex items-center gap-1 text-sm text-brand-textSub hover:text-brand-primary">
            <ArrowLeft className="w-4 h-4" /> 공정 이력
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-brand-textMain">RUN-{runId} 상세</h1>
          <p className="mt-1 text-sm text-brand-textSub">공정의 종료 맥락, 환경 상태, 검사 결과를 연결해 원인 확인에 필요한 단서를 모읍니다.</p>
        </div>
        <Badge variant={statusVariant(run?.status)}>{run?.status ?? '-'}</Badge>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>공정 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-brand-textSub">시작 시간</dt>
                <dd className="mt-1 text-brand-textMain">{formatDateTime(run?.startedAt)}</dd>
              </div>
              <div>
                <dt className="text-brand-textSub">종료 시간</dt>
                <dd className="mt-1 text-brand-textMain">{formatDateTime(run?.endedAt)}</dd>
              </div>
              <div>
                <dt className="text-brand-textSub">시작자</dt>
                <dd className="mt-1 text-brand-textMain">{run?.startedBy?.name ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-brand-textSub">정지 사유</dt>
                <dd className="mt-1 text-brand-textMain">{run?.stopReason ?? '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><Gauge className="w-5 h-5 text-brand-info" /> 환경 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-brand-textSub">온도</dt><dd>{formatNumber(latestEnvironment?.temperature)} C</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-brand-textSub">습도</dt><dd>{formatNumber(latestEnvironment?.humidity)}%</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-brand-textSub">PM2.5</dt><dd>{formatNumber(latestEnvironment?.pm25)} ug/m3</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-brand-textSub">PM10</dt><dd>{formatNumber(latestEnvironment?.pm10)} ug/m3</dd></div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><ClipboardCheck className="w-5 h-5 text-brand-success" /> 검사</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-textMain">{inspections.length.toLocaleString()}</div>
            <p className="mt-2 text-sm text-brand-textSub">이 공정에서 생성된 검사 결과</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>검사 결과</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">검사 ID</th>
                  <th className="px-5 py-3 font-medium">S/N</th>
                  <th className="px-5 py-3 font-medium">검사 결과</th>
                  <th className="px-5 py-3 font-medium">신뢰도</th>
                  <th className="px-5 py-3 font-medium">검사 시간</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((inspection) => (
                  <tr
                    key={inspection.inspectionId}
                    className="cursor-pointer border-t border-brand-border/60 transition-colors hover:bg-brand-background/60 focus:bg-brand-background/60 focus:outline-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => goToInspection(inspection.inspectionId)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        goToInspection(inspection.inspectionId);
                      }
                    }}
                  >
                    <td className="px-5 py-3 font-mono text-brand-textMain">{inspection.inspectionId}</td>
                    <td className="px-5 py-3 text-brand-textSub">{inspection.serialNo}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex min-w-14 justify-center rounded-md border px-2.5 py-1 text-xs font-bold ${inspectionResultClass(inspection.result)}`}>
                        {inspectionResultLabel(inspection.result)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-textMain">{formatNumber(Number(inspection.confidence) * 100)}%</td>
                    <td className="px-5 py-3 text-brand-textSub">{formatDateTime(inspection.inspectedAt)}</td>
                  </tr>
                ))}
                {inspections.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={5}>생성된 검사 결과가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
