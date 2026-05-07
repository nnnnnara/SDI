import type { InspectionResponse } from '../../../api/client';
import { formatDateTime, formatPercent } from '../../../utils/format';
import { inspectionResultClass, inspectionResultLabel } from '../../inspection/inspectionUtils';

export function InspectionSummary({ inspection }: { inspection: InspectionResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-lg font-semibold text-brand-textMain">{inspection.serialNo}</span>
        <span className={`inline-flex min-w-14 justify-center rounded-md border px-2.5 py-1 text-xs font-bold ${inspectionResultClass(inspection.result)}`}>
          {inspectionResultLabel(inspection.result)}
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-4">
          <dt className="whitespace-nowrap text-brand-textSub">검사 시각</dt>
          <dd className="text-brand-textMain">{formatDateTime(inspection.inspectedAt)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="whitespace-nowrap text-brand-textSub">신뢰도</dt>
          <dd className="text-brand-textMain">{formatPercent(inspection.confidence)}</dd>
        </div>
      </dl>
    </div>
  );
}
