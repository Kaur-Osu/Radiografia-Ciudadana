import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { EvolucionDato } from '@/types';

interface ParticipationLineChartProps {
  data: EvolucionDato[];
  title?: string;
}

export function ParticipationLineChart({ data }: ParticipationLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Sin datos históricos disponibles</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="anio"
            type="number"
            domain={['dataMin - 1', 'dataMax + 1']}
            ticks={data.map((d) => d.anio)}
            tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
            axisLine={false}
            tickFormatter={(val) => `${val?.toFixed(0)}%`}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            labelFormatter={(label) => `Año Electoral ${label}`}
            formatter={(value) => [value != null ? `${Number(value).toFixed(2)}%` : 'N/D', 'Participación']}
          />
          <Legend verticalAlign="top" align="right" height={36} />

          <Line isAnimationActive={false}
            name="Participación Nacional (%)"
            type="monotone"
            dataKey="participacion_pct"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff', r: 5 }}
            activeDot={{ r: 7, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
