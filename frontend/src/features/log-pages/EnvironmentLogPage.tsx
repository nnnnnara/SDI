import { useCallback, useEffect, useMemo, useState } from 'react';
import { CloudFog, Search } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
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

function average(values: Array<number | null>) {
  const validValues = values.filter((value): value is number => value !== null);
  if (validValues.length === 0) return null;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function trend(current?: number | null, previous?: number | null) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return { symbol: '━', className: 'text-brand-textSub', diff };
  if (diff > 0) return { symbol: '▲', className: 'text-brand-danger', diff };
  return { symbol: '▼', className: 'text-brand-info', diff };
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

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()),
    [logs]
  );

  const tableLogs = useMemo(() => [...sortedLogs].reverse(), [sortedLogs]);

  const chartData = useMemo(() => sortedLogs.map((log) => ({
    time: formatTime(log.measuredAt),
    temperature: toChartNumber(log.temperature),
    humidity: toChartNumber(log.humidity),
    pm25: toChartNumber(log.pm25),
    pm10: toChartNumber(log.pm10),
  })), [sortedLogs]);

  const averages = useMemo(() => ({
    temperature: average(chartData.map((item) => item.temperature)),
    humidity: average(chartData.map((item) => item.humidity)),
    pm25: average(chartData.map((item) => item.pm25)),
    pm10: average(chartData.map((item) => item.pm10)),
  }), [chartData]);

  const hasChartData = chartData.some((item) => (
    item.temperature !== null || item.humidity !== null || item.pm25 !== null || item.pm10 !== null
  ));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-textMain">환경 로그</h1>
          <p className="mt-1 text-sm text-brand-textSub">온습도와 미세먼지 변화를 나눠 보고, 검사 환경의 이상 징후를 파악합니다.</p>
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

      {hasChartData ? (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EnvironmentChartCard
            title="온습도"
            count={logs.length}
            metrics={[
              { key: 'temperature', name: '온도 측정치', averageName: '온도 평균', color: '#f59e0b', average: averages.temperature, unit: 'C' },
              { key: 'humidity', name: '습도 측정치', averageName: '습도 평균', color: '#0ea5e9', average: averages.humidity, unit: '%' },
            ]}
            data={chartData}
          />
          <EnvironmentChartCard
            title="미세먼지"
            count={logs.length}
            metrics={[
              { key: 'pm25', name: 'PM2.5 측정치', averageName: 'PM2.5 평균', color: '#06b6d4', average: averages.pm25, unit: 'ug/m3' },
              { key: 'pm10', name: 'PM10 측정치', averageName: 'PM10 평균', color: '#3b82f6', average: averages.pm10, unit: 'ug/m3' },
            ]}
            data={chartData}
          />
        </section>
      ) : (
        <Card>
          <CardContent>
            <div className="flex min-h-32 items-center justify-center text-sm text-brand-textSub">
              {loading ? '환경 데이터를 불러오는 중입니다.' : '조회 조건에 해당하는 환경 데이터가 없습니다.'}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>측정 로그</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-background/50 text-left text-xs uppercase text-brand-textSub">
                <tr>
                  <th className="px-5 py-3 font-medium">시각</th>
                  <th className="px-5 py-3 font-medium">온도</th>
                  <th className="px-5 py-3 font-medium">습도</th>
                  <th className="px-5 py-3 font-medium">PM2.5</th>
                  <th className="px-5 py-3 font-medium">PM10</th>
                </tr>
              </thead>
              <tbody>
                {tableLogs.map((log, index) => {
                  const previous = tableLogs[index + 1];

                  return (
                    <tr key={log.envLogId} className="border-t border-brand-border/60">
                      <td className="px-5 py-3 text-brand-textSub">{formatDateTime(log.measuredAt)}</td>
                      <TrendValue value={log.temperature} previous={previous?.temperature} unit="C" />
                      <TrendValue value={log.humidity} previous={previous?.humidity} unit="%" />
                      <TrendValue value={log.pm25} previous={previous?.pm25} unit="ug/m3" />
                      <TrendValue value={log.pm10} previous={previous?.pm10} unit="ug/m3" />
                    </tr>
                  );
                })}
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

interface ChartMetric {
  key: 'temperature' | 'humidity' | 'pm25' | 'pm10';
  name: string;
  averageName: string;
  color: string;
  average: number | null;
  unit: string;
}

function EnvironmentChartCard({ title, count, data, metrics }: { title: string; count: number; data: Array<Record<string, number | string | null>>; metrics: ChartMetric[] }) {
  return (
    <Card>
      <CardHeader className="items-start gap-3">
        <div>
          <CardTitle>
            <CloudFog className="w-5 h-5 text-brand-info" /> {title}
          </CardTitle>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {metrics.map((metric) => (
              <span key={metric.key} className="rounded-full border border-brand-border bg-brand-background/40 px-2.5 py-1 text-brand-textSub">
                {metric.averageName} <strong className="text-brand-textMain">{formatNumber(metric.average)} {metric.unit}</strong>
              </span>
            ))}
          </div>
        </div>
        <span className="text-xs text-brand-textSub">{count.toLocaleString()}건</span>
      </CardHeader>
      <CardContent>
        <div className="h-80 min-h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
              <Legend />
              {metrics.map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.name}
                  stroke={metric.color}
                  dot={{ r: 1.5, stroke: metric.color, fill: metric.color }}
                  activeDot={{ r: 4, stroke: metric.color, fill: metric.color }}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
              {metrics.map((metric) => metric.average !== null && (
                <ReferenceLine
                  key={`${metric.key}-average`}
                  y={metric.average}
                  stroke={metric.color}
                  strokeDasharray="5 5"
                  label={{ value: metric.averageName, fill: metric.color, fontSize: 11 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendValue({ value, previous, unit }: { value?: number | null; previous?: number | null; unit: string }) {
  const trendInfo = trend(value, previous);

  return (
    <td className="px-5 py-3 text-brand-textMain">
      <span>{formatNumber(value)} {unit}</span>
      {trendInfo && (
        <span className={`ml-2 text-xs font-semibold ${trendInfo.className}`} title={`이전 측정 대비 ${formatNumber(Math.abs(trendInfo.diff))} ${unit}`}>
          {trendInfo.symbol}
        </span>
      )}
    </td>
  );
}
