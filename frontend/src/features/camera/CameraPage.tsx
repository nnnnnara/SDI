import { useMemo, useState } from 'react';
import { Camera, Image, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

type StreamMode = 'iframe' | 'img';

export function CameraPage() {
  const streamUrl = import.meta.env.VITE_CAMERA_STREAM_URL || '';
  const [mode, setMode] = useState<StreamMode>('iframe');

  const streamHost = useMemo(() => {
    if (!streamUrl) return '-';
    try {
      return new URL(streamUrl).host;
    } catch {
      return streamUrl;
    }
  }, [streamUrl]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-textMain">카메라 영상</h1>
          <p className="mt-1 text-sm text-brand-textSub">현장 카메라의 실시간 영상을 확인합니다.</p>
        </div>
        <div className="inline-flex rounded-lg border border-brand-border bg-brand-card p-1">
          <button
            type="button"
            onClick={() => setMode('iframe')}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${mode === 'iframe' ? 'bg-brand-primary text-white' : 'text-brand-textSub hover:text-brand-textMain'}`}
          >
            <Monitor className="w-4 h-4" /> 화면 보기
          </button>
          <button
            type="button"
            onClick={() => setMode('img')}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${mode === 'img' ? 'bg-brand-primary text-white' : 'text-brand-textSub hover:text-brand-textMain'}`}
          >
            <Image className="w-4 h-4" /> 영상만 보기
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><Camera className="w-5 h-5 text-brand-info" /> 실시간 스트림</CardTitle>
          <span className="text-xs text-brand-textSub">{streamHost}</span>
        </CardHeader>
        <CardContent>
          {streamUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-brand-border bg-black">
              {mode === 'iframe' ? (
                <iframe
                  title="Jetson Nano camera stream"
                  src={streamUrl}
                  className="h-full w-full"
                  allow="autoplay; fullscreen"
                />
              ) : (
                <img
                  src={streamUrl}
                  alt="Jetson Nano camera stream"
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-brand-border bg-brand-background px-6 text-center text-sm text-brand-textSub">
              카메라 스트림이 아직 설정되지 않았습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
