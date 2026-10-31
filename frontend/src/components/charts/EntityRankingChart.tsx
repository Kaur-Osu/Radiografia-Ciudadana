import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { IndicadorTerritorio } from '@/types';

const COLORS = ['#b50074', '#b94491', '#cf6eaf', '#86519e', '#ad86bf'];

interface EntityRankingChartProps {
  data: IndicadorTerritorio[];
  title?: string;
  limit?: number;
}

export function EntityRankingChart({ data, limit = 10 }: EntityRankingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
        <p className="text-gray-500 text-sm dark:text-slate-400">Sin datos disponibles para este ranking</p>
      </div>
    );
  }

  const sortedData = data
    .filter((d) => d.participacion_pct != null)
    .sort((a, b) => (b.participacion_pct || 0) - (a.participacion_pct || 0))
    .slice(0, limit);

  return (
    <div className="w-full overflow-y-auto" style={{ maxHeight: 520 }}><div style={{ height: Math.max(300, sortedData.length * 34 + 50), minWidth: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 30, bottom: 40, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
          <XAxis dataKey="participacion_pct" type="number" axisLine={false} domain={[0, 100]} tickFormatter={value => `${value}%`} tick={{ fontSize: 10, fill: 'var(--chart-text)' }} />
          <YAxis
            dataKey="territorio_nombre"
            type="category" width={125}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--chart-text)' }}
            tickFormatter={(label) => (label?.length || 0) > 20 ? `${label.slice(0, 20)}...` : label}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            labelFormatter={(label) => String(label)}
            formatter={(value) => value != null ? `${Number(value).toFixed(2)} %` : 'N/D'}
          />
          <Bar isAnimationActive={false} dataKey="participacion_pct" radius={4} background={{ radius: 4, fill: 'var(--chart-track)' }}>
            {sortedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div></div>
  );
}