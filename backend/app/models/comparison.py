from sqlalchemy import Column, BigInteger, Integer, ForeignKey, DateTime, Numeric, String
from sqlalchemy.sql import func

from app.database import Base


class ComparacionHistorica(Base):
    __tablename__ = "comparaciones_historicas"

    id = Column(BigInteger, primary_key=True, index=True)
    eleccion_inicial_id = Column(Integer, ForeignKey("elecciones.id"), nullable=False, index=True)
    eleccion_final_id = Column(Integer, ForeignKey("elecciones.id"), nullable=False, index=True)
    territorio_id = Column(BigInteger, ForeignKey("territorios.id"), nullable=False, index=True)
    segmento_id = Column(BigInteger, ForeignKey("segmentos_demograficos.id"), nullable=False, index=True)
    participacion_inicial = Column(Numeric(7, 4), nullable=True)
    participacion_final = Column(Numeric(7, 4), nullable=True)
    variacion_pp = Column(Numeric(8, 4), nullable=True)
    metodologia_id = Column(Integer, nullable=False)
    estado_compatibilidad = Column(String(30), nullable=False, default="COMPATIBLE")
    fecha_calculo = Column(DateTime, server_default=func.now())