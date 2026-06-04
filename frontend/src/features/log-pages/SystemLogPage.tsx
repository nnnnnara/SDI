import { useCallback, useEffect, useMemo, useState } from 'react';
import { Terminal, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, PageResponse, SystemLogResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { currentPageNumber, Pagination } from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/format';

const PAGE_SIZE = 20;

function levelVariant(level: SystemLogResponse['level']) {
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
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<SystemLogResponse['level'] | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<PageResponse<SystemLogResponse>>>('/logs/system', {
        params: { page, size: PAGE_SIZE },
      });
      const pageData = res.data.data;
      setLogs(pageData?.content || []);
      setTotalPages(pageData?.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      setLogs([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const availableSources = useMemo(
    () => Array.from(new Set(logs.map((log) => log.source).filter(Boolean))).sort(),
    [logs]
  );

  const visibleLogs = useMemo(
    () => logs.filter((log) => (!selectedSource || log.source === selectedSource) && (!selectedLevel || log.level === selectedLevel)),
    [logs, selectedLevel, selectedSource]
  );
  const currentPage = currentPageNumber(page, totalPages);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <PageHeader
        title="시스템 로그"
        description="레벨과 소스별로 시스템 이벤트를 확인하고 공정 흐름의 이상 징후를 추적합니다."
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LevelGuide level="INFO" onSelect={setSelectedLevel} />
        <LevelGuide level="WARN" onSelect={setSelectedLevel} />
        <LevelGuide level="ERROR" onSelect={setSelectedLevel} />
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
            {selectedLevel && (
              <button
                type="button"
                onClick={() => setSelectedLevel(null)}
                className="inline-flex items-center gap-1 rounded-full border border-brand-warning/40 bg-brand-warning/10 px-2.5 py-1 text-brand-warning"
              >
                레벨: {levelLabel(selectedLevel)}
                <X className="h-3 w-3" />
              </button>
            )}
            <span>{currentPage.toLocaleString()} / {totalPages.toLocaleString()} 페이지</span>
          </div>
        </CardHeader>
        {availableSources.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-brand-border px-5 py-3 text-xs">
            <span className="font-medium text-brand-textSub">소스</span>
            {availableSources.map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setSelectedSource(source)}
                className={`rounded-md border px-2.5 py-1 font-medium transition-colors ${
                  selectedSource === source
                    ? 'border-brand-primary/50 bg-brand-primary/10 text-brand-primary'
                    : 'border-brand-border text-brand-textSub hover:border-brand-primary/50 hover:text-brand-primary'
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">레벨</th>
                  <th className="px-5 py-3 font-medium">시간</th>
                  <th className="px-5 py-3 font-medium">소스</th>
                  <th className="px-5 py-3 font-medium">공정 ID</th>
                  <th className="px-5 py-3 font-medium">메시지</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((log) => (
                  <tr key={log.logId} className="border-t border-brand-border/60 align-top">
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => setSelectedLevel(log.level)} title="같은 레벨 로그만 보기">
                        <Badge variant={levelVariant(log.level)} title={levelDescription(log.level)}>
                          {levelLabel(log.level)}
                        </Badge>
                      </button>
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
                    <td className="px-5 py-3 whitespace-nowrap">
                      {log.runId ? (
                        <Link
                          to={`/history/${log.runId}`}
                          className="font-medium text-brand-primary hover:underline"
                        >
                          RUN-{log.runId}
                        </Link>
                      ) : (
                        <span className="text-brand-textSub">-</span>
                      )}
                    </td>
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

          <Pagination loading={loading} page={page} pageSize={PAGE_SIZE} setPage={setPage} totalPages={totalPages} />
        </CardContent>
      </Card>
    </div>
  );
}

function LevelGuide({ level, onSelect }: { level: SystemLogResponse['level']; onSelect: (level: SystemLogResponse['level']) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(level)}
      className="rounded-lg border border-brand-border bg-brand-card px-4 py-3 text-left transition-colors hover:border-brand-primary/50"
    >
      <div className="flex items-center justify-between gap-3">
        <Badge variant={levelVariant(level)}>{levelLabel(level)}</Badge>
        <span className="text-xs font-mono text-brand-textSub">{level}</span>
      </div>
      <p className="mt-2 text-xs text-brand-textSub">{levelDescription(level)}</p>
    </button>
  );
}
