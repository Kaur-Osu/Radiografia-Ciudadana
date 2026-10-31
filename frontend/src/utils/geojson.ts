import type { FeatureCollection } from 'geojson';

function validRing(ring: unknown): boolean {
  if (!Array.isArray(ring) || ring.length < 4) return false;
  if (!ring.every(point => Array.isArray(point) && point.length >= 2 && point.length <= 3 && point.every(Number.isFinite) && Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90)) return false;
  return ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1];
}
function validPolygon(polygon: unknown): boolean {
  return Array.isArray(polygon) && polygon.length > 0 && polygon.every(validRing);
}
export function validateMexicoGeoJSON(input: unknown): FeatureCollection {
  const value = input as FeatureCollection | null;
  if (!value || value.type !== 'FeatureCollection' || !Array.isArray(value.features) || value.features.length !== 32) throw new Error('Geometrías incompletas');
  const keys = new Set<string>();
  for (const feature of value.features) {
    const key = String(feature?.properties?.clave_entidad ?? '').padStart(2, '0');
    if (feature?.type !== 'Feature' || !/^(0[1-9]|[12][0-9]|3[0-2])$/.test(key) || keys.has(key)) throw new Error('Geometrías con claves inválidas o duplicadas');
    keys.add(key);
    const geometry = feature.geometry;
    if (!geometry || !(geometry.type === 'Polygon' && validPolygon(geometry.coordinates) || geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0 && geometry.coordinates.every(validPolygon))) throw new Error('Geometría inválida en el mapa');
  }
  return value;
}
