from pydantic import ConfigDict, BaseModel
from typing import Optional, List, Dict, Any


class PerfilBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True


class PerfilOut(PerfilBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PerfilAsignadoOut(BaseModel):
    territorio_id: int
    territorio_nombre: str
    eleccion_referencia_id: int
    eleccion_referencia_anio: int
    perfil_id: int
    perfil_codigo: str
    perfil_nombre: str
    es_principal: bool
    indicadores: Optional[Dict[str, Any]] = None
    explicacion: Optional[str] = None
    regla_codigo: Optional[str] = None
    regla_version: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class PerfilTerritorioOut(BaseModel):
    territorio_id: int
    territorio_nombre: str
    eleccion_referencia_id: int
    eleccion_referencia_anio: int
    perfil_principal: Optional[PerfilOut] = None
    perfiles_secundarios: List[PerfilOut] = []
    indicadores: Optional[Dict[str, Any]] = None
    explicacion: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)