import { Link } from 'react-router-dom';
import { MapPin, CalendarDays, Database, Vote, CircleMinus, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
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


  const election = elecciones.find(item => item.id === eleccionSeleccionada);
  const previous = historico.filter(item => item.anio < (election?.anio ?? 0)).sort((a,b) => b.anio-a.anio)[0];
  const variation = previous?.participacion_pct != null && resumen?.participacion_pct != null ? resumen.participacion_pct-previous.participacion_pct : null;
  const highest = [...mapa].filter(item => item.participacion_pct != null).sort((a,b) => (b.participacion_pct ?? 0)-(a.participacion_pct ?? 0))[0];

  if (loading) return <Spinner />;

  const selector = <select aria-label="Elección" value={eleccionSeleccionada ?? ''} onChange={event => selectElection(Number(event.target.value))}>
    {elecciones.map(item => <option key={item.id} value={item.id}>{item.anio} - {item.nombre}</option>)}
  </select>;

  if (error) return <div className="space-y-8">
    <PageHeader title="Panel General" description="Explora la participación electoral en México con datos abiertos del INE.">{selector}</PageHeader>
    <div role="alert" className="p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg text-sm">{error}</div>
  </div>;

  return <div className="space-y-7">
    <section className="home-hero">
      <div>
        <p className="eyebrow">OBSERVAR LOS DATOS. COMPRENDER LA PARTICIPACIÓN.</p>
        <h1>Panel General</h1>
        <p className="hero-lead">Una mirada a cómo participa México.</p>
        <p className="page-description">Explora el territorio, compara elecciones y descubre los patrones de participación ciudadana a partir de datos abiertos del INE.</p>
        <div className="hero-meta"><span><MapPin size={12} />32 entidades federativas</span><span><CalendarDays size={12} />2018 · 2021 · 2024</span><span><Database size={12} />Fuente: INE</span></div>
      </div>
      <div className="hero-election">
        <label className="field-label">Proceso electoral seleccionado</label>
        <div className="hero-year"><strong>{election?.anio ?? '—'}</strong><span>Elección federal<br />Datos censales</span></div>
        {selector}
      </div>
    </section>

    {warnings.length > 0 && <div role="status" className="rounded-lg p-4 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs">{warnings.join(' · ')}</div>}

    {resumen && <div className="kpi-grid">{[
      {label:'Participación', value:formatParticipation(resumen.participacion_pct), note:'Con marca de voto, respecto a la lista nominal', icon:Vote},
      {label:'Sin marca de voto', value:formatParticipation(resumen.abstencion_pct), note:'No votaron o no especificado (NV + NS)', icon:CircleMinus},
      {label:'Electores', value:formatNumber(resumen.electores), note:'Personas registradas en la lista nominal', icon:Users},
      {label:'Variación', value:formatVariation(variation), note:'Frente a la elección anterior disponible', icon:TrendingUp},
    ].map(({label,value,note,icon:Icon}) => <section className="kpi-card" key={label}><h2 className="kpi-heading">{label}<Icon strokeWidth={1.5}/></h2><p className="kpi-value">{value}</p><p className="kpi-note">{note}</p></section>)}</div>}

    <div><p className="section-caption">El territorio en cifras</p><div className="home-analysis">
      <Card title="Mapa de Participación por Entidad"><MexicoChoropleth data={mapa} title="Participación por Entidad Federativa" /></Card>
      <Card title="Ranking de Entidades"><p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Las 10 entidades con mayor participación</p><EntityRankingChart data={mapa} limit={10}/></Card>
    </div></div>

    <div><p className="section-caption">Una lectura a través del tiempo</p><div className="home-bottom">
      <Card title="Evolución Histórica de Participación"><ParticipationLineChart data={historico}/></Card>
      <Card title="Hallazgos de la elección seleccionada">
        <p className="insight-intro">{highest ? `${highest.territorio_nombre} registra la mayor participación: ${formatParticipation(highest.participacion_pct)}.` : 'Sin datos disponibles.'}</p>
        <p className="insight-note">Estos indicadores describen la participación observada. Las diferencias entre elecciones requieren considerar su contexto.</p>
        <Link className="text-link" to="/explorador">Explorar todas las entidades <ArrowUpRight size={14}/></Link><br />
        <Link className="text-link" to="/metodologia">Cómo se leen estos datos <ArrowUpRight size={14}/></Link>
      </Card>
    </div></div>
  </div>;
}
