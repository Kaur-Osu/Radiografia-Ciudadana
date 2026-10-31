import api from './api';
import type { Territorio, TerritorioConParticipacion } from '../types';

export const territoriesService = {
  listar: async (tipo?: string, clave?: string): Promise<Territorio[]> => {
    const params: Record<string, string> = {};
    if (tipo) params.tipo = tipo;
    if (clave) params.clave = clave;
    const { data } = await api.get<Territorio[]>('/territorios', { params });
    return data;
  },

  obtener: async (id: number): Promise<Territorio> => {
    const { data } = await api.get<Territorio>(`/territorios/${id}`);
    return data;
  },

  participacion: async (
    territorioId: number,
    eleccionId: number,
    segmentoId?: number
  ): Promise<TerritorioConParticipacion> => {
    const params: Record<string, string> = { eleccion_id: String(eleccionId) };
    if (segmentoId) params.segmento_id = String(segmentoId);
    const { data } = await api.get<TerritorioConParticipacion>(
      `/territorios/${territorioId}/participacion`,
      { params }
    );
    return data;
  },
};