import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, PageResponse, ProcessRunResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime } from '../../utils/format';

const PAGE_SIZE = 20;

function processStatusVariant(status?: string) {
  if (status === 'RUNNING') return 'success';
  if (status === 'ERROR') return 'danger';
  if (status === 'STOPPED') return 'warning';
  return 'default';
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<ProcessRunResponse[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<PageResponse<ProcessRunResponse>>>('/process', {
        params: { page, size: PAGE_SIZE },
      });
      const pageData = res.data.data;
      setRuns(pageData?.content || []);
      setTotal(pageData?.totalElements || 0);
      setTotalPages(pageData?.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch process history:', error);
      setRuns([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchRuns();
  }, [fetchRuns]);

  const currentPage = totalPages === 0 ? 0 : page + 1;

  const goToDetail = (runId: number) => {
    navigate(`/history/${runId}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">공정 이력</h1>
        <p className="mt-1 text-sm text-brand-textSub">
          본인이 시작한 공정 {total.toLocaleString()}건의 상태와 시간을 확인합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><History className="w-5 h-5 text-brand-primary" /> 공정 실행 목록</CardTitle>
          <span className="text-xs text-brand-textSub">
            {currentPage.toLocaleString()} / {totalPages.toLocaleString()} 페이지
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">Run ID</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                  <th className="px-5 py-3 font-medium">시작</th>
                  <th className="px-5 py-3 font-medium">종료</th>
                  <th className="px-5 py-3 font-medium">정지 사유</th>
                  <th className="px-5 py-3 font-medium">시작자</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.runId}
                    className="cursor-pointer border-t border-brand-border/60 transition-colors hover:bg-brand-background/60 focus:bg-brand-background/60 focus:outline-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => goToDetail(run.runId)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        goToDetail(run.runId);
                      }
                    }}
                  >
                    <td className="px-5 py-3 font-mono text-brand-textMain">RUN-{run.runId}</td>
                    <td className="px-5 py-3"><Badge variant={processStatusVariant(run.status)}>{run.status}</Badge></td>
                    <td className="px-5 py-3 text-brand-textSub">{formatDateTime(run.startedAt)}</td>
                    <td className="px-5 py-3 text-brand-textSub">{formatDateTime(run.endedAt)}</td>
                    <td className="px-5 py-3 text-brand-textSub">{run.stopReason ?? '-'}</td>
                    <td className="px-5 py-3 text-brand-textMain">{run.startedBy?.name ?? '-'}</td>
                  </tr>
                ))}
                {runs.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={6}>
                      {loading ? '공정 이력을 불러오는 중입니다.' : '공정 이력이 없습니다.'}
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
