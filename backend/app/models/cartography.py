from sqlalchemy import Column, Integer, BigInteger, String, Date, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class VersionCartografica(Base):
    __tablename__ = 'versiones_cartograficas'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    fecha_corte = Column(Date)
    fuente_id = Column(BigInteger)
    descripcion = Column(Text)
    fecha_registro = Column(DateTime, server_default=func.now())
