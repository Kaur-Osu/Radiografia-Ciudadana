import { PageHeader } from '@/components/common/PageHeader';
import { territoriesService } from '@/services/territories';
import { errorMessage } from '@/services/errors';
import type { Eleccion } from '@/types';
import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { electionsService } from '@/services/elections';
import { participationService } from '@/services/participation';
import { ElectionComparisonChart } from '@/components/charts/ElectionComparisonChart';
import {
  formatParticipation,
  formatVariation,
  getVariationColor,
  getVariationLabel,
} from '@/utils/formatters';

export function Comparator() {
  const [territorios, setTerritorios] = useState<import('@/types').Territorio[]>([]);
  const [territorio, setTerritorio] = useState(0);
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [eleccionInicial, setEleccionInicial] = useState<number | null>(null);
  const [eleccionFinal, setEleccionFinal] = useState<number | null>(null);
  const [comparacion, setComparacion] = useState<import('@/types').ComparacionHistorica | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([electionsService.listar(), territoriesService.listar('ENTIDAD')])
      .then(([elecs, terrs]) => { if (!elecs.length) setError('No hay elecciones disponibles.'); setElecciones(elecs); setTerritorios(terrs); })
      .catch((err: unknown) => setError(errorMessage(err)));
  }, []);

  const handleComparar = async () => {
    if (!eleccionInicial || !eleccionFinal || eleccionInicial === eleccionFinal) return;
    setLoading(true);
    setError(null);
    setComparacion(null);
    try {
      const data = await participationService.comparar(
        eleccionInicial,
        eleccionFinal,
        territorio
      );
      setComparacion(data);
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="mx-auto mt-20" />;

  return (
    <div className="space-y-8">
      <PageHeader title="Comparador Histórico" description="Dos elecciones, una perspectiva más amplia. Compara la participación nacional o elige una entidad para observar sus cambios." eyebrow="OBSERVAR EL CAMBIO" />

      <Card title="Seleccionar Elecciones">
        <div className="analysis-filters grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Elección Inicial</label>
            <select aria-label="Elección inicial"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:border-slate-600"
              value={eleccionInicial || ''}
              onChange={(e) => { setComparacion(null); setEleccionInicial(Number(e.target.value)); }}
            >
              <option value="">Seleccionar...</option>
              {elecciones.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.anio} - {e.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Elección Final</label>
            <select aria-label="Elección final"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:border-slate-600"
              value={eleccionFinal || ''}
              onChange={(e) => { setComparacion(null); setEleccionFinal(Number(e.target.value)); }}
            >
              <option value="">Seleccionar...</option>
              {elecciones.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.anio} - {e.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="comparison-territory" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Territorio</label>
            <select aria-label="Territorio" id="comparison-territory" value={territorio} onChange={e => { setComparacion(null); setTerritorio(Number(e.target.value)); }} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2">
              <option value={0}>México (Nacional)</option>
              {territorios.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleComparar}
              disabled={loading || !eleccionInicial || !eleccionFinal || eleccionInicial === eleccionFinal}
              className="primary-button w-full"
            >
              Comparar
            </button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {comparacion && (
        <div className="space-y-6">
          <Card title={`Comparación: ${comparacion.eleccion_inicial_anio} vs ${comparacion.eleccion_final_anio}`}>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{comparacion.territorio_nombre}</p>
            <ElectionComparisonChart data={comparacion} />
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title={String(comparacion.eleccion_inicial_anio)}>
              <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                {formatParticipation(comparacion.participacion_inicial)}
              </div>
              <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">Participación inicial</p>
            </Card>
            <Card title={String(comparacion.eleccion_final_anio)}>
              <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                {formatParticipation(comparacion.participacion_final)}
              </div>
              <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">Participación final</p>
            </Card>
            <Card title="Variación (pp)">
              <div className={cn('text-3xl font-bold', getVariationColor(comparacion.variacion_pp))}>
                {formatVariation(comparacion.variacion_pp)}
              </div>
              <Badge variant={comparacion.variacion_pp! > 3 ? 'success' : comparacion.variacion_pp! < -3 ? 'danger' : 'warning'}>
                {getVariationLabel(comparacion.variacion_pp)}
              </Badge>
            </Card>
          </div>
        </div>
      )}

      {!comparacion && !error && (
        <div className="p-8 bg-gray-50 rounded-lg text-center dark:bg-slate-800">
          <p className="text-gray-500 dark:text-slate-400">
            Selecciona dos elecciones para ver la comparación de participación.
          </p>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}