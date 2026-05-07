import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, InspectionResponse, PageResponse } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime, formatNumber } from '../../utils/format';
import { confidenceClass, defectTypeSummary, inspectionResultClass, inspectionResultLabel } from './inspectionUtils';

const PAGE_SIZE = 20;

export function InspectionPage() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [page, setPage] = useState(0);
  const [, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<PageResponse<InspectionResponse>>>('/inspections', {
        params: { page, size: PAGE_SIZE },
      });
      const pageData = res.data.data;
      setInspections(pageData?.content || []);
      setTotal(pageData?.totalElements || 0);
      setTotalPages(pageData?.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
      setInspections([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchInspections();
  }, [fetchInspections]);

  const currentPage = totalPages === 0 ? 0 : page + 1;

  const goToDetail = (inspectionId: number) => {
    navigate(`/inspection/${inspectionId}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">검사 결과</h1>
        <p className="mt-1 text-sm text-brand-textSub">AI 판정, 신뢰도, 결함 유형을 함께 비교해 재검토가 필요한 제품을 찾습니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <ClipboardCheck className="w-5 h-5 text-brand-success" /> 검사 목록
          </CardTitle>
          <span className="text-xs text-brand-textSub">
            {currentPage.toLocaleString()} / {totalPages.toLocaleString()} 페이지
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">검사 ID</th>
                  <th className="px-5 py-3 font-medium">S/N</th>
                  <th className="px-5 py-3 font-medium">AI 판정</th>
                  <th className="px-5 py-3 font-medium">신뢰도</th>
                  <th className="px-5 py-3 font-medium">결함 유형</th>
                  <th className="px-5 py-3 font-medium">결함 수</th>
                  <th className="px-5 py-3 font-medium">검사 시각</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((item) => (
                  <tr
                    key={item.inspectionId}
                    className="cursor-pointer border-t border-brand-border/60 align-top transition-colors hover:bg-brand-background/60 focus:bg-brand-background/60 focus:outline-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => goToDetail(item.inspectionId)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        goToDetail(item.inspectionId);
                      }
                    }}
                  >
                    <td className="px-5 py-3 font-mono text-brand-textMain">{item.inspectionId}</td>
                    <td className="px-5 py-3 text-brand-textSub">{item.serialNo}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex min-w-14 justify-center rounded-md border px-2.5 py-1 text-xs font-bold ${inspectionResultClass(item.result)}`}>
                        {inspectionResultLabel(item.result)}
                      </span>
                    </td>
                    <td className={`px-5 py-3 font-semibold ${confidenceClass(item.confidence)}`}>
                      {formatNumber(Number(item.confidence) * 100)}%
                    </td>
                    <td className="px-5 py-3 text-brand-textMain">{defectTypeSummary(item.defects)}</td>
                    <td className="px-5 py-3 text-brand-textSub">{item.defects.length.toLocaleString()}건</td>
                    <td className="px-5 py-3 text-brand-textSub">{formatDateTime(item.inspectedAt)}</td>
                  </tr>
                ))}
                {inspections.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={7}>
                      {loading ? '검사 결과를 불러오는 중입니다.' : '검사 결과가 없습니다.'}
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
