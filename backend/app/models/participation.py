from sqlalchemy import Column, BigInteger, Integer, ForeignKey, DateTime, Numeric, String, CheckConstraint
from sqlalchemy.sql import func

from app.database import Base


class ParticipacionElectoral(Base):
    __tablename__ = "participacion_electoral"

    id = Column(BigInteger, primary_key=True, index=True)
    eleccion_id = Column(Integer, ForeignKey("elecciones.id"), nullable=False, index=True)
    territorio_id = Column(BigInteger, ForeignKey("territorios.id"), nullable=False, index=True)
    segmento_id = Column(BigInteger, ForeignKey("segmentos_demograficos.id"), nullable=False, index=True)
    fuente_id = Column(BigInteger, nullable=False)
    lote_importacion_id = Column(BigInteger, nullable=True)
    electores = Column(BigInteger, nullable=False, default=0)
    votantes = Column(BigInteger, nullable=False, default=0)
    fecha_registro = Column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint("electores >= 0", name="chk_participacion_electores_no_negativo"),
        CheckConstraint("votantes >= 0", name="chk_participacion_votantes_no_negativo"),
        CheckConstraint("votantes <= electores", name="chk_participacion_votantes_menor_igual_electores"),
    )


class IndicadorCalculado(Base):
    __tablename__ = "indicadores_calculados"

    id = Column(BigInteger, primary_key=True, index=True)
    eleccion_id = Column(Integer, ForeignKey("elecciones.id"), nullable=False, index=True)
    territorio_id = Column(BigInteger, ForeignKey("territorios.id"), nullable=False, index=True)
    segmento_id = Column(BigInteger, ForeignKey("segmentos_demograficos.id"), nullable=False, index=True)
    codigo_indicador = Column(String(50), nullable=False, index=True)
    valor = Column(Numeric(12, 4), nullable=False)
    metodologia_id = Column(Integer, nullable=False)
    fecha_calculo = Column(DateTime, server_default=func.now())