import type { InspectionResponse } from '../../../api/client';
import { Badge } from '../../../components/common/Badge';
import { formatDateTime, formatNumber } from '../../../utils/format';
import { inspectionVariant } from '../dashboardUtils';

export function InspectionSummary({ inspection }: { inspection: InspectionResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-lg font-semibold text-brand-textMain">{inspection.serialNo}</span>
        <Badge variant={inspectionVariant(inspection.result)}>{inspection.result}</Badge>
      </div>
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-4">
          <dt className="whitespace-nowrap text-brand-textSub">검사 시각</dt>
          <dd className="text-brand-textMain">{formatDateTime(inspection.inspectedAt)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="whitespace-nowrap text-brand-textSub">신뢰도</dt>
          <dd className="text-brand-textMain">{formatNumber(Number(inspection.confidence) * 100)}%</dd>
        </div>
      </dl>
    </div>
  );
}
