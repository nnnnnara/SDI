import type { ReactNode } from 'react';
import { Card, CardContent } from '../../../components/common/Card';

interface Props {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon: ReactNode;
}

export function DashboardMetric({ label, value, helper, icon }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-textSub">{label}</p>
          <div className="mt-2 text-2xl font-bold text-brand-textMain">{value}</div>
          {helper && <div className="mt-1 text-xs text-brand-textSub">{helper}</div>}
        </div>
        <div className="ml-4 rounded-xl bg-brand-primary/10 p-3 text-brand-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
