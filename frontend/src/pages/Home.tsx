import { errorMessage } from '@/services/errors';
import type { Eleccion, EleccionResumen, IndicadorTerritorio, EvolucionDato } from '@/types';
import { useState, useEffect } from 'react';

import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { electionsService } from '@/services/elections';
import { participationService } from '@/services/participation';
import { ParticipationLineChart } from '@/components/charts/ParticipationLineChart';
import { EntityRankingChart } from '@/components/charts/EntityRankingChart';
import { MexicoChoropleth } from '@/components/charts/MexicoChoropleth';
import {
  formatParticipation,
  formatVariation,
  formatNumber,
} from '@/utils/formatters';

export function Home() {
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [eleccionSeleccionada, setEleccionSeleccionada] = useState<number | null>(null);
  const [resumen, setResumen] = useState<EleccionResumen | null>(null);
  const [mapa, setMapa] = useState<IndicadorTerritorio[]>([]);
  const [historico, setHistorico] = useState<EvolucionDato[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    electionsService.listar().then(data => {
      if (!active) return;
      setElecciones(data);
      setEleccionSeleccionada(data.at(-1)?.id ?? null);
      if (!data.length) { setError('No hay elecciones disponibles.'); setLoading(false); }
    }).catch(err => { if (active) { setError(errorMessage(err)); setLoading(false); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!eleccionSeleccionada) return;
    let active = true;
    Promise.allSettled([electionsService.resumen(eleccionSeleccionada), participationService.mapa(eleccionSeleccionada, 'ENTIDAD'), participationService.historico(0)])
      .then(([res, map, hist]) => {
        if (!active) return;
        if (res.status === 'rejected' && map.status === 'rejected' && hist.status === 'rejected') {
          setError(errorMessage(res.reason)); return;
        }
        setResumen(res.status === 'fulfilled' ? res.value : null);
        setMapa(map.status === 'fulfilled' ? map.value : []);
        setHistorico(hist.status === 'fulfilled' ? hist.value.datos : []);
        setWarnings([res, map, hist].flatMap(result => result.status === 'rejected' ? [errorMessage(result.reason)] : []));
      })
      .catch(err => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [eleccionSeleccionada]);

  const selectElection = (id: number) => { setLoading(true); setWarnings([]); setError(null); setEleccionSeleccionada(id); };

  if (loading) return <Spinner className="mx-auto mt-20" />;

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Panel General</h1>
            <p className="text-gray-600 dark:text-slate-300">
              Explora la participación electoral en México utilizando datos oficiales del INE.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Elección:</label>
            <select aria-label="Elección"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:border-slate-600"
              value={String(eleccionSeleccionada ?? '')}
              onChange={(e) => selectElection(Number(e.target.value))}
            >
              {elecciones.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.anio} - {e.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Panel General</h1>
          <p className="text-gray-600 dark:text-slate-300">
            Explora la participación electoral en México utilizando datos oficiales del INE.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Elección:</label>
          <select aria-label="Elección"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:border-slate-600"
            value={String(eleccionSeleccionada ?? '')}
            onChange={(e) => selectElection(Number(e.target.value))}
          >
            {elecciones.map((e) => (
              <option key={e.id} value={e.id}>
                {e.anio} - {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {warnings.length > 0 && <div role="status" className="rounded-lg p-4 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200">{warnings.join(" · ")}</div>}

      {/* Tarjetas de indicadores */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Participación">
            <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {formatParticipation(resumen.participacion_pct)}
            </div>
            <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">del electorado</p>
          </Card>
          <Card title="Sin marca de voto">
            <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {formatParticipation(resumen.abstencion_pct)}
            </div>
            <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">no votaron o no especificado (NV + NS)</p>
          </Card>
          <Card title="Electores">
            <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {formatNumber(resumen.electores)}
            </div>
            <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">en lista nominal</p>
          </Card>
          <Card title="Variación">
            <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {formatVariation((() => { const year = elecciones.find(e => e.id === eleccionSeleccionada)?.anio; const previous = historico.filter(h => h.anio < (year ?? 0)).sort((a,b) => b.anio - a.anio)[0]; return previous?.participacion_pct != null && resumen.participacion_pct != null ? resumen.participacion_pct - previous.participacion_pct : null; })())}
            </div>
            <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">vs elección anterior disponible</p>
          </Card>
        </div>
      )}

      {/* Mapa y resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Mapa de Participación por Entidad">
            <MexicoChoropleth data={mapa} title="Participación por Entidad Federativa" />
          </Card>
        </div>
        <div>
          <Card title="Ranking de Entidades">
            <EntityRankingChart data={mapa} title="Participación por Entidad" limit={10} />
          </Card>
        </div>
      </div>

      {/* Evolución histórica */}
      <Card title="Evolución Histórica de Participación">
        <ParticipationLineChart data={historico} title="Participación a través de las Elecciones" />
      </Card>

      <Card title="Hallazgos de la elección seleccionada">
        <p className="text-slate-700 dark:text-slate-300">{mapa.length ? (() => { const ranked = [...mapa].filter(t => t.participacion_pct != null).sort((a,b) => (b.participacion_pct ?? 0)-(a.participacion_pct ?? 0)); return ranked.length ? `${ranked[0].territorio_nombre} registra la mayor participación: ${formatParticipation(ranked[0].participacion_pct)}.` : 'Sin indicadores disponibles.'; })() : 'Sin datos disponibles.'}</p>
      </Card>
    </div>
  );
}