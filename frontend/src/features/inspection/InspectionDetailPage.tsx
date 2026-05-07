import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Boxes, Image as ImageIcon, ScanSearch } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, InspectionResponse } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime, formatNumber } from '../../utils/format';
import {
  confidenceClass,
  confidenceLevelLabel,
  defectTypeSummary,
  inspectionResultClass,
  inspectionResultLabel,
  uniqueDefectTypes,
} from './inspectionUtils';

export function InspectionDetailPage() {
  const { inspectionId } = useParams();
  const [inspection, setInspection] = useState<InspectionResponse | null>(null);

  useEffect(() => {
    if (!inspectionId) return;

    apiClient
      .get<ApiResponse<InspectionResponse>>(`/inspections/${inspectionId}`)
      .then((res) => setInspection(res.data.data || null))
      .catch((error) => console.error('Failed to fetch inspection detail:', error));
  }, [inspectionId]);

  const defectTypes = useMemo(() => uniqueDefectTypes(inspection?.defects ?? []), [inspection]);
  const hasDefects = Number(inspection?.defects.length ?? 0) > 0;
  const confidencePercent = Number(inspection?.confidence ?? 0) * 100;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/inspection" className="inline-flex items-center gap-1 text-sm text-brand-textSub hover:text-brand-primary">
            <ArrowLeft className="w-4 h-4" /> 검사 결과
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-brand-textMain">검사 {inspectionId} 상세</h1>
        </div>
        <span className={`inline-flex rounded-md border px-3 py-1.5 text-sm font-bold ${inspectionResultClass(inspection?.result)}`}>
          {inspectionResultLabel(inspection?.result)}
        </span>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <ScanSearch className="w-5 h-5 text-brand-primary" /> AI 판정 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-brand-textSub">S/N</dt>
                <dd className="mt-1 text-brand-textMain">{inspection?.serialNo ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-brand-textSub">신뢰도</dt>
                <dd className={`mt-1 text-2xl font-bold ${confidenceClass(inspection?.confidence)}`}>
                  {formatNumber(confidencePercent)}%
                  <span className="ml-2 text-xs font-medium text-brand-textSub">{confidenceLevelLabel(inspection?.confidence)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-brand-textSub">검사 시각</dt>
                <dd className="mt-1 text-brand-textMain">{formatDateTime(inspection?.inspectedAt)}</dd>
              </div>
              <div>
                <dt className="text-brand-textSub">주요 결함 유형</dt>
                <dd className="mt-1 text-brand-textMain">{defectTypeSummary(inspection?.defects ?? [])}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <Boxes className="w-5 h-5 text-brand-danger" /> 판정 근거
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <EvidenceMetric label="결함 수" value={`${inspection?.defects.length ?? 0}건`} tone={hasDefects ? 'danger' : 'success'} />
              <EvidenceMetric label="결함 유형" value={defectTypes.length > 0 ? `${defectTypes.length}종` : '-'} tone={hasDefects ? 'warning' : 'default'} />
              <EvidenceMetric label="신뢰도 구간" value={confidenceLevelLabel(inspection?.confidence)} tone={confidencePercent < 85 ? 'warning' : 'success'} />
            </div>
            <div className="mt-5 rounded-lg border border-brand-border bg-brand-background/40 px-4 py-3 text-sm text-brand-textSub">
              {hasDefects
                ? 'AI 분석 결과 이미지의 표시 영역과 결함 좌표를 기준으로 불량 판정을 확인합니다.'
                : '탐지된 결함 영역이 없어 정상 판정으로 분류되었습니다.'}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            <ImageIcon className="w-5 h-5 text-brand-info" /> 검사 이미지
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImagePanel title="촬영 원본" description="카메라가 촬영한 외관 이미지" imageUrl={inspection?.rawImageUrl} />
            <ImagePanel title="AI 분석 결과" description="결함 위치가 표시된 분석 이미지" imageUrl={inspection?.resultImageUrl} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>결함 상세</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">결함 ID</th>
                  <th className="px-5 py-3 font-medium">결함 유형</th>
                  <th className="px-5 py-3 font-medium">영역 X</th>
                  <th className="px-5 py-3 font-medium">영역 Y</th>
                  <th className="px-5 py-3 font-medium">너비</th>
                  <th className="px-5 py-3 font-medium">높이</th>
                </tr>
              </thead>
              <tbody>
                {inspection?.defects.map((defect) => (
                  <tr key={defect.defectId} className="border-t border-brand-border/60">
                    <td className="px-5 py-3 font-mono text-brand-textMain">{defect.defectId}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md border border-brand-danger/40 bg-brand-danger/10 px-2.5 py-1 text-xs font-semibold text-brand-danger">
                        {defect.defectType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-textSub">{defect.bboxX}</td>
                    <td className="px-5 py-3 text-brand-textSub">{defect.bboxY}</td>
                    <td className="px-5 py-3 text-brand-textSub">{defect.bboxW}</td>
                    <td className="px-5 py-3 text-brand-textSub">{defect.bboxH}</td>
                  </tr>
                ))}
                {(!inspection || inspection.defects.length === 0) && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={6}>
                      탐지된 결함이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EvidenceMetric({ label, value, tone }: { label: string; value: string; tone: 'success' | 'warning' | 'danger' | 'default' }) {
  const toneClass = {
    success: 'text-brand-success',
    warning: 'text-brand-warning',
    danger: 'text-brand-danger',
    default: 'text-brand-textMain',
  }[tone];

  return (
    <div className="rounded-lg border border-brand-border bg-brand-background/40 px-4 py-3">
      <div className="text-xs text-brand-textSub">{label}</div>
      <div className={`mt-1 text-xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function ImagePanel({ title, description, imageUrl }: { title: string; description: string; imageUrl?: string | null }) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-brand-textMain">{title}</div>
          <div className="text-xs text-brand-textSub">{description}</div>
        </div>
      </div>
      {imageUrl ? (
        <a href={imageUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-brand-border bg-brand-background">
          <img src={imageUrl} alt={title} className="h-80 w-full object-contain" />
        </a>
      ) : (
        <div className="flex h-80 items-center justify-center rounded-lg border border-brand-border bg-brand-background text-sm text-brand-textSub">
          이미지 없음
        </div>
      )}
    </div>
  );
}
