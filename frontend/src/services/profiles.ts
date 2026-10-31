import api from './api';
import type { Perfil, PerfilTerritorioOut } from '../types';

export const profilesService = {
  listar: async (): Promise<Perfil[]> => {
    const { data } = await api.get<Perfil[]>('/perfiles');
    return data;
  },

  obtener: async (id: number): Promise<Perfil> => {
    const { data } = await api.get<Perfil>(`/perfiles/${id}`);
    return data;
  },

  obtenerPorTerritorio: async (
    territorioId: number,
    eleccionReferencia: number
  ): Promise<PerfilTerritorioOut> => {
    const { data } = await api.get<PerfilTerritorioOut>(
      `/perfiles/territorio/${territorioId}`,
      { params: { eleccion_referencia: String(eleccionReferencia) } }
    );
    return data;
  },
};