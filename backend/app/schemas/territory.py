from pydantic import ConfigDict, BaseModel
from typing import Optional, List


class TerritorioBase(BaseModel):
    clave: str
    nombre: str
    tipo: str
    version_cartografica_id: Optional[int] = None
    padre_id: Optional[int] = None


class TerritorioOut(TerritorioBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TerritorioParticipacionOut(BaseModel):
    id: int
    clave: str
    nombre: str
    tipo: str
    participacion_pct: Optional[float] = None
    abstencion_pct: Optional[float] = None
    electores: Optional[int] = None
    votantes: Optional[int] = None
    diferencia_referencia_pp: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class TerritorioConParticipacion(TerritorioOut):
    participacion_pct: Optional[float] = None
    abstencion_pct: Optional[float] = None
    electores: Optional[int] = None
    votantes: Optional[int] = None
    diferencia_referencia_pp: Optional[float] = None