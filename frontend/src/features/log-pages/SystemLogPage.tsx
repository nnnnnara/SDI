import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Terminal, X } from 'lucide-react';
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

function levelLabel(level: SystemLogResponse['level']) {
  if (level === 'ERROR') return '오류';
  if (level === 'WARN') return '주의';
  return '정보';
}

function levelDescription(level: SystemLogResponse['level']) {
  if (level === 'ERROR') return '처리 실패 또는 즉시 확인이 필요한 로그';
  if (level === 'WARN') return '동작은 계속되지만 확인이 필요한 로그';
  return '정상 처리 흐름을 기록한 로그';
}

export function SystemLogPage() {
  const [logs, setLogs] = useState<SystemLogResponse[]>([]);
  const [page, setPage] = useState(0);
  const [, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

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

  const visibleLogs = useMemo(
    () => logs.filter((log) => !selectedSource || log.source === selectedSource),
    [logs, selectedSource]
  );
  const currentPage = totalPages === 0 ? 0 : page + 1;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">시스템 로그</h1>
        <p className="mt-1 text-sm text-brand-textSub">경고와 오류의 발생 위치를 소스별로 좁혀 공정 운영 중 확인할 이슈를 추적합니다.</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LevelGuide level="INFO" />
        <LevelGuide level="WARN" />
        <LevelGuide level="ERROR" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            <Terminal className="w-5 h-5 text-brand-warning" /> 로그 목록
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs text-brand-textSub">
            {selectedSource && (
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="inline-flex items-center gap-1 rounded-full border border-brand-primary/40 bg-brand-primary/10 px-2.5 py-1 text-brand-primary"
              >
                소스: {selectedSource}
                <X className="h-3 w-3" />
              </button>
            )}
            <span>{currentPage.toLocaleString()} / {totalPages.toLocaleString()} 페이지</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">레벨</th>
                  <th className="px-5 py-3 font-medium">시각</th>
                  <th className="px-5 py-3 font-medium">소스</th>
                  <th className="px-5 py-3 font-medium">공정 ID</th>
                  <th className="px-5 py-3 font-medium">메시지</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((log) => (
                  <tr key={log.logId} className="border-t border-brand-border/60 align-top">
                    <td className="px-5 py-3">
                      <Badge variant={variant(log.level)} title={levelDescription(log.level)}>
                        {levelLabel(log.level)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap font-mono text-xs text-brand-textSub">{formatDateTime(log.createdAt)}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedSource(log.source)}
                        className="rounded-md border border-brand-border px-2 py-1 text-xs font-medium text-brand-textSub hover:border-brand-primary/50 hover:text-brand-primary"
                        title="같은 소스 로그만 보기"
                      >
                        {log.source}
                      </button>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-brand-primary">{log.runId ? `RUN-${log.runId}` : '-'}</td>
                    <td className="px-5 py-3 text-brand-textMain">{log.message}</td>
                  </tr>
                ))}
                {visibleLogs.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={5}>
                      {loading ? '시스템 로그를 불러오는 중입니다.' : '표시할 시스템 로그가 없습니다.'}
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

function LevelGuide({ level }: { level: SystemLogResponse['level'] }) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-card px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <Badge variant={variant(level)}>{levelLabel(level)}</Badge>
        <span className="text-xs font-mono text-brand-textSub">{level}</span>
      </div>
      <p className="mt-2 text-xs text-brand-textSub">{levelDescription(level)}</p>
    </div>
  );
}
