from sqlalchemy import Column, BigInteger, String, Text, Date, DateTime, CHAR
from sqlalchemy.sql import func

from app.database import Base


class FuenteDatos(Base):
    __tablename__ = "fuentes_datos"

    id = Column(BigInteger, primary_key=True, index=True)
    institucion = Column(String(150), nullable=False, default="INE")
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    url_oficial = Column(Text, nullable=True)
    nombre_archivo = Column(String(255), nullable=True)
    hash_sha256 = Column(CHAR(64), nullable=True, unique=True)
    fecha_publicacion = Column(Date, nullable=True)
    fecha_descarga = Column(DateTime, nullable=True)
    version = Column(String(50), nullable=True)
    fecha_registro = Column(DateTime, server_default=func.now())