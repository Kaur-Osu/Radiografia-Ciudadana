import api from './api';
import type { Eleccion, EleccionResumen } from '../types';

export const electionsService = {
  listar: async (): Promise<Eleccion[]> => {
    const { data } = await api.get<Eleccion[]>('/elecciones');
    return data;
  },

  obtener: async (id: number): Promise<Eleccion> => {
    const { data } = await api.get<Eleccion>(`/elecciones/${id}`);
    return data;
  },

  resumen: async (id: number): Promise<EleccionResumen> => {
    const { data } = await api.get<EleccionResumen>(`/elecciones/${id}/resumen`);
    return data;
  },
};