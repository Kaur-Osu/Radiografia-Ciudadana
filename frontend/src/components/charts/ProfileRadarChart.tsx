import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ProfileRadarChartProps {
  indicadores: Record<string, number | null> | null;
  title?: string;
}

export function ProfileRadarChart({ indicadores }: ProfileRadarChartProps) {
  if (!indicadores) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
        <p className="text-gray-500 text-sm dark:text-slate-400">Sin indicadores de perfil disponibles</p>
      </div>
    );
  }

  const participacionActual = indicadores.participacion_actual ?? 0;
  const participacionReferencia = indicadores.participacion_referencia ?? 0;
  const diferenciaReferencia = Math.abs(indicadores.diferencia_referencia_pp ?? 0);
  const variacionHistorica = Math.abs(indicadores.variacion_pp ?? 0);

  const radarData = [
    {
      indicador: 'Participación', original: participacionActual, unidad: '%',
      valor: Math.min(participacionActual, 100),
      full: 100,
    },
    {
      indicador: 'Media nac.', original: participacionReferencia, unidad: '%',
      valor: Math.min(participacionReferencia, 100),
      full: 100,
    },
    {
      indicador: 'Diferencia ×10', original: indicadores.diferencia_referencia_pp, unidad: 'pp',
      valor: Math.min(diferenciaReferencia * 10, 100),
      full: 100,
    },
    {
      indicador: 'Cambio ×10', original: indicadores.variacion_pp, unidad: 'pp',
      valor: Math.min(variacionHistorica * 10, 100),
      full: 100,
    },
  ];

  return (
    <div className="h-80 w-full mb-10">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={radarData}
          outerRadius="60%"
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        >
          <PolarGrid stroke="var(--chart-grid)" />
          <PolarAngleAxis dataKey="indicador" tick={{ fontSize: 10, fill: 'var(--chart-text)' }} />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'var(--chart-text)' }}
            tickFormatter={(val) => String(val)}
          />
          <Tooltip formatter={(_value, _name, item) => item.payload?.original == null ? 'Sin referencia anterior' : `${Number(item.payload.original).toFixed(2)} ${item.payload.unidad}`} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
          <Radar isAnimationActive={false} dataKey="valor" stroke="var(--chart-primary)" fill="var(--chart-primary)" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500 dark:text-slate-400">Las diferencias se muestran en magnitud absoluta ×10 (máximo 100). Al señalar un punto se muestra el valor real con su signo y unidad.</p>
    </div>
  );
}