from sqlalchemy import Column, BigInteger, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Territorio(Base):
    __tablename__ = "territorios"

    id = Column(BigInteger, primary_key=True, index=True)
    clave = Column(String(30), nullable=False)
    nombre = Column(String(150), nullable=False)
    tipo = Column(String(30), nullable=False, index=True)
    version_cartografica_id = Column(Integer, ForeignKey("versiones_cartograficas.id"), nullable=True)
    geometria = Column(Text, nullable=True)  # JSON string
    padre_id = Column(BigInteger, ForeignKey("territorios.id"), nullable=True)
    fecha_registro = Column(DateTime, server_default=func.now())

    padre = relationship("Territorio", remote_side=[id], backref="hijos")