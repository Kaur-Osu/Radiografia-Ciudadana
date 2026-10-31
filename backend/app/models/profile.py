from sqlalchemy import Column, BigInteger, Integer, ForeignKey, DateTime, Text, String, Boolean
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.sql import func

from app.database import Base


class Perfil(Base):
    __tablename__ = "perfiles"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(30), unique=True, nullable=False, index=True)
    nombre = Column(String(120), nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, nullable=False, default=True, index=True)
    fecha_creacion = Column(DateTime, server_default=func.now())


class ReglaPerfil(Base):
    __tablename__ = "reglas_perfil"

    id = Column(BigInteger, primary_key=True, index=True)
    perfil_id = Column(Integer, ForeignKey("perfiles.id"), nullable=False, index=True)
    codigo_regla = Column(String(50), nullable=False)
    version = Column(Integer, nullable=False, default=1)
    parametros_json = Column(JSON, nullable=True)
    descripcion = Column(Text, nullable=True)
    activa = Column(Boolean, nullable=False, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())


class PerfilAsignado(Base):
    __tablename__ = "perfiles_asignados"

    id = Column(BigInteger, primary_key=True, index=True)
    territorio_id = Column(BigInteger, ForeignKey("territorios.id"), nullable=False, index=True)
    perfil_id = Column(Integer, ForeignKey("perfiles.id"), nullable=False, index=True)
    eleccion_referencia_id = Column(Integer, ForeignKey("elecciones.id"), nullable=False, index=True)
    regla_id = Column(BigInteger, ForeignKey("reglas_perfil.id"), nullable=True)
    es_principal = Column(Boolean, nullable=False, default=False)
    indicadores_json = Column(JSON, nullable=True)
    explicacion = Column(Text, nullable=True)
    fecha_asignacion = Column(DateTime, server_default=func.now())