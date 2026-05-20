import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, InspectionResponse, PageResponse } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { currentPageNumber, Pagination } from '../../components/common/Pagination';
import { formatDateTime, formatPercent } from '../../utils/format';
import {
  confidenceClass,
  FILTERABLE_DEFECT_TYPES,
  defectTypeLabel,
  inspectionResultClass,
  inspectionResultLabel,
  uniqueDefectTypes,
} from './inspectionUtils';

const PAGE_SIZE = 20;

function resultDescription(result: InspectionResponse['result']) {
  if (result === 'BAD') return '결함이 감지된 검사 결과';
  return '결함 없이 통과한 검사 결과';
}

export function InspectionPage() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<InspectionResponse['result'] | null>(null);
  const [selectedDefectTypes, setSelectedDefectTypes] = useState<string[]>([]);

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

  const visibleInspections = useMemo(
    () =>
      inspections.filter((inspection) => {
        const resultMatches = !selectedResult || inspection.result === selectedResult;
        const defectMatches =
          selectedDefectTypes.length === 0 ||
          inspection.defects.some((defect) => selectedDefectTypes.includes(defect.defectType));
        return resultMatches && defectMatches;
      }),
    [inspections, selectedDefectTypes, selectedResult]
  );

  const currentPage = currentPageNumber(page, totalPages);
  const goToDetail = (inspectionId: number) => navigate(`/inspection/${inspectionId}`);
  const toggleDefectType = (defectType: string) => {
    setSelectedDefectTypes((current) =>
      current.includes(defectType) ? current.filter((item) => item !== defectType) : [...current, defectType]
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <PageHeader
        title="검사 결과"
        description="최근 검사 결과를 AI 판정과 결함 유형 기준으로 빠르게 확인합니다."
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResultGuide result="GOOD" selected={selectedResult === 'GOOD'} onSelect={setSelectedResult} />
        <ResultGuide result="BAD" selected={selectedResult === 'BAD'} onSelect={setSelectedResult} />
      </section>

      <Card>
        <CardHeader className="flex-wrap gap-3">
          <CardTitle>
            <ClipboardCheck className="w-5 h-5 text-brand-success" /> 검사 목록
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs text-brand-textSub">
            {selectedResult && (
              <FilterChip tone="primary" onClear={() => setSelectedResult(null)}>
                AI 판정: {inspectionResultLabel(selectedResult)}
              </FilterChip>
            )}
            {selectedDefectTypes.map((defectType) => (
              <FilterChip key={defectType} tone="danger" onClear={() => toggleDefectType(defectType)}>
                결함 유형: {defectTypeLabel(defectType)}
              </FilterChip>
            ))}
            <span>
              {visibleInspections.length.toLocaleString()} / {inspections.length.toLocaleString()}건 표시
            </span>
            <span>{currentPage.toLocaleString()} / {totalPages.toLocaleString()} 페이지</span>
          </div>
        </CardHeader>

        <div className="flex flex-wrap items-center gap-2 border-b border-brand-border px-5 py-3 text-xs">
          <span className="font-medium text-brand-textSub">결함 유형</span>
          {FILTERABLE_DEFECT_TYPES.map((defectType) => (
            <button
              key={defectType}
              type="button"
              onClick={() => toggleDefectType(defectType)}
              className={`rounded-md border px-2.5 py-1 font-medium transition-colors ${
                selectedDefectTypes.includes(defectType)
                  ? 'border-brand-danger/50 bg-brand-danger/15 text-brand-danger'
                  : 'border-brand-border text-brand-textSub hover:border-brand-primary/50 hover:text-brand-primary'
              }`}
            >
              {defectTypeLabel(defectType)}
            </button>
          ))}
        </div>

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
                {visibleInspections.map((item) => (
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
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedResult(item.result);
                        }}
                        className={`inline-flex min-w-14 justify-center rounded-md border px-2.5 py-1 text-xs font-bold ${inspectionResultClass(item.result)}`}
                      >
                        {inspectionResultLabel(item.result)}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-semibold ${confidenceClass(item.confidence)}`}>
                        {formatPercent(item.confidence)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {uniqueDefectTypes(item.defects).length === 0 ? (
                        <span className="text-brand-textSub">-</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {uniqueDefectTypes(item.defects).map((defectType) => (
                            <button
                              key={defectType}
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleDefectType(defectType);
                              }}
                              className={`rounded-md border px-2 py-1 text-xs font-medium ${
                                selectedDefectTypes.includes(defectType)
                                  ? 'border-brand-danger/50 bg-brand-danger/15 text-brand-danger'
                                  : 'border-brand-border text-brand-textSub hover:border-brand-primary/50 hover:text-brand-primary'
                              }`}
                            >
                              {defectTypeLabel(defectType)}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-brand-textSub">{item.defects.length.toLocaleString()}건</td>
                    <td className="px-5 py-3 text-brand-textSub">{formatDateTime(item.inspectedAt)}</td>
                  </tr>
                ))}
                {visibleInspections.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={7}>
                      {loading ? '검사 결과를 불러오는 중입니다.' : '조건에 맞는 검사 결과가 없습니다.'}
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

function ResultGuide({
  onSelect,
  result,
  selected,
}: {
  onSelect: (result: InspectionResponse['result']) => void;
  result: InspectionResponse['result'];
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className={`rounded-lg border bg-brand-card px-4 py-3 text-left transition-colors hover:border-brand-primary/50 ${
        selected ? 'border-brand-primary/50' : 'border-brand-border'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${inspectionResultClass(result)}`}>
          {inspectionResultLabel(result)}
        </span>
        <span className="text-xs font-mono text-brand-textSub">{result}</span>
      </div>
      <p className="mt-2 text-xs text-brand-textSub">{resultDescription(result)}</p>
    </button>
  );
}

function FilterChip({
  children,
  onClear,
  tone,
}: {
  children: ReactNode;
  onClear: () => void;
  tone: 'primary' | 'warning' | 'danger';
}) {
  const toneClass = {
    primary: 'border-brand-primary/40 bg-brand-primary/10 text-brand-primary',
    warning: 'border-brand-warning/40 bg-brand-warning/10 text-brand-warning',
    danger: 'border-brand-danger/40 bg-brand-danger/10 text-brand-danger',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClear}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${toneClass}`}
    >
      {children}
      <X className="h-3 w-3" />
    </button>
  );
}
