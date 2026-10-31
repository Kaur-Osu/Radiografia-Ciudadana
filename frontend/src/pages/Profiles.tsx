import { errorMessage } from '@/services/errors';
import type { Eleccion, Perfil, PerfilTerritorioOut } from '@/types';
import { territoriesService } from '@/services/territories';
import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { electionsService } from '@/services/elections';
import { profilesService } from '@/services/profiles';
import { ProfileRadarChart } from '@/components/charts/ProfileRadarChart';
import {
  formatParticipation,
  formatVariation,
} from '@/utils/formatters';



const getProfileBadgeStyle = (codigo: string) => {
  switch (codigo) {
    case 'PERF-01':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
    case 'PERF-02':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200';
    case 'PERF-03':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
    case 'PERF-05':
      return 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-200';
    case 'PERF-04':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
  }
};

export function Profiles() {
  const [territorios, setTerritorios] = useState<import('@/types').Territorio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [eleccionSeleccionada, setEleccionSeleccionada] = useState<number | null>(null);
  const [perfilTerritorio, setPerfilTerritorio] = useState<PerfilTerritorioOut | null>(null);
  const [territorioSeleccionado, setTerritorioSeleccionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([electionsService.listar(), profilesService.listar(), territoriesService.listar('ENTIDAD')])
      .then(([elecs, profs, terrs]) => {
        if (active) { if (!elecs.length) setError('No hay elecciones disponibles.'); setElecciones(elecs); setPerfiles(profs); setTerritorios(terrs); setEleccionSeleccionada(elecs.at(-1)?.id ?? null); }
      }).catch(err => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!territorioSeleccionado || !eleccionSeleccionada) return;
    let active = true;
    profilesService.obtenerPorTerritorio(territorioSeleccionado, eleccionSeleccionada)
      .then(data => { if (active) setPerfilTerritorio(data); })
      .catch(err => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [territorioSeleccionado, eleccionSeleccionada]);

  const selectTerritory = (id: number | null) => { setError(null); setPerfilTerritorio(null); setLoading(!!id); setTerritorioSeleccionado(id); };
  const selectElection = (id: number) => { setError(null); setPerfilTerritorio(null); setLoading(!!territorioSeleccionado); setEleccionSeleccionada(id); };

  const handleLimpiarSeleccion = () => {
    setLoading(false);
    setTerritorioSeleccionado(null);
    setPerfilTerritorio(null);
    setError(null);
  };

  if (loading && perfiles.length === 0) return <Spinner className='mx-auto mt-20' />;

  return (
    <div className='space-y-8 pb-12'>
      {error && <p role='alert' className='text-red-700 dark:text-red-300'>{error}</p>}
      {loading && <Spinner />}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>Perfiles Descriptivos de Participación</h1>
          <p className='text-sm text-slate-600 dark:text-slate-400 mt-1'>
            Identificación y caracterización estadística de patrones territoriales mediante reglas transparentes.
          </p>
        </div>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-0'>
          <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>Elección de Referencia:</label>
          <select aria-label="Elección de referencia"
            className='border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none'
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

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2 space-y-6'>
          <Card title='Consultar Perfil por Entidad Federativa'>
            <div className='flex flex-col sm:flex-row gap-4 items-end'>
              <div className='flex-1 w-full'>
                <label className='block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2'>Seleccionar Entidad</label>
                <select aria-label="Entidad federativa"
                  className='w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none'
                  value={territorioSeleccionado || ''}
                  onChange={(e) => selectTerritory(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value=''>-- Seleccione un estado --</option>
                  {territorios.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {territorioSeleccionado && (
                <div className='flex items-center'>
                  <button
                    onClick={handleLimpiarSeleccion}
                    className='px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors'
                  >
                    Limpiar selección
                  </button>
                </div>
              )}
            </div>
          </Card>

          {perfilTerritorio && (
            <Card title={'Diagnóstico Cívico: ' + perfilTerritorio.territorio_nombre}>
              {perfilTerritorio.perfil_principal && (
                <div className='flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700'>
                  <span className={'px-3 py-1 rounded-full text-xs font-bold border ' + getProfileBadgeStyle(perfilTerritorio.perfil_principal.codigo)}>
                    {perfilTerritorio.perfil_principal.codigo}
                  </span>
                  <div>
                    <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
                      {perfilTerritorio.perfil_principal.nombre}
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                      {perfilTerritorio.perfil_principal.descripcion}
                    </p>
                  </div>
                </div>
              )}

              {perfilTerritorio.indicadores && (
                <div className='space-y-6'>
                  <Card title='Análisis Multidimensional (Radar Cívico)'>
                    <ProfileRadarChart indicadores={perfilTerritorio.indicadores} />
                  </Card>
                  <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
                    <div className='p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
                      <div className='text-xs text-slate-500 dark:text-slate-400 uppercase'>Participación Actual</div>
                      <div className='text-2xl font-bold text-slate-900 dark:text-white mt-1'>
                        {formatParticipation(perfilTerritorio.indicadores.participacion_actual)}
                      </div>
                    </div>
                    <div className='p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
                      <div className='text-xs text-slate-500 dark:text-slate-400 uppercase'>Referencia Nacional</div>
                      <div className='text-2xl font-bold text-slate-900 dark:text-white mt-1'>
                        {formatParticipation(perfilTerritorio.indicadores.participacion_referencia)}
                      </div>
                    </div>
                    <div className='p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
                      <div className='text-xs text-slate-500 dark:text-slate-400 uppercase'>Diferencia vs Ref.</div>
                      <div className='text-2xl font-bold text-slate-900 dark:text-white mt-1'>
                        {formatVariation(perfilTerritorio.indicadores.diferencia_referencia_pp)}
                      </div>
                    </div>
                    <div className='p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
                      <div className='text-xs text-slate-500 dark:text-slate-400 uppercase'>Variación Histórica</div>
                      <div className='text-2xl font-bold text-slate-900 dark:text-white mt-1'>
                        {formatVariation(perfilTerritorio.indicadores.variacion_pp)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {perfilTerritorio.explicacion && (
                <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900'>
                  <p className='text-sm text-blue-900 dark:text-blue-300 leading-relaxed'>{perfilTerritorio.explicacion}</p>
                </div>
              )}
            </Card>
          )}

          {!territorioSeleccionado && (
            <div className='p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm'>
              <p className='text-slate-500 dark:text-slate-400 text-sm'>
                Selecciona una entidad federativa en el selector superior para consultar su diagnóstico y perfil cívico detallado.
              </p>
            </div>
          )}
        </div>

        <div>
          <Card title='Catálogo de Perfiles Estadísticos'>
            <ul className='space-y-3'>
              {perfiles.map((p) => (
                <li key={p.id} className='p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm font-bold text-slate-900 dark:text-white'>{p.nombre}</span>
                    <span className={'shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-bold border ' + getProfileBadgeStyle(p.codigo)}>
                      {p.codigo}
                    </span>
                  </div>
                  <p className='text-xs text-slate-600 dark:text-slate-400 leading-relaxed'>{p.descripcion}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
