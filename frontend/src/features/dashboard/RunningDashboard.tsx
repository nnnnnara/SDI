import { ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { CommandHistoryTable } from './components/CommandHistoryTable';
import { InspectionSummary } from './components/InspectionSummary';
import { ProcessControlCard } from './components/ProcessControlCard';
import type { DashboardViewProps } from './dashboardTypes';
import { latestByInspectedAt } from './dashboardUtils';

export function RunningDashboard({
  commands,
  currentProcessInspections,
  loading,
  onStartProcess,
  onStopProcess,
  processStatus,
}: DashboardViewProps) {
  const latestCurrentInspection = latestByInspectedAt(currentProcessInspections);

  return (
    <>
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ProcessControlCard
          isRunning
          loading={loading}
          onStartProcess={onStartProcess}
          onStopProcess={onStopProcess}
          processStatus={processStatus}
        />
      </section>

      <section className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="flex-wrap gap-3">
            <CardTitle>
              <ClipboardCheck className="w-5 h-5 text-brand-success" />
              현재 공정 최신 검사
            </CardTitle>
            <span className="text-xs text-brand-textSub">현재 RUN 기준</span>
          </CardHeader>
          <CardContent>
            {latestCurrentInspection ? (
              <InspectionSummary inspection={latestCurrentInspection} />
            ) : (
              <p className="text-sm text-brand-textSub">현재 공정의 검사 결과가 존재하지 않습니다.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <CommandHistoryTable commands={commands} />
    </>
  );
}
