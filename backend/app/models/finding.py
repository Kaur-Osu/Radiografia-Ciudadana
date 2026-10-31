from sqlalchemy import Column, BigInteger, Integer, ForeignKey, DateTime, Text, String
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.sql import func

from app.database import Base


class Hallazgo(Base):
    __tablename__ = "hallazgos"

    id = Column(BigInteger, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    interpretacion = Column(Text, nullable=True)
    limitaciones = Column(Text, nullable=True)
    posibles_acciones = Column(Text, nullable=True)
    territorio_id = Column(BigInteger, ForeignKey("territorios.id"), nullable=True, index=True)
    eleccion_id = Column(Integer, ForeignKey("elecciones.id"), nullable=True, index=True)
    perfil_id = Column(Integer, ForeignKey("perfiles.id"), nullable=True, index=True)
    estado = Column(String(30), nullable=False, default="BORRADOR", index=True)
    fecha_creacion = Column(DateTime, server_default=func.now())
    fecha_publicacion = Column(DateTime, nullable=True)
    autor_id = Column(Integer, nullable=True)