import { useEffect, useMemo, useState } from 'react';
import { CloudFog } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { apiClient } from '../../api/client';
import type { ApiResponse, EnvironmentLogResponse } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime, formatNumber, formatTime, isoHoursAgo, isoNow } from '../../utils/format';

export function EnvironmentLogPage() {
  const [logs, setLogs] = useState<EnvironmentLogResponse[]>([]);

  useEffect(() => {
    apiClient
      .get<ApiResponse<EnvironmentLogResponse[]>>('/logs/environment', {
        params: { start: isoHoursAgo(24), end: isoNow() },
      })
      .then((res) => setLogs(res.data.data || []))
      .catch((error) => console.error('Failed to fetch environment logs:', error));
  }, []);

  const chartData = useMemo(() => logs.map((log) => ({
    time: formatTime(log.measuredAt),
    temperature: Number(log.temperature),
    humidity: Number(log.humidity),
    pm25: Number(log.pm25),
    pm10: Number(log.pm10),
  })), [logs]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-brand-textMain">환경 로그</h1>
        <p className="mt-1 text-sm text-brand-textSub">최근 24시간의 온도, 습도, 미세먼지 변화를 추적합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><CloudFog className="w-5 h-5 text-brand-info" /> 환경 추이</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
              <Legend />
              <Line type="monotone" dataKey="temperature" name="온도" stroke="#f59e0b" dot={false} />
              <Line type="monotone" dataKey="humidity" name="습도" stroke="#0ea5e9" dot={false} />
              <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#06b6d4" dot={false} />
              <Line type="monotone" dataKey="pm10" name="PM10" stroke="#3b82f6" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>측정 내역</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
              <tr>
                <th className="px-5 py-3 font-medium">시간</th>
                <th className="px-5 py-3 font-medium">온도</th>
                <th className="px-5 py-3 font-medium">습도</th>
                <th className="px-5 py-3 font-medium">PM2.5</th>
                <th className="px-5 py-3 font-medium">PM10</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.envLogId} className="border-t border-brand-border/60">
                  <td className="px-5 py-3 text-brand-textSub">{formatDateTime(log.measuredAt)}</td>
                  <td className="px-5 py-3 text-brand-textMain">{formatNumber(log.temperature)}°C</td>
                  <td className="px-5 py-3 text-brand-textMain">{formatNumber(log.humidity)}%</td>
                  <td className="px-5 py-3 text-brand-textMain">{formatNumber(log.pm25)}㎍/㎥</td>
                  <td className="px-5 py-3 text-brand-textMain">{formatNumber(log.pm10)}㎍/㎥</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
