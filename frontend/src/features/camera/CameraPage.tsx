import { Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const cameras = [
  {
    name: '1번 카메라',
    url: '/camera-view-1/',
  },
  {
    name: '2번 카메라',
    url: '/camera-view-2/',
  },
];

export function CameraPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">카메라 모니터링</h1>
        <p className="mt-1 text-sm text-brand-textSub">공정 라인의 촬영 상태를 직접 확인해 검사 이미지의 원인을 빠르게 대조합니다.</p>
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {cameras.map((camera) => (
          <Card key={camera.name}>
            <CardHeader>
              <CardTitle><Camera className="w-5 h-5 text-brand-info" /> {camera.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-brand-border bg-black">
                <iframe
                  title={`${camera.name} stream`}
                  src={camera.url}
                  className="h-full w-full"
                  allow="autoplay; fullscreen"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
