from pydantic import ConfigDict, BaseModel
from typing import Optional, List


class ComparacionHistoricaOut(BaseModel):
    id: int
    eleccion_inicial_id: int
    eleccion_inicial_anio: int
    eleccion_final_id: int
    eleccion_final_anio: int
    territorio_id: int
    territorio_nombre: str
    segmento_id: int
    segmento_codigo: str
    participacion_inicial: Optional[float] = None
    participacion_final: Optional[float] = None
    variacion_pp: Optional[float] = None
    estado_compatibilidad: str

    model_config = ConfigDict(from_attributes=True)


class ComparacionSolicitud(BaseModel):
    eleccion_inicial_id: int
    eleccion_final_id: int
    territorio_id: int
    segmento_id: Optional[int] = None  # None = segmento general


class TendenciaTerritorioOut(BaseModel):
    territorio_id: int
    territorio_nombre: str
    variacion_pp: float
    tendencia: str  # INCREMENTO, ESTABILIDAD, DESCENSO

    model_config = ConfigDict(from_attributes=True)