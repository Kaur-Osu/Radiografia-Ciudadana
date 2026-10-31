import { PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/common/Modal';
import { errorMessage } from '@/services/errors';
import type { Eleccion, IndicadorTerritorio } from '@/types';
import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { electionsService } from '@/services/elections';
import { participationService } from '@/services/participation';
import { MexicoChoropleth } from '@/components/charts/MexicoChoropleth';
import { EntityRankingChart } from '@/components/charts/EntityRankingChart';
import { formatParticipation, formatNumber } from '@/utils/formatters';

export function Explorer() {
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [eleccionSeleccionada, setEleccionSeleccionada] = useState<number | null>(null);
  const [datosMapa, setDatosMapa] = useState<IndicadorTerritorio[]>([]);
  const [territorioSeleccionado, setTerritorioSeleccionado] = useState<IndicadorTerritorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    electionsService.listar().then(data => {
      if (active) { setElecciones(data); setEleccionSeleccionada(data.at(-1)?.id ?? null); if (!data.length) { setError('No hay elecciones disponibles.'); setLoading(false); } }
    }).catch(err => { if (active) { setError(errorMessage(err)); setLoading(false); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!eleccionSeleccionada) return;
    let active = true;
    participationService.mapa(eleccionSeleccionada, 'ENTIDAD')
      .then(data => { if (active) setDatosMapa(data); })
      .catch(err => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [eleccionSeleccionada]);

  useEffect(() => {
    if (!territorioSeleccionado) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setTerritorioSeleccionado(null); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [territorioSeleccionado]);

  const selectElection = (id: number) => {
    setError(null); setLoading(true); setDatosMapa([]); setTerritorioSeleccionado(null); setEleccionSeleccionada(id);
  };

  if (loading && datosMapa.length === 0) return <Spinner className='mx-auto mt-20' />;

  return (
    <div className='space-y-8 pb-12'>
      <PageHeader title="Explorador Territorial" description="Cada territorio cuenta una historia. Consulta la participación de las 32 entidades y abre su ficha para conocer los detalles." eyebrow="LA PARTICIPACIÓN, EN EL MAPA">
        <label className="field-label">Elección</label>
        <select aria-label="Elección"
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
      </PageHeader>

      {error && (
        <div className='p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-sm'>
          {error}
        </div>
      )}

      {territorioSeleccionado && (
        <Modal title='Ficha de entidad' onClose={() => setTerritorioSeleccionado(null)}><div className='bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-xl shadow-lg border border-blue-800'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4'>
            <div>
              <span className='text-xs uppercase tracking-wider text-blue-300 font-semibold'>Entidad Federativa Seleccionada</span>
              <h2 className='text-2xl font-extrabold tracking-tight mt-0.5'>{territorioSeleccionado.territorio_nombre}</h2>
            </div>
            <div className='flex items-center gap-2'>
              <span className='px-3 py-1 bg-blue-800/80 text-blue-200 rounded-full text-xs font-mono'>
                Clave INE: {territorioSeleccionado.territorio_clave}
              </span>
              <button
                onClick={() => setTerritorioSeleccionado(null)}
                className='text-xs text-slate-400 hover:text-white underline px-2 py-1'
              >
                Cerrar ficha
              </button>
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-blue-800/60'>
            <div className='bg-blue-950/50 p-4 rounded-lg border border-blue-800/40'>
              <span className='text-xs text-blue-300 block uppercase'>Participación</span>
              <span className='text-3xl font-bold text-white mt-1 block'>{formatParticipation(territorioSeleccionado.participacion_pct)}</span>
            </div>
            <div className='bg-blue-950/50 p-4 rounded-lg border border-blue-800/40'>
              <span className='text-xs text-blue-300 block uppercase'>Sin marca de voto</span>
              <span className='text-3xl font-bold text-slate-200 mt-1 block'>{formatParticipation(territorioSeleccionado.abstencion_pct)}</span>
            </div>
            <div className='bg-blue-950/50 p-4 rounded-lg border border-blue-800/40'>
              <span className='text-xs text-blue-300 block uppercase'>Electores (Lista Nominal)</span>
              <span className='text-2xl font-bold text-slate-200 mt-1 block'>{formatNumber(territorioSeleccionado.electores)}</span>
            </div>
            <div className='bg-blue-950/50 p-4 rounded-lg border border-blue-800/40'>
              <span className='text-xs text-blue-300 block uppercase'>Votantes Totales</span>
              <span className='text-2xl font-bold text-slate-200 mt-1 block'>{formatNumber(territorioSeleccionado.votantes)}</span>
            </div>
          </div>
        </div></Modal>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <Card title='Mapa Coroplético de Participación (INE)'>
            <MexicoChoropleth onSelect={setTerritorioSeleccionado} data={datosMapa} title='Distribución Nacional de Participación' />
          </Card>
        </div>
        <div>
          <Card title='Ranking de las 32 Entidades'>
            <EntityRankingChart data={datosMapa} title='Entidades Federativas' limit={32} />
          </Card>
        </div>
      </div>

      <Card title='Listado Completo de Entidades Federativas'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm text-slate-700 dark:text-slate-300'>
            <thead className='bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase text-xs font-semibold'>
              <tr>
                <th className='p-3'>Clave</th>
                <th className='p-3'>Entidad Federativa</th>
                <th className='p-3 text-right'>Electores</th>
                <th className='p-3 text-right'>Votantes</th>
                <th className='p-3 text-right'>Participación</th>
                <th className='p-3 text-right'>Sin marca de voto</th>
                <th className='p-3 text-center'>Acción</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
              {datosMapa.map((t) => (
                <tr
                  key={t.territorio_id}
                  onClick={() => setTerritorioSeleccionado(t)}
                  className='hover:bg-blue-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors'
                >
                  <td className='p-3 font-mono font-semibold text-slate-500'>{t.territorio_clave}</td>
                  <td className='p-3 font-bold text-slate-900 dark:text-white'>{t.territorio_nombre}</td>
                  <td className='p-3 text-right font-mono'>{formatNumber(t.electores)}</td>
                  <td className='p-3 text-right font-mono'>{formatNumber(t.votantes)}</td>
                  <td className='p-3 text-right font-mono font-bold text-blue-700 dark:text-blue-400'>
                    {formatParticipation(t.participacion_pct)}
                  </td>
                  <td className='p-3 text-right font-mono text-slate-500'>{formatParticipation(t.abstencion_pct)}</td>
                  <td className='p-3 text-center'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTerritorioSeleccionado(t);
                      }}
                      className='px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded text-xs font-semibold hover:bg-blue-200 transition-colors'
                    >
                      Ver ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
