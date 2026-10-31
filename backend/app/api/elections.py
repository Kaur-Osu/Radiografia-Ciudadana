from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.election import Eleccion
from app.schemas.election import EleccionOut, EleccionResumenOut
from app.services.participation_service import get_participacion_nacional

router = APIRouter(prefix="/elecciones", tags=["elecciones"])


@router.get("", response_model=List[EleccionOut])
def listar_elecciones(
    db: Session = Depends(get_db),
    solo_activas: bool = Query(True, description="Solo mostrar elecciones activas"),
):
    """Lista todas las elecciones disponibles."""
    query = db.query(Eleccion)
    if solo_activas:
        query = query.filter(Eleccion.activa == True)  # noqa: E712
    return query.order_by(Eleccion.anio).all()


@router.get("/{eleccion_id}", response_model=EleccionOut)
def obtener_eleccion(eleccion_id: int, db: Session = Depends(get_db)):
    """Obtiene una elección por su ID."""
    eleccion = db.query(Eleccion).filter(Eleccion.id == eleccion_id).first()
    if not eleccion:
        raise HTTPException(status_code=404, detail="Elección no encontrada")
    return eleccion


@router.get("/{eleccion_id}/resumen", response_model=EleccionResumenOut)
def resumen_eleccion(
    eleccion_id: int,
    segmento_id: Optional[int] = Query(None, description="ID del segmento demográfico"),
    db: Session = Depends(get_db),
):
    """Obtiene el resumen de participación para una elección."""
    eleccion = db.query(Eleccion).filter(Eleccion.id == eleccion_id).first()
    if not eleccion:
        raise HTTPException(status_code=404, detail="Elección no encontrada")

    nacional = get_participacion_nacional(db, eleccion_id, segmento_id=segmento_id)

    return EleccionResumenOut(
        id=eleccion.id,
        anio=eleccion.anio,
        nombre=eleccion.nombre,
        tipo=eleccion.tipo,
        participacion_pct=nacional.participacion_pct if nacional else None,
        abstencion_pct=nacional.abstencion_pct if nacional else None,
        electores=nacional.electores if nacional else None,
        votantes=nacional.votantes if nacional else None,
    )