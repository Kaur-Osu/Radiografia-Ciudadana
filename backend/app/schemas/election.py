from pydantic import ConfigDict, BaseModel
from typing import Optional
from datetime import date


class EleccionBase(BaseModel):
    anio: int
    nombre: str
    tipo: str = "FEDERAL"
    fecha_eleccion: Optional[date] = None
    descripcion: Optional[str] = None
    activa: bool = True


class EleccionOut(EleccionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class EleccionResumenOut(BaseModel):
    id: int
    anio: int
    nombre: str
    tipo: str
    participacion_pct: Optional[float] = None
    abstencion_pct: Optional[float] = None
    electores: Optional[int] = None
    votantes: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)