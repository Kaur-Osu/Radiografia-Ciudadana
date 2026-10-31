export interface Eleccion {
  id: number;
  anio: number;
  nombre: string;
  tipo: string;
  fecha_eleccion?: string;
  descripcion?: string;
  activa: boolean;
  fecha_registro?: string;
}

export interface Territorio {
  id: number;
  clave: string;
  nombre: string;
  tipo: string;
  version_cartografica_id?: number;
  padre_id?: number;
  fecha_registro?: string;
}

export interface TerritorioConParticipacion extends Territorio {
  participacion_pct?: number | null;
  abstencion_pct?: number | null;
  electores?: number | null;
  votantes?: number | null;
  diferencia_referencia_pp?: number | null;
}

export interface IndicadorTerritorio {
  territorio_id: number;
  territorio_nombre: string;
  territorio_clave?: string;
  participacion_pct?: number | null;
  abstencion_pct?: number | null;
  electores?: number | null;
  votantes?: number | null;
}

export interface EleccionResumen {
  id: number;
  anio: number;
  nombre: string;
  tipo: string;
  participacion_pct?: number | null;
  abstencion_pct?: number | null;
  electores?: number | null;
  votantes?: number | null;
}

export interface ComparacionHistorica {
  id: number;
  eleccion_inicial_id: number;
  eleccion_inicial_anio: number;
  eleccion_final_id: number;
  eleccion_final_anio: number;
  territorio_id: number;
  territorio_nombre: string;
  segmento_id: number;
  segmento_codigo: string;
  participacion_inicial?: number | null;
  participacion_final?: number | null;
  variacion_pp?: number | null;
  estado_compatibilidad: string;
}

export interface Perfil {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface PerfilAsignadoOut {
  territorio_id: number;
  territorio_nombre: string;
  eleccion_referencia_id: number;
  perfil_id: number;
  perfil_codigo: string;
  perfil_nombre: string;
  es_principal: boolean;
  indicadores?: Record<string, number | null> | null;
  explicacion?: string | null;
  regla_codigo?: string | null;
  regla_version?: number | null;
}

export interface PerfilTerritorioOut {
  territorio_id: number;
  territorio_nombre: string;
  eleccion_referencia_id: number;
  eleccion_referencia_anio: number;
  perfil_principal: Perfil | null;
  perfiles_secundarios: Perfil[];
  indicadores?: Record<string, number | null> | null;
  explicacion?: string | null;
}

export interface EvolucionDato {
  anio: number;
  participacion_pct?: number | null;
  abstencion_pct?: number | null;
  electores?: number;
  votantes?: number;
}

export interface ApiError {
  detail: string;
}