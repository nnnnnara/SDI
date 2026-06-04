import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardCheck, PackageSearch, Terminal } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type {
  ApiResponse,
  InspectionResponse,
  PageResponse,
  ProcessRunResponse,
  SystemLogResponse,
} from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTime, formatPercent } from '../../utils/format';
import { defectTypeSummary, inspectionResultClass, inspectionResultLabel } from '../inspection/inspectionUtils';
import { processStatusDisplay, processStatusVariant, stopReasonDisplay } from './processUtils';

const SECTION_PAGE_SIZE = 5;
const SYSTEM_LOG_LOOKUP_SIZE = 100;

export function ProcessDetailPage() {
  const navigate = useNavigate();
  const { runId } = useParams();
  const [run, setRun] = useState<ProcessRunResponse | null>(null);
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLogResponse[]>([]);
  const [inspectionPage, setInspectionPage] = useState(0);
  const [systemLogPage, setSystemLogPage] = useState(0);

  useEffect(() => {
    if (!runId) return;

    Promise.all([
      apiClient.get<ApiResponse<ProcessRunResponse>>(`/process/${runId}`),
      apiClient.get<ApiResponse<InspectionResponse[]>>(`/process/${runId}/inspections`),
      apiClient.get<ApiResponse<PageResponse<SystemLogResponse>>>('/logs/system', {
        params: { page: 0, size: SYSTEM_LOG_LOOKUP_SIZE },
      }),
    ])
      .then(([runRes, inspectionRes, systemLogRes]) => {
        setRun(runRes.data.data || null);
        setInspections(inspectionRes.data.data || []);
        setSystemLogs((systemLogRes.data.data?.content || []).filter((log) => log.runId === Number(runId)));
        setInspectionPage(0);
        setSystemLogPage(0);
      })
      .catch((error) => console.error('Failed to fetch process detail:', error));
  }, [runId]);

  const defectCount = useMemo(() => inspections.reduce((total, item) => total + item.defects.length, 0), [inspections]);
  const badInspectionCount = useMemo(() => inspections.filter((item) => item.result === 'BAD').length, [inspections]);

  const visibleInspections = getPageItems(inspections, inspectionPage);
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
          <h1 className="mt-2 text-2xl font-bold text-brand-textMain">RUN-{runId} 공정 상세</h1>
          <p className="mt-1 text-sm text-brand-textSub">
            하나의 공정에 투입된 제품, 검사 결과, 결함, 시스템 로그를 함께 확인합니다.
          </p>
        </div>
        <Badge variant={processStatusVariant(run?.status)}>{processStatusDisplay(run?.status)}</Badge>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>공정 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoItem label="시작 시간" value={formatDateTime(run?.startedAt)} />
              <InfoItem label="종료 시간" value={formatDateTime(run?.endedAt)} />
              <InfoItem label="시작자" value={run?.startedBy?.name ?? '-'} />
              <InfoItem label="중지 사유" value={stopReasonDisplay(run?.stopReason, run?.status)} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><PackageSearch className="w-5 h-5 text-brand-success" /> 제품/검사</CardTitle>
          </CardHeader>
          <CardContent className="justify-center">
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
                  <th className="px-5 py-3 font-medium">결과</th>
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
                    <td className="px-5 py-3 text-brand-textSub">{inspection.defects.length.toLocaleString()}개</td>
                    <td className="px-5 py-3 text-brand-textSub">{formatDateTime(inspection.inspectedAt)}</td>
                  </tr>
                ))}
                {inspections.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={7}>이 공정에 연결된 검사 결과가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {inspections.length > SECTION_PAGE_SIZE && (
            <Pagination loading={false} page={inspectionPage} pageSize={SECTION_PAGE_SIZE} setPage={setInspectionPage} totalPages={getTotalPages(inspections.length)} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle><Terminal className="w-5 h-5 text-brand-warning" /> 공정 시스템 로그</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="w-[22%] px-5 py-3 font-medium">시간</th>
                  <th className="w-[14%] px-5 py-3 font-medium">레벨</th>
                  <th className="w-[18%] px-5 py-3 font-medium">소스</th>
                  <th className="px-5 py-3 font-medium">메시지</th>
                </tr>
              </thead>
              <tbody>
                {visibleSystemLogs.map((log) => (
                  <tr
                    key={log.logId}
                    className="cursor-pointer border-t border-brand-border/60 align-middle transition-colors hover:bg-brand-background/60 focus:bg-brand-background/60 focus:outline-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/sys-log/${log.logId}`, { state: { log } })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(`/sys-log/${log.logId}`, { state: { log } });
                      }
                    }}
                  >
                    <td className="px-5 py-3 align-middle whitespace-nowrap text-brand-textSub">{formatDateTime(log.createdAt)}</td>
                    <td className="px-5 py-3 align-middle">
                      <Badge variant={systemLogVariant(log.level)}>{log.level}</Badge>
                    </td>
                    <td className="px-5 py-3 align-middle text-brand-textSub">
                      <span className="block truncate" title={log.source}>{log.source}</span>
                    </td>
                    <td className="px-5 py-3 align-middle">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-brand-textMain" title={log.message}>{log.message}</span>
                    </td>
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
            <Pagination loading={false} page={systemLogPage} pageSize={SECTION_PAGE_SIZE} setPage={setSystemLogPage} totalPages={getTotalPages(systemLogs.length)} />
          )}
        </CardContent>
      </Card>
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

function getTotalPages(itemCount: number) {
  return Math.ceil(itemCount / SECTION_PAGE_SIZE);
}

function getPageItems<T>(items: T[], page: number) {
  const start = page * SECTION_PAGE_SIZE;
  return items.slice(start, start + SECTION_PAGE_SIZE);
}
