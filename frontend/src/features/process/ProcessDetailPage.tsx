import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardCheck, Gauge, PackageSearch, Terminal } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type {
  ApiResponse,
  EnvironmentLogResponse,
  InspectionResponse,
  PageResponse,
  ProcessRunResponse,
  SystemLogResponse,
} from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTime, formatNumber, formatPercent } from '../../utils/format';
import { defectTypeSummary, inspectionResultClass, inspectionResultLabel } from '../inspection/inspectionUtils';
import { processStatusDisplay, processStatusVariant, stopReasonDisplay } from './processUtils';

const SYSTEM_LOG_LOOKUP_SIZE = 100;
const SECTION_PAGE_SIZE = 5;

export function ProcessDetailPage() {
  const navigate = useNavigate();
  const { runId } = useParams();
  const [run, setRun] = useState<ProcessRunResponse | null>(null);
  const [environmentLogs, setEnvironmentLogs] = useState<EnvironmentLogResponse[]>([]);
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLogResponse[]>([]);
  const [inspectionPage, setInspectionPage] = useState(0);
  const [environmentPage, setEnvironmentPage] = useState(0);
  const [systemLogPage, setSystemLogPage] = useState(0);

  useEffect(() => {
    if (!runId) return;

    Promise.all([
      apiClient.get<ApiResponse<ProcessRunResponse>>(`/process/${runId}`),
      apiClient.get<ApiResponse<EnvironmentLogResponse[]>>(`/process/${runId}/environment`),
      apiClient.get<ApiResponse<InspectionResponse[]>>(`/process/${runId}/inspections`),
      apiClient.get<ApiResponse<PageResponse<SystemLogResponse>>>('/logs/system', {
        params: { page: 0, size: SYSTEM_LOG_LOOKUP_SIZE },
      }),
    ])
      .then(([runRes, envRes, inspectionRes, systemLogRes]) => {
        setRun(runRes.data.data || null);
        setEnvironmentLogs(envRes.data.data || []);
        setInspections(inspectionRes.data.data || []);
        setSystemLogs((systemLogRes.data.data?.content || []).filter((log) => log.runId === Number(runId)));
        setInspectionPage(0);
        setEnvironmentPage(0);
        setSystemLogPage(0);
      })
      .catch((error) => console.error('Failed to fetch process detail:', error));
  }, [runId]);

  const latestEnvironment = useMemo(() => environmentLogs.at(-1), [environmentLogs]);
  const defectCount = useMemo(
    () => inspections.reduce((total, inspection) => total + inspection.defects.length, 0),
    [inspections]
  );
  const badInspectionCount = useMemo(
    () => inspections.filter((inspection) => inspection.result === 'BAD').length,
    [inspections]
  );
  const inspectionTotalPages = getTotalPages(inspections.length);
  const environmentTotalPages = getTotalPages(environmentLogs.length);
  const systemLogTotalPages = getTotalPages(systemLogs.length);
  const visibleInspections = getPageItems(inspections, inspectionPage);
  const visibleEnvironmentLogs = getPageItems(environmentLogs, environmentPage);
  const visibleSystemLogs = getPageItems(systemLogs, systemLogPage);

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
          <h1 className="mt-2 text-2xl font-bold text-brand-textMain">RUN-{runId} 공정 리포트</h1>
          <p className="mt-1 text-sm text-brand-textSub">
            하나의 공정에 투입된 제품, 각 제품의 검사 결과, 결함, 환경 로그와 시스템 로그를 함께 확인합니다.
          </p>
        </div>
        <Badge variant={processStatusVariant(run?.status)}>{processStatusDisplay(run?.status)}</Badge>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>공정 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoItem label="시작 시간" value={formatDateTime(run?.startedAt)} />
              <InfoItem label="종료 시간" value={formatDateTime(run?.endedAt)} />
              <InfoItem label="시작자" value={run?.startedBy?.name ?? '-'} />
              <InfoItem label="정지 사유" value={stopReasonDisplay(run?.stopReason, run?.status)} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><Gauge className="w-5 h-5 text-brand-info" /> 최근 환경</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <StatRow label="온도" value={`${formatNumber(latestEnvironment?.temperature)} C`} />
              <StatRow label="습도" value={`${formatNumber(latestEnvironment?.humidity)}%`} />
              <StatRow label="PM2.5" value={`${formatNumber(latestEnvironment?.pm25)} ug/m3`} />
              <StatRow label="PM10" value={`${formatNumber(latestEnvironment?.pm10)} ug/m3`} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><PackageSearch className="w-5 h-5 text-brand-success" /> 제품/검사</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <MetricValue label="제품" value={inspections.length} />
              <MetricValue label="불량" value={badInspectionCount} />
              <MetricValue label="결함" value={defectCount} />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle><ClipboardCheck className="w-5 h-5 text-brand-success" /> 제품별 검사 결과</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">제품 S/N</th>
                  <th className="px-5 py-3 font-medium">검사 ID</th>
                  <th className="px-5 py-3 font-medium">판정</th>
                  <th className="px-5 py-3 font-medium">신뢰도</th>
                  <th className="px-5 py-3 font-medium">결함 유형</th>
                  <th className="px-5 py-3 font-medium">결함 수</th>
                  <th className="px-5 py-3 font-medium">검사 시간</th>
                </tr>
              </thead>
              <tbody>
                {visibleInspections.map((inspection) => (
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
                    <td className="px-5 py-3 font-mono text-brand-textMain">{inspection.serialNo}</td>
                    <td className="px-5 py-3 text-brand-textSub">{inspection.inspectionId}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex min-w-14 justify-center rounded-md border px-2.5 py-1 text-xs font-bold ${inspectionResultClass(inspection.result)}`}>
                        {inspectionResultLabel(inspection.result)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-textMain">{formatPercent(inspection.confidence)}</td>
                    <td className="px-5 py-3 text-brand-textMain">{defectTypeSummary(inspection.defects)}</td>
                    <td className="px-5 py-3 text-brand-textSub">{inspection.defects.length.toLocaleString()}건</td>
                    <td className="px-5 py-3 text-brand-textSub">{formatDateTime(inspection.inspectedAt)}</td>
                  </tr>
                ))}
                {inspections.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={7}>이 공정에 연결된 제품 검사 결과가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {inspections.length > SECTION_PAGE_SIZE && (
            <Pagination
              loading={false}
              page={inspectionPage}
              pageSize={SECTION_PAGE_SIZE}
              setPage={setInspectionPage}
              totalPages={inspectionTotalPages}
            />
          )}
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle><Gauge className="w-5 h-5 text-brand-info" /> 공정 환경 로그</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="w-[22%] px-5 py-3 font-medium">측정 시간</th>
                  <th className="w-[19.5%] px-4 py-3 font-medium">온도</th>
                  <th className="w-[19.5%] px-4 py-3 font-medium">습도</th>
                  <th className="w-[19.5%] px-4 py-3 font-medium">PM2.5</th>
                  <th className="w-[19.5%] px-4 py-3 font-medium">PM10</th>
                </tr>
              </thead>
              <tbody>
                {visibleEnvironmentLogs.map((log, index) => {
                  const previous = environmentLogs[environmentPage * SECTION_PAGE_SIZE + index - 1];

                  return (
                    <tr key={log.envLogId} className="border-t border-brand-border/60">
                      <td className="px-5 py-3 text-brand-textSub">{formatDateTime(log.measuredAt)}</td>
                      <TrendValue value={log.temperature} previous={previous?.temperature} unit="C" />
                      <TrendValue value={log.humidity} previous={previous?.humidity} unit="%" />
                      <TrendValue value={log.pm25} previous={previous?.pm25} unit="ug/m3" />
                      <TrendValue value={log.pm10} previous={previous?.pm10} unit="ug/m3" />
                    </tr>
                  );
                })}
                {environmentLogs.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={5}>이 공정에 연결된 환경 로그가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {environmentLogs.length > SECTION_PAGE_SIZE && (
              <Pagination
                loading={false}
                page={environmentPage}
                pageSize={SECTION_PAGE_SIZE}
                setPage={setEnvironmentPage}
                totalPages={environmentTotalPages}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><Terminal className="w-5 h-5 text-brand-warning" /> 공정 시스템 로그</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                  <tr>
                    <th className="w-44 px-5 py-3 font-medium">시간</th>
                    <th className="w-32 px-5 py-3 font-medium">레벨</th>
                    <th className="w-44 px-5 py-3 font-medium">소스</th>
                    <th className="px-5 py-3 font-medium">메시지</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSystemLogs.map((log) => (
                    <tr key={log.logId} className="border-t border-brand-border/60 align-middle">
                      <td className="px-5 py-3 align-middle whitespace-nowrap text-brand-textSub">{formatDateTime(log.createdAt)}</td>
                      <td className="px-5 py-3 align-middle">
                        <Badge variant={systemLogVariant(log.level)}>{log.level}</Badge>
                      </td>
                      <td className="px-5 py-3 align-middle whitespace-nowrap text-brand-textSub">{log.source}</td>
                      <td className="px-5 py-3 align-top leading-relaxed text-brand-textMain break-words">{log.message}</td>
                    </tr>
                  ))}
                  {systemLogs.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-brand-textSub" colSpan={4}>이 공정에 연결된 시스템 로그가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {systemLogs.length > SECTION_PAGE_SIZE && (
              <Pagination
                loading={false}
                page={systemLogPage}
                pageSize={SECTION_PAGE_SIZE}
                setPage={setSystemLogPage}
                totalPages={systemLogTotalPages}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-brand-textSub">{label}</dt>
      <dd className="mt-1 text-brand-textMain">{value}</dd>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-brand-textSub">{label}</dt>
      <dd className="text-brand-textMain">{value}</dd>
    </div>
  );
}

function MetricValue({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-bold text-brand-textMain">{value.toLocaleString()}</div>
      <div className="mt-1 text-xs text-brand-textSub">{label}</div>
    </div>
  );
}

function systemLogVariant(level: SystemLogResponse['level']) {
  if (level === 'ERROR') return 'danger';
  if (level === 'WARN') return 'warning';
  return 'info';
}

function TrendValue({ value, previous, unit }: { value?: number | null; previous?: number | null; unit: string }) {
  const trendInfo = trend(value, previous);

  return (
    <td className="px-4 py-3 text-brand-textMain">
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span>{formatNumber(value)} {unit}</span>
        {trendInfo && (
          <span className={`text-xs font-semibold leading-none ${trendInfo.className}`} title={`이전 측정 대비 ${formatNumber(Math.abs(trendInfo.diff))} ${unit}`}>
            {trendInfo.symbol}
          </span>
        )}
      </span>
    </td>
  );
}

function trend(current?: number | null, previous?: number | null) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  const diff = Number(current) - Number(previous);
  if (Math.abs(diff) < 0.05) return { symbol: '-', className: 'text-brand-textSub', diff };
  if (diff > 0) return { symbol: '▲', className: 'text-brand-danger', diff };
  return { symbol: '▼', className: 'text-brand-info', diff };
}

function getTotalPages(itemCount: number) {
  return Math.ceil(itemCount / SECTION_PAGE_SIZE);
}

function getPageItems<T>(items: T[], page: number) {
  const start = page * SECTION_PAGE_SIZE;
  return items.slice(start, start + SECTION_PAGE_SIZE);
}
