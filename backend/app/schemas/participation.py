from pydantic import ConfigDict, BaseModel
from typing import Optional, List


class IndicadorParticipacionOut(BaseModel):
    territorio_id: int
    territorio_nombre: str
    eleccion_id: int
    eleccion_anio: int
    segmento_id: int
    segmento_codigo: str
    electores: int
    votantes: int
    participacion_pct: float
    abstencion_pct: float

    model_config = ConfigDict(from_attributes=True)


class MapaParticipacionOut(BaseModel):
    eleccion_id: int
    nivel: str
    indicador: str
    territorios: List[IndicadorParticipacionOut]

    model_config = ConfigDict(from_attributes=True)


class EvolucionHistoricaOut(BaseModel):
    territorio_id: int
    territorio_nombre: str
    segmento_id: int
    segmento_codigo: str
    datos: List[dict]  # [{anio, participacion_pct, abstencion_pct}]

    model_config = ConfigDict(from_attributes=True)


class IndicadorTerritorio(BaseModel):
    territorio_id: int
    territorio_nombre: str
    territorio_clave: Optional[str] = None
    participacion_pct: Optional[float] = None
    abstencion_pct: Optional[float] = None
    electores: Optional[int] = None
    votantes: Optional[int] = None