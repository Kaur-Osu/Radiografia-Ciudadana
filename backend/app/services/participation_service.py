"""GENERAL indicators with no duplication across territorial levels."""
from sqlalchemy.orm import Session
from app.models.participation import ParticipacionElectoral
from app.models.territory import Territorio
from app.models.election import Eleccion
from app.models.demographic import SegmentoDemografico
from app.schemas.participation import IndicadorTerritorio

def calcular_participacion_pct(votantes, electores):
    if electores is None or votantes is None or electores <= 0:
        return None
    return round(float(votantes) / float(electores) * 100, 2)

def calcular_abstencion_pct(votantes, electores):
    pct = calcular_participacion_pct(votantes, electores)
    return None if pct is None else round(100 - pct, 2)

def _query(db, eleccion_id, segmento_id=None):
    q = db.query(ParticipacionElectoral).join(Territorio).filter(ParticipacionElectoral.eleccion_id == eleccion_id)
    if segmento_id is None:
        q = q.join(SegmentoDemografico).filter(SegmentoDemografico.codigo == 'GENERAL')
    else:
        q = q.filter(ParticipacionElectoral.segmento_id == segmento_id)
    return q

def _indicador(territorio_id, nombre, clave, electores, votantes):
    return IndicadorTerritorio(territorio_id=territorio_id, territorio_nombre=nombre, territorio_clave=clave,
        electores=int(electores), votantes=int(votantes), participacion_pct=calcular_participacion_pct(votantes, electores),
        abstencion_pct=calcular_abstencion_pct(votantes, electores))

def get_participacion_por_territorio(db, eleccion_id, territorio_id=None, segmento_id=None, tipo_territorio=None):
    territory = db.get(Territorio, territorio_id) if territorio_id else None
    if territorio_id == 0 or (territory and territory.tipo == 'NACIONAL'):
        nacional = get_participacion_nacional(db, eleccion_id, segmento_id)
        return [nacional] if nacional else []
    q = _query(db, eleccion_id, segmento_id)
    if territorio_id is not None:
        q = q.filter(ParticipacionElectoral.territorio_id == territorio_id)
    if tipo_territorio:
        q = q.filter(Territorio.tipo == tipo_territorio)
    rows = q.add_entity(Territorio).order_by(Territorio.clave).all()
    return [_indicador(t.id, t.nombre, t.clave, p.electores, p.votantes) for p, t in rows]

def get_participacion_nacional(db, eleccion_id, segmento_id=None):
    q = _query(db, eleccion_id, segmento_id)
    states = q.filter(Territorio.tipo == 'ENTIDAD').add_entity(Territorio).all()
    if len(states) == 32 and {t.clave for _,t in states} == {f'{i:02}' for i in range(1,33)}:
        return _indicador(0, 'MÉXICO (NACIONAL)', '00', sum(p.electores for p,_ in states), sum(p.votantes for p,_ in states))
    national = q.filter(Territorio.tipo == 'NACIONAL').first()
    if national:
        return _indicador(0, 'MÉXICO (NACIONAL)', '00', national.electores, national.votantes)
    return None

def get_evolucion_historica(db, territorio_id, segmento_id=None):
    territory = db.get(Territorio, territorio_id) if territorio_id else None
    national = territorio_id == 0 or (territory and territory.tipo == 'NACIONAL')
    result = []
    for election in db.query(Eleccion).filter(Eleccion.activa.is_(True)).order_by(Eleccion.anio):
        if national:
            indicator = get_participacion_nacional(db, election.id, segmento_id)
        else:
            rows = get_participacion_por_territorio(db, election.id, territorio_id, segmento_id)
            indicator = rows[0] if rows else None
        if indicator:
            result.append(dict(anio=election.anio, participacion_pct=indicator.participacion_pct,
                abstencion_pct=indicator.abstencion_pct, electores=indicator.electores, votantes=indicator.votantes))
    return result

def calcular_variacion_historica(db, territorio_id, eleccion_inicial_id, eleccion_final_id, segmento_id=None):
    ei, ef = db.get(Eleccion, eleccion_inicial_id), db.get(Eleccion, eleccion_final_id)
    if not ei or not ef:
        return None
    def get_indicator(election_id):
        rows = get_participacion_por_territorio(db, election_id, territorio_id, segmento_id)
        return rows[0] if rows else None
    initial, final = get_indicator(ei.id), get_indicator(ef.id)
    if not initial or not final or initial.participacion_pct is None or final.participacion_pct is None:
        return None
    segment = db.get(SegmentoDemografico, segmento_id) if segmento_id else db.query(SegmentoDemografico).filter_by(codigo='GENERAL').one()
    variation = round(final.participacion_pct - initial.participacion_pct, 2)
    return dict(id=0, eleccion_inicial_id=ei.id, eleccion_inicial_anio=ei.anio,
        eleccion_final_id=ef.id, eleccion_final_anio=ef.anio, territorio_id=territorio_id,
        territorio_nombre=final.territorio_nombre, segmento_id=segment.id, segmento_codigo=segment.codigo,
        participacion_inicial=initial.participacion_pct, participacion_final=final.participacion_pct,
        variacion_pp=variation, estado_compatibilidad='COMPATIBLE',
        tendencia='INCREMENTO' if variation > 3 else 'DESCENSO' if variation < -3 else 'ESTABILIDAD')
