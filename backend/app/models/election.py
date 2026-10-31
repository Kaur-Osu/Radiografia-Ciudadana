from sqlalchemy import Column, Integer, SmallInteger, String, Date, Text, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Eleccion(Base):
    __tablename__ = "elecciones"

    id = Column(Integer, primary_key=True, index=True)
    anio = Column(SmallInteger, unique=True, nullable=False, index=True)
    nombre = Column(String(150), nullable=False)
    tipo = Column(String(50), nullable=False, default="FEDERAL")
    fecha_eleccion = Column(Date, nullable=True)
    descripcion = Column(Text, nullable=True)
    activa = Column(Boolean, nullable=False, default=True, index=True)
    fecha_registro = Column(DateTime, server_default=func.now())