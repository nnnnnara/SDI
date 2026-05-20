import type { InspectionResponse } from '../../../api/client';
import { formatDateTime, formatPercent } from '../../../utils/format';
import {
  confidenceClass,
  defectTypeLabel,
  inspectionResultClass,
  inspectionResultLabel,
  uniqueDefectTypes,
} from '../../inspection/inspectionUtils';

export function InspectionSummary({ inspection }: { inspection: InspectionResponse }) {
  const defectTypes = uniqueDefectTypes(inspection.defects);

  return (
    <div className="grid grid-cols-1 gap-3 text-sm lg:grid-cols-[90px_minmax(180px,1.2fr)_110px_100px_minmax(160px,1fr)_90px_170px] lg:items-center">
      <div>
        <div className="mb-1 text-xs text-brand-textSub lg:hidden">검사 ID</div>
        <div className="font-mono text-brand-textMain">{inspection.inspectionId}</div>
      </div>
      <div>
        <div className="mb-1 text-xs text-brand-textSub lg:hidden">S/N</div>
        <div className="text-brand-textSub">{inspection.serialNo}</div>
      </div>
      <div>
        <div className="mb-1 text-xs text-brand-textSub lg:hidden">AI 판정</div>
        <span className={`inline-flex min-w-14 justify-center rounded-md border px-2.5 py-1 text-xs font-bold ${inspectionResultClass(inspection.result)}`}>
          {inspectionResultLabel(inspection.result)}
        </span>
      </div>
      <div>
        <div className="mb-1 text-xs text-brand-textSub lg:hidden">신뢰도</div>
        <span className={`font-semibold ${confidenceClass(inspection.confidence)}`}>{formatPercent(inspection.confidence)}</span>
      </div>
      <div>
        <div className="mb-1 text-xs text-brand-textSub lg:hidden">결함 유형</div>
        {defectTypes.length === 0 ? (
          <span className="text-brand-textSub">-</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {defectTypes.map((defectType) => (
              <span key={defectType} className="rounded-md border border-brand-border px-2 py-1 text-xs font-medium text-brand-textSub">
                {defectTypeLabel(defectType)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="mb-1 text-xs text-brand-textSub lg:hidden">결함 수</div>
        <div className="text-brand-textSub">{inspection.defects.length.toLocaleString()}건</div>
      </div>
      <div>
        <div className="mb-1 text-xs text-brand-textSub lg:hidden">검사 시각</div>
        <div className="text-brand-textSub">{formatDateTime(inspection.inspectedAt)}</div>
      </div>
    </div>
  );
}
