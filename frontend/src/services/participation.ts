import api from './api';
import type { IndicadorTerritorio, ComparacionHistorica, EvolucionDato } from '../types';

export const participationService = {
  mapa: async (
    eleccionId: number,
    nivel: string = 'ENTIDAD',
    segmentoId?: number
  ): Promise<IndicadorTerritorio[]> => {
    const params: Record<string, string> = {
      eleccion_id: String(eleccionId),
      nivel,
    };
    if (segmentoId) params.segmento_id = String(segmentoId);
    const { data } = await api.get<IndicadorTerritorio[]>('/participacion/mapa', { params });
    return data;
  },

  historico: async (
    territorioId: number,
    segmentoId?: number
  ): Promise<{ territorio_id: number; datos: EvolucionDato[] }> => {
    const params: Record<string, string> = {};
    if (segmentoId) params.segmento_id = String(segmentoId);
    const { data } = await api.get(
      `/participacion/territorio/${territorioId}/historico`,
      { params }
    );
    return data;
  },

  comparar: async (
    eleccionInicial: number,
    eleccionFinal: number,
    territorioId: number,
    segmentoId?: number
  ): Promise<ComparacionHistorica> => {
    const params: Record<string, string> = {
      eleccion_inicial: String(eleccionInicial),
      eleccion_final: String(eleccionFinal),
      territorio_id: String(territorioId),
    };
    if (segmentoId) params.segmento_id = String(segmentoId);
    const { data } = await api.get<ComparacionHistorica>('/participacion/comparar', {
      params,
    });
    return data;
  },
};