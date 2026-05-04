import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { ApiResponse, PageResponse, ProcessRunResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime } from '../../utils/format';

export function HistoryPage() {
  const [runs, setRuns] = useState<ProcessRunResponse[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    apiClient
      .get<ApiResponse<PageResponse<ProcessRunResponse>>>('/process', { params: { size: 20 } })
      .then((res) => {
        setRuns(res.data.data?.content || []);
        setTotal(res.data.data?.totalElements || 0);
      })
      .catch((error) => console.error('Failed to fetch process history:', error));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">공정 이력</h1>
        <p className="mt-1 text-sm text-brand-textSub">총 {total.toLocaleString()}건의 공정 실행 기록을 확인합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><History className="w-5 h-5 text-brand-primary" /> 실행 기록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
              <tr>
                <th className="px-5 py-3 font-medium">Run ID</th>
                <th className="px-5 py-3 font-medium">상태</th>
                <th className="px-5 py-3 font-medium">시작</th>
                <th className="px-5 py-3 font-medium">종료</th>
                <th className="px-5 py-3 font-medium">중지 사유</th>
                <th className="px-5 py-3 font-medium">담당자</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.runId} className="border-t border-brand-border/60">
                  <td className="px-5 py-3 font-mono text-brand-textMain">RUN-{run.runId}</td>
                  <td className="px-5 py-3"><Badge variant={run.status === 'RUNNING' ? 'success' : 'default'}>{run.status}</Badge></td>
                  <td className="px-5 py-3 text-brand-textSub">{formatDateTime(run.startedAt)}</td>
                  <td className="px-5 py-3 text-brand-textSub">{formatDateTime(run.endedAt)}</td>
                  <td className="px-5 py-3 text-brand-textSub">{run.stopReason ?? '-'}</td>
                  <td className="px-5 py-3 text-brand-textMain">{run.startedBy?.name ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
