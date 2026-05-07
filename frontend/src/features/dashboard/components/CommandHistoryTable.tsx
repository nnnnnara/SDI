import { History } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ControlCommandResponse } from '../../../api/client';
import { Badge } from '../../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/Card';
import { formatDateTime } from '../../../utils/format';
import { commandTypeLabel, statusVariant } from '../dashboardUtils';

export function CommandHistoryTable({ commands }: { commands: ControlCommandResponse[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <History className="w-5 h-5 text-brand-primary" /> 최근 제어 명령
        </CardTitle>
        <span className="text-xs text-brand-textSub">최근 8건</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
              <tr>
                <th className="px-5 py-3 font-medium">명령 ID</th>
                <th className="px-5 py-3 font-medium">공정 ID</th>
                <th className="px-5 py-3 font-medium">명령</th>
                <th className="px-5 py-3 font-medium">상태</th>
                <th className="px-5 py-3 font-medium">요청 시각</th>
                <th className="px-5 py-3 font-medium">요청자</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((command) => (
                <tr key={command.commandId} className="border-t border-brand-border/60">
                  <td className="px-5 py-3 font-mono text-brand-textMain">{command.commandId}</td>
                  <td className="px-5 py-3 text-brand-textSub">
                    {command.runId ? (
                      <Link className="text-brand-primary hover:underline" to={`/history/${command.runId}`}>
                        RUN-{command.runId}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-5 py-3 text-brand-textMain">{commandTypeLabel(command.commandType)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant(command.commandStatus)}>{command.commandStatus}</Badge>
                  </td>
                  <td className="px-5 py-3 text-brand-textSub">{formatDateTime(command.issuedAt)}</td>
                  <td className="px-5 py-3 text-brand-textMain">{command.user?.name ?? '-'}</td>
                </tr>
              ))}
              {commands.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-brand-textSub" colSpan={6}>
                    최근 제어 명령이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
