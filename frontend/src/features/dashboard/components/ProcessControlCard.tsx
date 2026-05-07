import { Activity, Camera, Play, Square } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProcessRunResponse } from '../../../api/client';
import { Badge } from '../../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/Card';
import { formatDateTime } from '../../../utils/format';
import { cameraStreams, processStatusLabel, statusVariant } from '../dashboardUtils';

interface Props {
  isRunning: boolean;
  loading: boolean;
  onStartProcess: () => void;
  onStopProcess: () => void;
  processStatus: ProcessRunResponse | null;
}

export function ProcessControlCard({ isRunning, loading, onStartProcess, onStopProcess, processStatus }: Props) {
  return (
    <Card className={`${isRunning ? 'xl:col-span-3 border-brand-success/40' : 'xl:col-span-3'}`}>
      <CardHeader>
        <CardTitle>
          <Activity className={`w-5 h-5 ${isRunning ? 'text-brand-success' : 'text-brand-primary'}`} />
          현재 공정
        </CardTitle>
        {processStatus?.status && (
          <Badge variant={statusVariant(processStatus.status)}>{processStatusLabel(processStatus.status)}</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto]">
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <dt className="text-brand-textSub">공정 ID</dt>
              <dd className="mt-1 font-mono text-2xl font-bold text-brand-textMain">
                {processStatus?.runId ? `RUN-${processStatus.runId}` : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-brand-textSub">시작 시각</dt>
              <dd className="mt-1 text-brand-textMain">{formatDateTime(processStatus?.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-brand-textSub">시작자</dt>
              <dd className="mt-1 text-brand-textMain">{processStatus?.startedBy?.name ?? '-'}</dd>
            </div>
          </dl>

          <div className="grid grid-cols-2 gap-3 lg:w-56">
            <button
              onClick={onStartProcess}
              disabled={isRunning || loading}
              className="inline-flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-brand-success/30 bg-brand-success/10 text-brand-success disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="w-6 h-6" />
              <span className="font-bold">시작</span>
            </button>
            <button
              onClick={onStopProcess}
              disabled={!isRunning || loading}
              className="inline-flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-brand-danger/30 bg-brand-danger/10 text-brand-danger disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Square className="w-6 h-6" />
              <span className="font-bold">중지</span>
            </button>
          </div>
        </div>

        {isRunning ? (
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
            {cameraStreams.map((camera) => (
              <div key={camera.name} className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-textMain">
                  <Camera className="h-4 w-4 text-brand-info" />
                  {camera.name}
                </div>
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-brand-border bg-black">
                  <iframe
                    title={`${camera.name} dashboard stream`}
                    src={camera.url}
                    className="h-full w-full"
                    allow="autoplay; fullscreen"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-brand-border bg-brand-background/40 px-4 py-3 text-sm text-brand-textSub">
            현재 진행 중인 공정이 없습니다.
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4">
          {isRunning && <p className="text-sm text-brand-textSub">카메라와 환경 상태를 우선 확인하세요.</p>}
          {processStatus?.runId && (
            <Link
              to={`/history/${processStatus.runId}`}
              className="rounded-lg border border-brand-primary/50 px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10"
            >
              공정 상세 보기
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
