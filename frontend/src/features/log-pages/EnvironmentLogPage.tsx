import { useCallback, useEffect, useMemo, useState } from 'react';
import { CloudFog, Search } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { apiClient } from '../../api/client';
import type { ApiResponse, EnvironmentLogResponse } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { formatDateTime, formatNumber, formatTime } from '../../utils/format';

function toLocalDateTimeInput(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function toBackendDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function toChartNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function EnvironmentLogPage() {
  const [logs, setLogs] = useState<EnvironmentLogResponse[]>([]);
  const [start, setStart] = useState(() => toLocalDateTimeInput(new Date(Date.now() - 24 * 60 * 60 * 1000)));
  const [end, setEnd] = useState(() => toLocalDateTimeInput(new Date()));
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<EnvironmentLogResponse[]>>('/logs/environment', {
        params: { start: toBackendDateTime(start), end: toBackendDateTime(end) },
      });
      setLogs(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch environment logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [end, start]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const chartData = useMemo(() => logs.map((log) => ({
    time: formatTime(log.measuredAt),
    temperature: toChartNumber(log.temperature),
    humidity: toChartNumber(log.humidity),
    pm25: toChartNumber(log.pm25),
    pm10: toChartNumber(log.pm10),
  })), [logs]);

  const hasChartData = chartData.some((item) => (
    item.temperature !== null || item.humidity !== null || item.pm25 !== null || item.pm10 !== null
  ));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-textMain">환경 로그</h1>
          <p className="mt-1 text-sm text-brand-textSub">기간별 온도, 습도, 미세먼지 로그를 조회합니다.</p>
        </div>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void fetchLogs();
          }}
        >
          <label className="grid gap-1 text-xs font-medium text-brand-textSub">
            시작
            <input
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-textMain"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-brand-textSub">
            종료
            <input
              type="datetime-local"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-textMain"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="w-4 h-4" /> 조회
          </button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><CloudFog className="w-5 h-5 text-brand-info" /> 환경 추이 차트</CardTitle>
          <span className="text-xs text-brand-textSub">{logs.length.toLocaleString()}건</span>
        </CardHeader>
        <CardContent>
          {hasChartData ? (
            <div className="h-80 min-h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" name="온도" stroke="#f59e0b" dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls isAnimationActive={false} />
                  <Line type="monotone" dataKey="humidity" name="습도" stroke="#0ea5e9" dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls isAnimationActive={false} />
                  <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#06b6d4" dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls isAnimationActive={false} />
                  <Line type="monotone" dataKey="pm10" name="PM10" stroke="#3b82f6" dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-32 items-center justify-center text-sm text-brand-textSub">
              {loading ? '환경 추이를 불러오는 중입니다.' : '조회된 데이터가 없어 추이를 표시할 수 없습니다.'}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>측정 로그</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                    <td className="px-5 py-3 text-brand-textMain">{formatNumber(log.temperature)} C</td>
                    <td className="px-5 py-3 text-brand-textMain">{formatNumber(log.humidity)}%</td>
                    <td className="px-5 py-3 text-brand-textMain">{formatNumber(log.pm25)} ug/m3</td>
                    <td className="px-5 py-3 text-brand-textMain">{formatNumber(log.pm10)} ug/m3</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-brand-textSub" colSpan={5}>
                      {loading ? '측정 로그를 불러오는 중입니다.' : '조회된 환경 로그가 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
