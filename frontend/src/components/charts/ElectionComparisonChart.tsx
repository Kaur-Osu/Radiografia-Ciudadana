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
import type { ComparacionHistorica } from '@/types';

const COLORS = ['#ad86bf', '#b50074'];

interface ElectionComparisonChartProps {
  data: ComparacionHistorica;
  title?: string;
}

export function ElectionComparisonChart({ data }: ElectionComparisonChartProps) {
  const chartData = [
    { eleccion: data.eleccion_inicial_anio.toString(), participacion: data.participacion_inicial ?? 0 },
    { eleccion: data.eleccion_final_anio.toString(), participacion: data.participacion_final ?? 0 },
  ];

  if (data.participacion_inicial == null || data.participacion_final == null) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
        <p className="text-gray-500 text-sm dark:text-slate-400">Sin datos de comparación disponibles</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 40, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="eleccion" axisLine={false} tick={{ fontSize: 13, fill: 'var(--chart-text)', fontWeight: 600 }} />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
            axisLine={false}
            tickFormatter={(val) => `${val?.toFixed(0)}%`}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            labelFormatter={(label) => `Elección ${label}`}
            formatter={(value) => value != null ? `${Number(value).toFixed(2)}%` : 'N/D'}
          />
          <Bar isAnimationActive={false} dataKey="participacion" radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}