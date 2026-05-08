import { useEffect, useState } from 'react';
import { ArrowLeft, Terminal } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, PageResponse, SystemLogResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime } from '../../utils/format';

const FALLBACK_LOOKUP_SIZE = 100;

export function SystemLogDetailPage() {
  const { logId } = useParams();
  const location = useLocation();
  const [log, setLog] = useState<SystemLogResponse | null>((location.state as { log?: SystemLogResponse } | null)?.log ?? null);

  useEffect(() => {
    if (log || !logId) return;

    apiClient
      .get<ApiResponse<PageResponse<SystemLogResponse>>>('/logs/system', {
        params: { page: 0, size: FALLBACK_LOOKUP_SIZE },
      })
      .then((res) => {
        const logs = res.data.data?.content || [];
        setLog(logs.find((item) => item.logId === Number(logId)) ?? null);
      })
      .catch((error) => console.error('Failed to fetch system log detail:', error));
  }, [log, logId]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
        <Link to={log?.runId ? `/history/${log.runId}` : '/sys-log'} className="inline-flex items-center gap-1 text-sm text-brand-textSub hover:text-brand-primary">
          <ArrowLeft className="w-4 h-4" /> 이전 화면
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-textMain">시스템 로그 상세</h1>
        </div>
        {log && <Badge variant={levelVariant(log.level)}>{log.level}</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle><Terminal className="w-5 h-5 text-brand-warning" /> LOG-{logId}</CardTitle>
        </CardHeader>
        <CardContent>
          {log ? (
            <dl className="grid grid-cols-1 gap-5 text-sm md:grid-cols-2">
              <DetailItem label="시간" value={formatDateTime(log.createdAt)} />
              <DetailItem label="공정" value={log.runId ? `RUN-${log.runId}` : '-'} />
              <DetailItem label="레벨" value={log.level} />
              <DetailItem label="소스" value={log.source} />
              <div className="md:col-span-2">
                <dt className="text-brand-textSub">메시지</dt>
                <dd className="mt-2 whitespace-pre-wrap rounded-lg border border-brand-border bg-brand-background/40 p-4 leading-relaxed text-brand-textMain">
                  {log.message}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="flex min-h-40 items-center justify-center text-sm text-brand-textSub">
              시스템 로그를 찾을 수 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-brand-textSub">{label}</dt>
      <dd className="mt-1 text-brand-textMain">{value}</dd>
    </div>
  );
}

function levelVariant(level: SystemLogResponse['level']) {
  if (level === 'ERROR') return 'danger';
  if (level === 'WARN') return 'warning';
  return 'info';
}
