from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.profile import Perfil, ReglaPerfil, PerfilAsignado
from app.models.territory import Territorio
from app.models.election import Eleccion
from app.services.participation_service import (
    calcular_variacion_historica,
    get_participacion_por_territorio,
    get_participacion_nacional,
)


def clasificar_perfil_simple(
    participacion_actual: float,
    participacion_referencia: float,
    variacion_pp: Optional[float],
    umbral_nivel: float = 5.0,
    umbral_cambio: float = 3.0,
) -> str:
    """
    Reglas básicas de clasificación de perfiles (MVP).
    Retorna el código del perfil.
    """
    diferencia = participacion_actual - participacion_referencia

    if variacion_pp is not None:
        if variacion_pp > umbral_cambio:
            return "PERF-02"  # Participación en crecimiento
        if variacion_pp < -umbral_cambio:
            return "PERF-03"  # Participación en descenso

    if diferencia >= umbral_nivel and (variacion_pp is None or abs(variacion_pp) <= umbral_cambio):
        return "PERF-01"  # Participación alta y sostenida

    if diferencia <= -umbral_nivel:
        return "PERF-04"

    return "PERF-05"  # Participación próxima a la referencia nacional


def get_perfil_territorio(
    db: Session,
    territorio_id: int,
    eleccion_referencia_id: int,
) -> Optional[Dict[str, Any]]:
    """
    Obtiene el perfil asignado a un territorio para una elección de referencia,
    calculándolo si no existe aún (motor semiautomático MVP).
    """
    # Si no existe, calcular uno básico (MVP)
    # Obtener participación del territorio en la elección referencia
    participaciones = get_participacion_por_territorio(
        db, eleccion_referencia_id, territorio_id=territorio_id, segmento_id=None
    )
    if not participaciones:
        return None

    partic = participaciones[0]
    if partic.participacion_pct is None:
        return None
    participacion_actual = partic.participacion_pct

    # Obtener participación nacional como referencia
    nacional = get_participacion_nacional(db, eleccion_referencia_id, segmento_id=None)
    if not nacional or nacional.participacion_pct is None:
        return None
    participacion_ref = nacional.participacion_pct

    # Obtener variación histórica (si hay elección anterior)
    eleccion_ref = (
        db.query(Eleccion).filter(Eleccion.id == eleccion_referencia_id).first()
    )
    variacion_pp = None
    if eleccion_ref:
        # Buscar elección anterior activa
        eleccion_ant = (
            db.query(Eleccion)
            .filter(Eleccion.anio < eleccion_ref.anio, Eleccion.activa == True)  # noqa: E712
            .order_by(Eleccion.anio.desc())
            .first()
        )
        if eleccion_ant:
            variacion_data = calcular_variacion_historica(
                db, territorio_id, eleccion_ant.id, eleccion_referencia_id, segmento_id=None
            )
            if variacion_data:
                variacion_pp = variacion_data["variacion_pp"]

    perfil_codigo = clasificar_perfil_simple(
        participacion_actual, participacion_ref, variacion_pp
    )

    perfil = db.query(Perfil).filter(Perfil.codigo == perfil_codigo).first()

    return {
        "territorio_id": territorio_id,
        "territorio_nombre": partic.territorio_nombre,
        "eleccion_referencia_id": eleccion_referencia_id,
        "perfil_id": perfil.id if perfil else None,
        "perfil_codigo": perfil.codigo if perfil else perfil_codigo,
        "perfil_nombre": perfil.nombre if perfil else perfil_codigo,
        "es_principal": True,
        "indicadores": {
            "participacion_actual": participacion_actual,
            "participacion_referencia": participacion_ref,
            "diferencia_referencia_pp": round(participacion_actual - participacion_ref, 2),
            "variacion_pp": variacion_pp,
        },
        "explicacion": f"Perfil calculado automáticamente con reglas MVP (umbrales: nivel ±{5.0}pp, cambio ±{3.0}pp).",
        "regla_codigo": None,
        "regla_version": None,
    }


def listar_perfiles(db: Session) -> List[Perfil]:
    """Lista todos los perfiles activos."""
    return db.query(Perfil).filter(Perfil.activo == True).all()  # noqa: E712