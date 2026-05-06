import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Terminal } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { ApiResponse, PageResponse, SystemLogResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime } from '../../utils/format';

const PAGE_SIZE = 20;

function variant(level: SystemLogResponse['level']) {
  if (level === 'ERROR') return 'danger';
  if (level === 'WARN') return 'warning';
  return 'info';
}

export function SystemLogPage() {
  const [logs, setLogs] = useState<SystemLogResponse[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<PageResponse<SystemLogResponse>>>('/logs/system', {
        params: { page, size: PAGE_SIZE },
      });
      const pageData = res.data.data;
      setLogs(pageData?.content || []);
      setTotal(pageData?.totalElements || 0);
      setTotalPages(pageData?.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      setLogs([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const currentPage = totalPages === 0 ? 0 : page + 1;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">시스템 로그</h1>
        <p className="mt-1 text-sm text-brand-textSub">
          전체 {total.toLocaleString()}건의 시스템 이벤트와 경고 로그를 확인합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><Terminal className="w-5 h-5 text-brand-warning" /> 로그 목록</CardTitle>
          <span className="text-xs text-brand-textSub">
            {currentPage.toLocaleString()} / {totalPages.toLocaleString()} 페이지
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">레벨</th>
                  <th className="px-5 py-3 font-medium">시간</th>
                  <th className="px-5 py-3 font-medium">소스</th>
                  <th className="px-5 py-3 font-medium">Run ID</th>
                  <th className="px-5 py-3 font-medium">메시지</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.logId} className="border-t border-brand-border/60 align-top">
                    <td className="px-5 py-3"><Badge variant={variant(log.level)}>{log.level}</Badge></td>
                    <td className="px-5 py-3 whitespace-nowrap font-mono text-xs text-brand-textSub">{formatDateTime(log.createdAt)}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-brand-textSub">{log.source}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-brand-primary">{log.runId ? `RUN-${log.runId}` : '-'}</td>
                    <td className="px-5 py-3 text-brand-textMain">{log.message}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={5}>
                      {loading ? '시스템 로그를 불러오는 중입니다.' : '시스템 로그가 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-brand-border px-5 py-4 text-sm">
            <span className="text-brand-textSub">페이지당 {PAGE_SIZE}건</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                disabled={page === 0 || loading}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border text-brand-textSub hover:text-brand-textMain disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="이전 페이지"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="min-w-24 text-center text-brand-textMain">
                {currentPage} / {totalPages || 0}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(Math.max(totalPages - 1, 0), value + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border text-brand-textSub hover:text-brand-textMain disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="다음 페이지"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
