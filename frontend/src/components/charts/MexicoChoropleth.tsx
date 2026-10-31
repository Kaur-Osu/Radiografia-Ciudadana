import { useEffect, useState } from 'react';
import { MapContainer, AttributionControl, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import type { IndicadorTerritorio } from '@/types';
import { formatParticipation, formatNumber } from '@/utils/formatters';
import 'leaflet/dist/leaflet.css';
import { validateMexicoGeoJSON } from '@/utils/geojson';

interface Props {
  data: IndicadorTerritorio[];
  title?: string;
  onSelect?: (territorio: IndicadorTerritorio) => void;
}

function color(value?: number | null) {
  return value == null ? '#94a3b8' : value >= 80 ? '#16a34a' : value >= 60 ? '#2563eb' : value >= 40 ? '#ca8a04' : value >= 20 ? '#f97316' : '#ef4444';
}

function FitMexico({ geojson }: { geojson: FeatureCollection }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.geoJSON(geojson).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [12, 12] });
    map.invalidateSize();
  }, [map, geojson]);
  return null;
}

export function MexicoChoropleth({ data, title = 'Participación por entidad federativa', onSelect }: Props) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/geojson/mexico_entidades_simplificado.geojson`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((value: unknown) => { setGeojson(validateMexicoGeoJSON(value)); })
      .catch((err: unknown) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Error de geometrías'); });
    return () => controller.abort();
  }, []);
  const byKey = new Map(data.map(d => [Number(d.territorio_clave), d]));
  const getIndicator = (feature?: Feature) => byKey.get(Number(feature?.properties?.clave_entidad));
  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    const indicator = getIndicator(feature);
    // DOM text prevents names supplied by a source file from being interpreted as HTML.
    const popup = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = indicator?.territorio_nombre ?? String(feature.properties?.nombre ?? 'Sin nombre');
    popup.append(name);
    for (const text of [`Participación: ${formatParticipation(indicator?.participacion_pct)}`, `Electores: ${formatNumber(indicator?.electores)}`, `Votantes: ${formatNumber(indicator?.votantes)}`]) {
      const line = document.createElement('div'); line.textContent = text; popup.append(line);
    }
    layer.bindPopup(popup);
    if (indicator && onSelect) layer.on('click', () => onSelect(indicator));
  };
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-3 bg-white dark:bg-slate-900"><h3 className="font-semibold text-sm">{title}</h3><p className="text-xs text-slate-500 dark:text-slate-400">{data.length} entidades · Datos del INE</p></div>
      <div className="relative h-[420px] bg-slate-100 dark:bg-slate-800">
        {error ? <p role="alert" className="p-4 text-red-700 dark:text-red-300">Error cargando el mapa: {error}</p> : !geojson ? <p className="p-4">Cargando geometrías…</p> : (
          <MapContainer center={[23.6, -102.5]} zoom={5} className="h-full w-full" scrollWheelZoom={false} attributionControl={false}>
            <FitMexico geojson={geojson} />
            <AttributionControl position="bottomright" prefix='<a href="https://www.inegi.org.mx/servicios/catalogounico.html">INEGI · Marco Geoestadístico</a>' />
            <GeoJSON key={JSON.stringify(data)} data={geojson as GeoJsonObject} style={feature => ({ fillColor: color(getIndicator(feature)?.participacion_pct), fillOpacity: 0.8, color: '#334155', weight: 1 })} onEachFeature={onEachFeature} />
          </MapContainer>
        )}
      </div>
      <div className="flex flex-wrap gap-3 p-3 bg-white dark:bg-slate-900 text-xs" aria-label="Leyenda del mapa">
        {[[0, 'Menos de 20 %'], [20, '20–39.99 %'], [40, '40–59.99 %'], [60, '60–79.99 %'], [80, '80–100 %'], [null, 'Sin datos']].map(([value, label]) => <span key={label} className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{ background: color(value as number | null) }} />{label}</span>)}
      </div>
    </section>
  );
}
