import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { ApiResponse, PageResponse, SystemLogResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime } from '../../utils/format';

function variant(level: SystemLogResponse['level']) {
  if (level === 'DANGER' || level === 'ERROR') return 'danger';
  if (level === 'WARNING') return 'warning';
  return 'info';
}

export function SystemLogPage() {
  const [logs, setLogs] = useState<SystemLogResponse[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    apiClient
      .get<ApiResponse<PageResponse<SystemLogResponse>>>('/logs/system', { params: { size: 50 } })
      .then((res) => {
        setLogs(res.data.data?.content || []);
        setTotal(res.data.data?.totalElements || 0);
      })
      .catch((error) => console.error('Failed to fetch system logs:', error));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">시스템 로그</h1>
        <p className="mt-1 text-sm text-brand-textSub">총 {total.toLocaleString()}건의 설비 이벤트와 경고 내역을 확인합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><Terminal className="w-5 h-5 text-brand-warning" /> 로그 내역</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.map((log) => (
            <div key={log.logId} className="rounded-lg border border-brand-border bg-brand-background p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={variant(log.level)}>{log.level}</Badge>
                <span className="font-mono text-xs text-brand-textSub">{formatDateTime(log.createdAt)}</span>
                <span className="text-xs text-brand-textSub">{log.source}</span>
                {log.runId && <span className="text-xs text-brand-primary">RUN-{log.runId}</span>}
              </div>
              <p className="mt-2 text-sm text-brand-textMain">{log.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
