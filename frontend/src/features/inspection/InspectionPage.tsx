import { useEffect, useState } from 'react';
import { ClipboardCheck, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse, InspectionResponse } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime, formatNumber } from '../../utils/format';

export function InspectionPage() {
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);

  useEffect(() => {
    apiClient
      .get<ApiResponse<InspectionResponse[]>>('/inspections/recent', { params: { limit: 50 } })
      .then((res) => setInspections(res.data.data || []))
      .catch((error) => console.error('Failed to fetch inspections:', error));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">검사 결과</h1>
        <p className="mt-1 text-sm text-brand-textSub">최근 검사 결과와 불량 정보를 확인합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><ClipboardCheck className="w-5 h-5 text-brand-success" /> 최근 검사 목록</CardTitle>
          <span className="text-xs text-brand-textSub">{inspections.length.toLocaleString()}건</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">검사 ID</th>
                  <th className="px-5 py-3 font-medium">S/N</th>
                  <th className="px-5 py-3 font-medium">결과</th>
                  <th className="px-5 py-3 font-medium">신뢰도</th>
                  <th className="px-5 py-3 font-medium">불량 개수</th>
                  <th className="px-5 py-3 font-medium">검사 시간</th>
                  <th className="px-5 py-3 font-medium">상세</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((item) => (
                  <tr key={item.inspectionId} className="border-t border-brand-border/60 align-top">
                    <td className="px-5 py-3 font-mono text-brand-textMain">{item.inspectionId}</td>
                    <td className="px-5 py-3 text-brand-textSub">{item.serialNo}</td>
                    <td className="px-5 py-3">
                      <Badge variant={item.result === 'GOOD' ? 'success' : 'danger'}>{item.result}</Badge>
                    </td>
                    <td className="px-5 py-3 text-brand-textMain">{formatNumber(Number(item.confidence) * 100)}%</td>
                    <td className="px-5 py-3 text-brand-textSub">{item.defects.length.toLocaleString()}건</td>
                    <td className="px-5 py-3 text-brand-textSub">{formatDateTime(item.inspectedAt)}</td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/inspection/${item.inspectionId}`}
                        className="inline-flex items-center gap-1 text-brand-primary hover:underline"
                      >
                        <Eye className="w-4 h-4" /> 보기
                      </Link>
                    </td>
                  </tr>
                ))}
                {inspections.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={7}>검사 결과가 없습니다.</td>
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
