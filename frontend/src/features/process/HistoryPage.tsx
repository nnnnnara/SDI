import { useCallback, useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, PageResponse, ProcessRunResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { currentPageNumber, Pagination } from '../../components/common/Pagination';
import { formatDateTime, formatDuration } from '../../utils/format';
import { processStatusDisplay, processStatusVariant, stopReasonDisplay, stopReasonVariant } from './processUtils';

const PAGE_SIZE = 10;

export function HistoryPage() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<ProcessRunResponse[]>([]);
  const [page, setPage] = useState(0);
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
      setTotalPages(pageData?.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch process history:', error);
      setRuns([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchRuns();
  }, [fetchRuns]);

  const currentPage = currentPageNumber(page, totalPages);
  const goToDetail = (runId: number) => navigate(`/history/${runId}`);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <PageHeader
        title="공정 이력"
        description="종료 유형과 소요 시간을 기준으로 공정이 정상적으로 완료됐는지 추적합니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>
            <History className="w-5 h-5 text-brand-primary" /> 공정 실행 목록
          </CardTitle>
          <span className="text-xs text-brand-textSub">
            {currentPage.toLocaleString()} / {totalPages.toLocaleString()} 페이지 (페이지당 {PAGE_SIZE}건)
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">공정 ID</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                  <th className="px-5 py-3 font-medium">종료 유형</th>
                  <th className="px-5 py-3 font-medium">소요 시간</th>
                  <th className="px-5 py-3 font-medium">시작 시간</th>
                  <th className="px-5 py-3 font-medium">종료 시간</th>
                  <th className="px-5 py-3 font-medium">시작자</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const isRunning = run.status === 'RUNNING';

                  return (
                    <tr
                      key={run.runId}
                      className={`cursor-pointer border-t border-brand-border/60 transition-colors hover:bg-brand-background/60 focus:bg-brand-background/60 focus:outline-none ${
                        isRunning ? 'border-l-4 border-l-brand-success bg-brand-success/5' : ''
                      }`}
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
                      <td className="px-5 py-3">
                        <Badge variant={processStatusVariant(run.status)}>{processStatusDisplay(run.status)}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={stopReasonVariant(run.stopReason, run.status)}>
                          {stopReasonDisplay(run.stopReason, run.status)}
                        </Badge>
                      </td>
                      <td className={`px-5 py-3 font-semibold ${isRunning ? 'text-brand-success' : 'text-brand-primary'}`}>
                        {formatDuration(run.startedAt, run.endedAt)}
                      </td>
                      <td className="px-5 py-3 text-brand-textSub">{formatDateTime(run.startedAt)}</td>
                      <td className="px-5 py-3 text-brand-textSub">{formatDateTime(run.endedAt)}</td>
                      <td className="px-5 py-3 text-brand-textMain">{run.startedBy?.name ?? '-'}</td>
                    </tr>
                  );
                })}
                {runs.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={7}>
                      {loading ? '공정 이력을 불러오는 중입니다.' : '공정 이력이 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination align="center" loading={loading} page={page} setPage={setPage} totalPages={totalPages} />
        </CardContent>
      </Card>
    </div>
  );
}
