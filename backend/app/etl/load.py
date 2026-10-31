from __future__ import annotations

import logging
from typing import Optional

import pandas as pd
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal, engine
from app.models.election import Eleccion
from app.models.territory import Territorio
from app.models.demographic import SegmentoDemografico, GrupoDemografico
from app.models.participation import ParticipacionElectoral
from app.models.fuente_datos import FuenteDatos  # type: ignore
from app.models.lote_importacion import LoteImportacion  # type: ignore

logger = logging.getLogger(__name__)


def asegurar_eleccion(
    db: Session, anio: int, nombre: str, tipo: str = "FEDERAL"
) -> int:
    """Inserta o recupera una elección, devolviendo su ID."""
    eleccion = (
        db.query(Eleccion).filter(Eleccion.anio == anio).first()
    )
    if eleccion:
        return eleccion.id

    eleccion = Eleccion(
        anio=anio,
        nombre=nombre,
        tipo=tipo,
        activa=True,
    )
    db.add(eleccion)
    db.flush()
    logger.info(f"Elección creada: {anio} - {nombre} (ID={eleccion.id})")
    return eleccion.id


def asegurar_territorio(
    db: Session,
    clave: str,
    nombre: str,
    tipo: str,
    version_cartografica_id: Optional[int] = None,
) -> int:
    """Inserta o recupera un territorio, devolviendo su ID."""
    territorio = (
        db.query(Territorio)
        .filter(
            Territorio.clave == clave,
            Territorio.tipo == tipo,
        )
        .first()
    )
    if territorio:
        return territorio.id

    territorio = Territorio(
        clave=clave,
        nombre=nombre,
        tipo=tipo,
        version_cartografica_id=version_cartografica_id,
    )
    db.add(territorio)
    db.flush()
    logger.debug(f"Territorio creado: {clave} - {nombre} ({tipo}) ID={territorio.id}")
    return territorio.id


def asegurar_segmento_general(db: Session) -> int:
    """Asegura que exista el segmento GENERAL, devolviendo su ID."""
    segmento = (
        db.query(SegmentoDemografico)
        .filter(SegmentoDemografico.codigo == "GENERAL")
        .first()
    )
    if segmento:
        return segmento.id

    segmento = SegmentoDemografico(
        codigo="GENERAL",
        descripcion="Población general sin desagregación demográfica.",
        es_general=True,
    )
    db.add(segmento)
    db.flush()
    logger.info("Segmento GENERAL creado")
    return segmento.id


def cargar_dataframe(
    db: Session,
    df: pd.DataFrame,
    eleccion_id: int,
    fuente_id: int,
    lote_id: int,
) -> dict[str, int]:
    """
    Carga un DataFrame validado a la tabla participacion_electoral.
    Solo inserta filas del segmento GENERAL (agregadas por entidad).
    Retorna estadísticas de carga.
    """
    segment_id = asegurar_segmento_general(db)
    general = df[df["sexo"] == "GENERAL"].copy()
    grouped = general.groupby("clave_entidad", dropna=False)[["electores", "votantes"]].sum()
    count = 0
    for clave, values in grouped.iterrows():
        if values.electores < 0 or values.votantes < 0 or values.votantes > values.electores:
            raise ValueError(f"Conteos inválidos para {clave}")
        territory = db.query(Territorio).filter_by(clave=str(clave).zfill(2), tipo="ENTIDAD").one()
        row = db.query(ParticipacionElectoral).filter_by(eleccion_id=eleccion_id,
            territorio_id=territory.id, segmento_id=segment_id).first()
        if not row:
            row = ParticipacionElectoral(eleccion_id=eleccion_id, territorio_id=territory.id, segmento_id=segment_id)
            db.add(row)
        row.electores, row.votantes = int(values.electores), int(values.votantes)
        row.fuente_id, row.lote_importacion_id = fuente_id, lote_id
        count += 1
    db.flush()
    return dict(registros_intentados=len(grouped), registros_insertados=count, registros_omitidos=0, errores=0)


def ejecutar_carga_completa(
    df: pd.DataFrame,
    anio_eleccion: int,
    nombre_eleccion: str,
    fuente_id: int,
    lote_id: int,
    db: Optional[Session] = None,
) -> dict[str, int]:
    """
    Ejecuta la carga completa de un DataFrame a MySQL.
    Si se pasa db, se usa esa sesión; si no, se crea una nueva.
    """
    db_propia = db is None
    if db_propia:
        db = SessionLocal()
    try:
        eleccion_id = asegurar_eleccion(
            db, anio=anio_eleccion, nombre=nombre_eleccion
        )

        estadisticas = cargar_dataframe(
            db=db,
            df=df,
            eleccion_id=eleccion_id,
            fuente_id=fuente_id,
            lote_id=lote_id,
        )
        if db_propia:
            db.commit()
        return estadisticas
    except Exception:
        if db_propia:
            db.rollback()
        raise
    finally:
        if db_propia:
            db.close()