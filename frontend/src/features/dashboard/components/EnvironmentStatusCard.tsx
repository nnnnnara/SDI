import { Gauge, Timer } from 'lucide-react';
import type { EnvironmentLogResponse } from '../../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/Card';
import { formatDateTime, formatNumber } from '../../../utils/format';

export function EnvironmentStatusCard({ environmentData }: { environmentData: EnvironmentLogResponse | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Gauge className="w-5 h-5 text-brand-info" /> 환경 상태
        </CardTitle>
        <span className="text-xs text-brand-textSub">최신 센서값</span>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-brand-textSub">온도</dt>
            <dd className="text-brand-textMain">{formatNumber(environmentData?.temperature)} C</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-brand-textSub">습도</dt>
            <dd className="text-brand-textMain">{formatNumber(environmentData?.humidity)}%</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-brand-textSub">PM2.5</dt>
            <dd className="text-brand-textMain">{formatNumber(environmentData?.pm25)} ug/m3</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-brand-textSub">PM10</dt>
            <dd className="text-brand-textMain">{formatNumber(environmentData?.pm10)} ug/m3</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-brand-border pt-4">
            <dt className="text-brand-textSub">측정 시각</dt>
            <dd className="text-brand-textMain">{formatDateTime(environmentData?.measuredAt)}</dd>
          </div>
        </dl>
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-brand-border bg-brand-background/40 px-3 py-2 text-xs text-brand-textSub">
          <Timer className="mt-0.5 h-4 w-4 shrink-0 text-brand-info" />
          <span>최근 센서 로그 기준입니다.</span>
        </div>
      </CardContent>
    </Card>
  );
}
