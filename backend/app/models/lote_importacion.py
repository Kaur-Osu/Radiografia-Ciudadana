from sqlalchemy import Column, BigInteger, Integer, ForeignKey, DateTime, String, Text
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.sql import func

from app.database import Base


class LoteImportacion(Base):
    __tablename__ = "lotes_importacion"

    id = Column(BigInteger, primary_key=True, index=True)
    fuente_id = Column(BigInteger, ForeignKey("fuentes_datos.id"), nullable=False)
    usuario_id = Column(Integer, nullable=True)
    fecha_inicio = Column(DateTime, server_default=func.now())
    fecha_fin = Column(DateTime, nullable=True)
    registros_leidos = Column(BigInteger, nullable=False, default=0)
    registros_validos = Column(BigInteger, nullable=False, default=0)
    registros_rechazados = Column(BigInteger, nullable=False, default=0)
    estado = Column(String(30), nullable=False, default="EN_PROCESO")
    errores_json = Column(JSON, nullable=True)