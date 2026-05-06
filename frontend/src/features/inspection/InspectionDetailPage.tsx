import { useEffect, useState } from 'react';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, InspectionResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime, formatNumber } from '../../utils/format';

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

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/inspection" className="inline-flex items-center gap-1 text-sm text-brand-textSub hover:text-brand-primary">
            <ArrowLeft className="w-4 h-4" /> 검사 결과
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-brand-textMain">검사 {inspectionId} 상세</h1>
        </div>
        <Badge variant={inspection?.result === 'GOOD' ? 'success' : inspection?.result === 'BAD' ? 'danger' : 'default'}>
          {inspection?.result ?? '-'}
        </Badge>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>검사 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <div><dt className="text-brand-textSub">S/N</dt><dd className="mt-1 text-brand-textMain">{inspection?.serialNo ?? '-'}</dd></div>
              <div><dt className="text-brand-textSub">신뢰도</dt><dd className="mt-1 text-brand-textMain">{formatNumber(Number(inspection?.confidence ?? 0) * 100)}%</dd></div>
              <div><dt className="text-brand-textSub">검사 시간</dt><dd className="mt-1 text-brand-textMain">{formatDateTime(inspection?.inspectedAt)}</dd></div>
              <div><dt className="text-brand-textSub">불량 개수</dt><dd className="mt-1 text-brand-textMain">{inspection?.defects.length ?? 0}건</dd></div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle><ImageIcon className="w-5 h-5 text-brand-info" /> 검사 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImagePanel title="원본 이미지" imageUrl={inspection?.rawImageUrl} />
              <ImagePanel title="결과 이미지" imageUrl={inspection?.resultImageUrl} />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>불량 상세</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">불량 ID</th>
                  <th className="px-5 py-3 font-medium">유형</th>
                  <th className="px-5 py-3 font-medium">X</th>
                  <th className="px-5 py-3 font-medium">Y</th>
                  <th className="px-5 py-3 font-medium">W</th>
                  <th className="px-5 py-3 font-medium">H</th>
                </tr>
              </thead>
              <tbody>
                {inspection?.defects.map((defect) => (
                  <tr key={defect.defectId} className="border-t border-brand-border/60">
                    <td className="px-5 py-3 font-mono text-brand-textMain">{defect.defectId}</td>
                    <td className="px-5 py-3 text-brand-textMain">{defect.defectType}</td>
                    <td className="px-5 py-3 text-brand-textSub">{defect.bboxX}</td>
                    <td className="px-5 py-3 text-brand-textSub">{defect.bboxY}</td>
                    <td className="px-5 py-3 text-brand-textSub">{defect.bboxW}</td>
                    <td className="px-5 py-3 text-brand-textSub">{defect.bboxH}</td>
                  </tr>
                ))}
                {(!inspection || inspection.defects.length === 0) && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={6}>불량 상세가 없습니다.</td>
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

function ImagePanel({ title, imageUrl }: { title: string; imageUrl?: string | null }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-brand-textSub">{title}</div>
      {imageUrl ? (
        <a href={imageUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-brand-border bg-brand-background">
          <img src={imageUrl} alt={title} className="h-64 w-full object-contain" />
        </a>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border border-brand-border bg-brand-background text-sm text-brand-textSub">
          이미지 없음
        </div>
      )}
    </div>
  );
}
