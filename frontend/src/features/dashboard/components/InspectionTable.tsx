import type { InspectionResponse } from '../../../api/client';
import { formatDateTime, formatNumber } from '../../../utils/format';
import { useNavigate } from 'react-router-dom';
import { inspectionResultClass, inspectionResultLabel } from '../../inspection/inspectionUtils';

export function InspectionTable({ inspections }: { inspections: InspectionResponse[] }) {
  const navigate = useNavigate();

  const goToDetail = (inspectionId: number) => {
    navigate(`/inspection/${inspectionId}`);
  };

  return (
    <table className="w-full text-sm">
      <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
        <tr>
          <th className="px-5 py-3 font-medium">S/N</th>
          <th className="px-5 py-3 font-medium">결과</th>
          <th className="px-5 py-3 font-medium">신뢰도</th>
          <th className="px-5 py-3 font-medium">검사 시각</th>
        </tr>
      </thead>
      <tbody>
        {inspections.map((item) => (
          <tr
            key={item.inspectionId}
            className="cursor-pointer border-t border-brand-border/60 transition-colors hover:bg-brand-background/60 focus:bg-brand-background/60 focus:outline-none"
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
            <td className="px-5 py-3 text-brand-textMain">{item.serialNo}</td>
            <td className="px-5 py-3">
              <span className={`inline-flex min-w-14 justify-center rounded-md border px-2.5 py-1 text-xs font-bold ${inspectionResultClass(item.result)}`}>
                {inspectionResultLabel(item.result)}
              </span>
            </td>
            <td className="px-5 py-3 text-brand-textMain">{formatNumber(Number(item.confidence) * 100)}%</td>
            <td className="px-5 py-3 text-brand-textSub">{formatDateTime(item.inspectedAt)}</td>
          </tr>
        ))}
        {inspections.length === 0 && (
          <tr>
            <td className="px-5 py-8 text-center text-brand-textSub" colSpan={4}>
              최근 검사 결과가 없습니다.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
