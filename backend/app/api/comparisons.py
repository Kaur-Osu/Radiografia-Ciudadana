from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.comparison import ComparacionHistorica
from app.models.election import Eleccion
from app.models.territory import Territorio
from app.services.participation_service import calcular_variacion_historica
from app.schemas.comparison import ComparacionHistoricaOut, ComparacionSolicitud

router = APIRouter(prefix="/comparaciones", tags=["comparaciones"])


@router.post("", response_model=ComparacionHistoricaOut)
def calcular_comparacion(
    solicitud: ComparacionSolicitud,
    db: Session = Depends(get_db),
):
    """
    Calcula la variación de participación entre dos elecciones para un territorio.
    """
    # Validar elecciones
    ei = db.query(Eleccion).filter(Eleccion.id == solicitud.eleccion_inicial_id).first()
    ef = db.query(Eleccion).filter(Eleccion.id == solicitud.eleccion_final_id).first()
    if not ei or not ef:
        raise HTTPException(status_code=404, detail="Una de las elecciones no existe")

    # Validar territorio
    territorio = (
        db.query(Territorio).filter(Territorio.id == solicitud.territorio_id).first()
    )
    if solicitud.eleccion_inicial_id == solicitud.eleccion_final_id:
        raise HTTPException(status_code=422, detail="Selecciona dos elecciones distintas")
    if not territorio and solicitud.territorio_id != 0:
        raise HTTPException(status_code=404, detail="Territorio no encontrado")

    segmento_id = solicitud.segmento_id

    resultado = calcular_variacion_historica(
        db,
        territorio_id=solicitud.territorio_id,
        eleccion_inicial_id=solicitud.eleccion_inicial_id,
        eleccion_final_id=solicitud.eleccion_final_id,
        segmento_id=segmento_id,
    )

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="No hay datos suficientes para calcular la comparación",
        )

    return ComparacionHistoricaOut(**{k: v for k, v in resultado.items() if k != 'tendencia'})


@router.get("/territorio/{territorio_id}", response_model=List[ComparacionHistoricaOut])
def comparaciones_territorio(
    territorio_id: int,
    eleccion_inicial: int = Query(..., description="ID elección inicial"),
    eleccion_final: int = Query(..., description="ID elección final"),
    db: Session = Depends(get_db),
):
    """Lista comparaciones históricas para un territorio."""
    if eleccion_inicial == eleccion_final:
        raise HTTPException(status_code=422, detail="Selecciona dos elecciones distintas")
    resultado = calcular_variacion_historica(db, territorio_id, eleccion_inicial, eleccion_final)
    if not resultado:
        raise HTTPException(status_code=404, detail="No hay datos para esta comparación")
    return [ComparacionHistoricaOut(**{k: v for k, v in resultado.items() if k != 'tendencia'})]
