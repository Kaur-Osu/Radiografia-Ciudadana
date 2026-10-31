from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.profile import Perfil
from app.models.election import Eleccion
from app.schemas.profile import PerfilOut, PerfilTerritorioOut
from app.services import profile_service as profile_svc

router = APIRouter(prefix="/perfiles", tags=["perfiles"])


@router.get("", response_model=List[PerfilOut])
def listar_perfiles_api(db: Session = Depends(get_db)):
    """Lista todos los perfiles descriptivos disponibles."""
    return profile_svc.listar_perfiles(db)


@router.get("/{perfil_id}", response_model=PerfilOut)
def obtener_perfil(perfil_id: int, db: Session = Depends(get_db)):
    """Obtiene un perfil por su ID."""
    perfil = db.query(Perfil).filter(Perfil.id == perfil_id).first()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return perfil


@router.get("/territorio/{territorio_id}", response_model=PerfilTerritorioOut)
def perfil_territorio(
    territorio_id: int,
    eleccion_referencia: int = Query(..., description="ID de la elección de referencia"),
    db: Session = Depends(get_db),
):
    """
    Obtiene el perfil descriptivo de un territorio para una elección de referencia.
    Si no existe asignado, lo calcula con reglas MVP.
    """
    resultado = profile_svc.get_perfil_territorio(
        db, territorio_id=territorio_id, eleccion_referencia_id=eleccion_referencia
    )
    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="No se pudo determinar el perfil para este territorio",
        )

    perfil_principal = None
    perfiles_secundarios = []

    if resultado.get("perfil_id"):
        perfil_obj = (
            db.query(Perfil).filter(Perfil.id == resultado["perfil_id"]).first()
        )
        if perfil_obj:
            perfil_principal = PerfilOut.model_validate(perfil_obj)

    return PerfilTerritorioOut(
        territorio_id=resultado["territorio_id"],
        territorio_nombre=resultado["territorio_nombre"],
        eleccion_referencia_id=resultado["eleccion_referencia_id"],
        eleccion_referencia_anio=db.get(Eleccion, eleccion_referencia).anio,
        perfil_principal=perfil_principal,
        perfiles_secundarios=perfiles_secundarios,
        indicadores=resultado.get("indicadores"),
        explicacion=resultado.get("explicacion"),
    )