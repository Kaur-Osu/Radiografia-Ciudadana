from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.participation_service import (
    get_participacion_por_territorio,
    get_evolucion_historica,
    calcular_variacion_historica,
)
from app.schemas.participation import IndicadorTerritorio
from app.schemas.comparison import ComparacionHistoricaOut

router = APIRouter(prefix="/participacion", tags=["participacion"])


@router.get("/mapa", response_model=List[IndicadorTerritorio])
def mapa_participacion(
    eleccion_id: int = Query(..., description="ID de la elección"),
    nivel: str = Query("ENTIDAD", description="Nivel territorial (ENTIDAD, MUNICIPIO, etc.)"),
    segmento_id: Optional[int] = Query(None, description="ID del segmento demográfico"),
    db: Session = Depends(get_db),
):
    """Obtiene datos de participación para el mapa coroplético."""
    return get_participacion_por_territorio(
        db,
        eleccion_id=eleccion_id,
        tipo_territorio=nivel,
        segmento_id=segmento_id,
    )


@router.get("/territorio/{territorio_id}/historico")
def evolucion_territorio(
    territorio_id: int,
    segmento_id: Optional[int] = Query(None, description="ID del segmento demográfico"),
    db: Session = Depends(get_db),
):
    """Obtiene la evolución histórica de participación de un territorio."""
    datos = get_evolucion_historica(db, territorio_id=territorio_id, segmento_id=segmento_id)
    if not datos:
        raise HTTPException(
            status_code=404,
            detail="No hay datos históricos para este territorio",
        )
    return {"territorio_id": territorio_id, "datos": datos}


@router.get("/comparar", response_model=ComparacionHistoricaOut)
def comparar_elecciones(
    eleccion_inicial: int = Query(..., description="ID de la elección inicial"),
    eleccion_final: int = Query(..., description="ID de la elección final"),
    territorio_id: int = Query(..., description="ID del territorio"),
    segmento_id: Optional[int] = Query(None, description="ID del segmento demográfico"),
    db: Session = Depends(get_db),
):
    """Compara la participación entre dos elecciones para un territorio."""
    if eleccion_inicial == eleccion_final:
        raise HTTPException(status_code=422, detail="Selecciona dos elecciones distintas")
    resultado = calcular_variacion_historica(
        db,
        territorio_id=territorio_id,
        eleccion_inicial_id=eleccion_inicial,
        eleccion_final_id=eleccion_final,
        segmento_id=segmento_id,
    )
    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="No se pudo calcular la comparación (faltan datos)",
        )
    return resultado