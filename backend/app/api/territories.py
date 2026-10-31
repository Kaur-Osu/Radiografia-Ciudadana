from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.territory import Territorio
from app.schemas.territory import TerritorioOut, TerritorioConParticipacion
from app.services.participation_service import (
    get_participacion_por_territorio,
    get_participacion_nacional,
)

router = APIRouter(prefix="/territorios", tags=["territorios"])


@router.get("", response_model=List[TerritorioOut])
def listar_territorios(
    db: Session = Depends(get_db),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo: ENTIDAD, MUNICIPIO, etc."),
    clave: Optional[str] = Query(None, description="Clave INE del territorio"),
):
    """Listar territorios con filtros opcionales."""
    query = db.query(Territorio)
    if tipo:
        query = query.filter(Territorio.tipo == tipo)
    if clave:
        query = query.filter(Territorio.clave == clave)
    return query.order_by(Territorio.nombre).all()


@router.get("/{territorio_id}", response_model=TerritorioOut)
def obtener_territorio(territorio_id: int, db: Session = Depends(get_db)):
    """Obtener un territorio por su ID."""
    territorio = db.query(Territorio).filter(Territorio.id == territorio_id).first()
    if not territorio:
        raise HTTPException(status_code=404, detail="Territorio no encontrado")
    return territorio


@router.get("/{territorio_id}/participacion", response_model=TerritorioConParticipacion)
def participacion_territorio(
    territorio_id: int,
    eleccion_id: int = Query(..., description="ID de la elección"),
    segmento_id: Optional[int] = Query(None, description="ID del segmento demográfico"),
    db: Session = Depends(get_db),
):
    """Participación y abstención de un territorio en una elección específica."""
    territorio = db.query(Territorio).filter(Territorio.id == territorio_id).first()
    if not territorio:
        raise HTTPException(status_code=404, detail="Territorio no encontrado")

    indicadores = get_participacion_por_territorio(
        db, eleccion_id=eleccion_id, territorio_id=territorio_id, segmento_id=segmento_id
    )

    if not indicadores:
        raise HTTPException(
            status_code=404,
            detail="No hay datos de participación para este territorio y elección",
        )

    ind = indicadores[0]

    # Calcular diferencia vs referencia nacional
    diferencia_referencia_pp = None
    if ind.participacion_pct is not None:
        nacional = get_participacion_nacional(db, eleccion_id, segmento_id=segmento_id)
        if nacional and nacional.participacion_pct is not None:
            diferencia_referencia_pp = round(
                ind.participacion_pct - nacional.participacion_pct, 2
            )

    return TerritorioConParticipacion(
        id=territorio.id,
        clave=territorio.clave,
        nombre=territorio.nombre,
        tipo=territorio.tipo,
        version_cartografica_id=territorio.version_cartografica_id,
        padre_id=territorio.padre_id,
        fecha_registro=str(territorio.fecha_registro) if territorio.fecha_registro else None,
        participacion_pct=ind.participacion_pct,
        abstencion_pct=ind.abstencion_pct,
        electores=ind.electores,
        votantes=ind.votantes,
        diferencia_referencia_pp=diferencia_referencia_pp,
    )