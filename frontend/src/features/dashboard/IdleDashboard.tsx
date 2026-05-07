import { ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { CommandHistoryTable } from './components/CommandHistoryTable';
import { EnvironmentStatusCard } from './components/EnvironmentStatusCard';
import { InspectionTable } from './components/InspectionTable';
import { ProcessControlCard } from './components/ProcessControlCard';
import type { DashboardViewProps } from './dashboardTypes';
import { defectRateClass } from './dashboardUtils';
import { formatNumber } from '../../utils/format';

export function IdleDashboard({
  commands,
  environmentData,
  inspections,
  loading,
  onStartProcess,
  onStopProcess,
  processStatus,
}: DashboardViewProps) {
  const totalInspections = inspections.length;
  const defects = inspections.filter((item) => item.result === 'BAD').length;
  const defectRate = totalInspections > 0 ? (defects / totalInspections) * 100 : 0;
  const defectRateBadgeClass = defectRateClass(defectRate);

  return (
    <>
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ProcessControlCard
          isRunning={false}
          loading={loading}
          onStartProcess={onStartProcess}
          onStopProcess={onStopProcess}
          processStatus={processStatus}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-wrap gap-3">
            <CardTitle>
              <ClipboardCheck className="w-5 h-5 text-brand-success" />
              최근 검사 결과
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-brand-textSub">
                <span>최근 20건 기준</span>
              <span className={`rounded-full border px-2.5 py-1 font-semibold ${defectRateBadgeClass}`}>
                불량률 {totalInspections > 0 ? `${formatNumber(defectRate)}%` : '-'}
              </span>
              <span className={`rounded-full border px-2.5 py-1 font-semibold ${defectRateBadgeClass}`}>
                불량 {defects.toLocaleString()}건
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
                <InspectionTable inspections={inspections.slice(0, 5)} />
            </div>
          </CardContent>
        </Card>

        <EnvironmentStatusCard environmentData={environmentData} />
      </section>

      <CommandHistoryTable commands={commands} />
    </>
  );
}
