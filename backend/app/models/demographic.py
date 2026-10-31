from sqlalchemy import Column, Integer, String, Text, BigInteger, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class GrupoDemografico(Base):
    __tablename__ = "grupos_demograficos"

    id = Column(Integer, primary_key=True, index=True)
    dimension = Column(String(40), nullable=False, index=True)
    codigo = Column(String(40), nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    orden = Column(Integer, nullable=False, default=0)
    fecha_registro = Column(DateTime, server_default=func.now())


class SegmentoDemografico(Base):
    __tablename__ = "segmentos_demograficos"

    id = Column(BigInteger, primary_key=True, index=True)
    codigo = Column(String(100), unique=True, nullable=False, index=True)
    descripcion = Column(String(200), nullable=True)
    es_general = Column(Boolean, nullable=False, default=False, index=True)
    fecha_registro = Column(DateTime, server_default=func.now())