type Row = Record<string, unknown>;
const object = (value: unknown): value is Row => !!value && typeof value === 'object' && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const integer = (value: unknown) => number(value) && Number.isSafeInteger(value) && value >= 0;
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const optionalNumber = (value: unknown) => value == null || number(value);
const percentage = (value: unknown) => value == null || number(value) && value >= 0 && value <= 100;
const array = (value: unknown, valid: (row: Row) => boolean) => Array.isArray(value) && value.every(row => object(row) && valid(row));

export function validateApiResponse(url: string, data: unknown): void {
  let valid = true;
  if (url === '/elecciones') valid = array(data, row => integer(row.id) && integer(row.anio) && text(row.nombre));
  else if (url === '/territorios') valid = array(data, row => integer(row.id) && text(row.clave) && text(row.nombre));
  else if (url === '/perfiles') valid = array(data, row => integer(row.id) && text(row.codigo) && text(row.nombre));
  else if (url === '/participacion/mapa') valid = array(data, row => integer(row.territorio_id) && text(row.territorio_nombre) && percentage(row.participacion_pct) && percentage(row.abstencion_pct));
  else if (url.endsWith('/historico')) valid = object(data) && array(data.datos, row => integer(row.anio) && percentage(row.participacion_pct));
  else if (url === '/participacion/comparar') valid = object(data) && integer(data.eleccion_inicial_anio) && integer(data.eleccion_final_anio) && text(data.territorio_nombre) && percentage(data.participacion_inicial) && percentage(data.participacion_final) && optionalNumber(data.variacion_pp);
  else if (/^\/elecciones\/\d+\/resumen$/.test(url)) valid = object(data) && integer(data.id) && percentage(data.participacion_pct) && percentage(data.abstencion_pct) && optionalNumber(data.electores);
  else if (/^\/perfiles\/territorio\//.test(url)) valid = object(data) && text(data.territorio_nombre) && (data.perfil_principal == null || object(data.perfil_principal) && text(data.perfil_principal.codigo) && text(data.perfil_principal.nombre)) && (data.indicadores == null || object(data.indicadores) && Object.values(data.indicadores).every(optionalNumber));
  if (!valid) throw new Error('El servidor devolvió datos inválidos. Intenta recargar la página.');
}
