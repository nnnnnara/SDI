import { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, InspectionResponse, PageResponse } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { currentPageNumber, Pagination } from '../../components/common/Pagination';
import { formatDateTime, formatPercent } from '../../utils/format';
import { confidenceClass, defectTypeSummary, inspectionResultClass, inspectionResultLabel } from './inspectionUtils';

const PAGE_SIZE = 20;

export function InspectionPage() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [page, setPage] = useState(0);
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
      setTotalPages(pageData?.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
      setInspections([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchInspections();
  }, [fetchInspections]);

  const currentPage = currentPageNumber(page, totalPages);
  const goToDetail = (inspectionId: number) => navigate(`/inspection/${inspectionId}`);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <PageHeader
        title="검사 결과"
        description="AI 판정, 신뢰도, 결함 유형을 함께 비교해 재검토가 필요한 제품을 찾습니다."
      />

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
                      {formatPercent(item.confidence)}
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

          <Pagination loading={loading} page={page} pageSize={PAGE_SIZE} setPage={setPage} totalPages={totalPages} />
        </CardContent>
      </Card>
    </div>
  );
}
